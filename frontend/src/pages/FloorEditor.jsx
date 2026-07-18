import { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Save,
    Undo2,
    Redo2,
    Building2,
    Layers3,
    BedDouble,
    Radar,
    Image,
} from "lucide-react";

import EditorToolbar from "../components/editor/EditorToolbar";
import EditorCanvas from "../components/editor/EditorCanvas";
import RoomEditor from "../components/editor/RoomEditor";
import RoomProperty from "../components/editor/RoomProperty";

import { useDashboardStore } from "../store/useDashboardStore";

function FloorEditor() {

    const navigate = useNavigate();

    const { floorId } = useParams();

    const { state } = useLocation();

    const floors = useDashboardStore((s) => s.hospital.floors);
    const saveFloorRooms = useDashboardStore((s) => s.saveFloorRooms);

    // store에 이미 존재하는 층이면 그 데이터가 최신 정본(正本)이다.
    // (새로 만든 층으로 처음 진입하는 극히 드문 케이스에 한해 router state로 폴백)
    const floor =
        floors.find((f) => f.id === floorId) ||
        state?.floor || {
            id: floorId,
            name: "Floor",
            floorMap: { type: "image", src: null, width: 1000, height: 700 },
            rooms: [],
        };

    const [background, setBackground] = useState(
        floor.floorMap?.src || floor.image || null
    );

    const [rooms, setRooms] = useState(
        floor.rooms
    );

    const [selectedRoom, setSelectedRoom] = useState(null);

    const [zoom, setZoom] = useState(100);

    const [grid, setGrid] = useState(true);

    const [snap, setSnap] = useState(false);

    const canvasRef = useRef(null);

    const roomCount = rooms.length;

    const sensorCount = useMemo(() => {

        return rooms.reduce(

            (sum, room) =>

                sum +

                (room.sensors?.length || 0),

            0

        );

    }, [rooms]);

    const bedCount = useMemo(() => {

        return rooms.filter((room) => room.type === "patient" || !room.type).length;

    }, [rooms]);

    const saveFloor = () => {

        saveFloorRooms(floorId, rooms, { src: background });

        alert("저장되었습니다. 대시보드에도 즉시 반영됩니다.");

    };

    const undo = () => {

        canvasRef.current?.undo();

    };

    const redo = () => {

        canvasRef.current?.redo();

    };

    return (

        <div className="editor-page">

            <div className="editor-header">

                <div className="editor-header-left">

                    <button

                        className="toolbar-btn"

                        onClick={() =>

                            navigate("/hospital")

                        }

                    >

                        <ArrowLeft size={18} />

                        병원관리

                    </button>

                    <div>

                        <h1>

                            Floor Editor

                        </h1>

                        <span>

                            Floor ID :

                            {" "}

                            {floorId}

                        </span>

                    </div>

                </div>

                <div className="editor-header-right">

                    <div className="editor-summary">

                        <span>

                            <Layers3 size={16} />

                            {roomCount} Rooms

                        </span>

                        <span>

                            <Radar size={16} />

                            {sensorCount} Sensors

                        </span>

                        <span>

                            <BedDouble size={16} />

                            {bedCount} Beds

                        </span>

                    </div>

                    <button

                        className="toolbar-btn"

                        onClick={undo}

                    >

                        <Undo2 size={18} />

                        Undo

                    </button>

                    <button

                        className="toolbar-btn"

                        onClick={redo}

                    >

                        <Redo2 size={18} />

                        Redo

                    </button>

                    <button

                        className="toolbar-btn primary"

                        onClick={saveFloor}

                    >

                        <Save size={18} />

                        저장

                    </button>

                </div>

            </div>

            <div className="editor-floor-card">

                <div>

                    <Building2 size={18} />

                    <strong>

                        {floor.name}

                    </strong>

                </div>

                <div>

                    <Image size={18} />

                    {

                        background

                            ? "평면도 등록 완료"

                            : "평면도 없음"

                    }

                </div>

            </div>

            <EditorToolbar

                setBackground={setBackground}

                rooms={rooms}

                setRooms={setRooms}

                zoom={zoom}

                setZoom={setZoom}

                grid={grid}

                setGrid={setGrid}

                snap={snap}

                setSnap={setSnap}

                onUndo={undo}

                onRedo={redo}

            />

            <div className="editor-main">

                <RoomEditor

                    rooms={rooms}

                    selectedRoom={selectedRoom}

                    setSelectedRoom={setSelectedRoom}

                    setRooms={setRooms}

                />

                <EditorCanvas

                    ref={canvasRef}

                    background={background}

                    rooms={rooms}

                    setRooms={setRooms}

                    selectedRoom={selectedRoom}

                    setSelectedRoom={setSelectedRoom}

                    zoom={zoom}

                    onZoomChange={setZoom}

                    grid={grid}

                    snap={snap}

                />

                <RoomProperty

                    room={selectedRoom}

                    setRooms={setRooms}

                />

            </div>

            {

                rooms.length === 0 && (

                    <div className="editor-empty-banner">

                        병실이 없습니다.

                        Polygon을 그려 병실을 생성하세요.

                    </div>

                )

            }

            <div className="editor-footer">

                <div className="editor-footer-left">

                    <span>

                        Floor :

                        {" "}

                        {floor.name}

                    </span>

                    <span>

                        Rooms :

                        {" "}

                        {roomCount}

                    </span>

                    <span>

                        Sensors :

                        {" "}

                        {sensorCount}

                    </span>

                    <span>

                        Beds :

                        {" "}

                        {bedCount}

                    </span>

                </div>

                <div className="editor-footer-right">

                    <span>

                        Ready

                    </span>

                </div>

            </div>

        </div>

    );

}

export default FloorEditor;
