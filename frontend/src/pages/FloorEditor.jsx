import { useMemo, useState } from "react";
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

function FloorEditor() {

    const navigate = useNavigate();

    const { floorId } = useParams();

    const { state } = useLocation();

    const floor = state?.floor || {

        id: floorId,

        name: "Floor",

        image: null,

        rooms: [],

    };

    const [background, setBackground] = useState(

        floor.image

    );

    const [rooms, setRooms] = useState(

        floor.rooms

    );

    const [selectedRoom, setSelectedRoom] = useState(null);

    const [zoom, setZoom] = useState(100);

    const [grid, setGrid] = useState(true);

    const [snap, setSnap] = useState(false);

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

        return rooms.length;

    }, [rooms]);

    const saveFloor = () => {

        console.log({

            floorId,

            background,

            rooms,

        });

        alert("저장되었습니다.");

    };

    const undo = () => {

        console.log("UNDO");

    };

    const redo = () => {

        console.log("REDO");

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

                />

                <EditorCanvas

                    background={background}

                    rooms={rooms}

                    setRooms={setRooms}

                    selectedRoom={selectedRoom}

                    setSelectedRoom={setSelectedRoom}

                    zoom={zoom}

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