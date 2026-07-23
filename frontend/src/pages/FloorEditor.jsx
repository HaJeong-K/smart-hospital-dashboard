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
    Minus,
    DoorOpen,
    Footprints,
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
    const setHospital = useDashboardStore((s) => s.setHospital);

    // store에 이미 존재하는 층이면 그 데이터가 최신 정본(正本)이다.
    // (새로 만든 층으로 처음 진입하는 극히 드문 케이스에 한해 router state로 폴백)
    const floor =
        floors.find((f) => f.id === floorId) ||
        state?.floor || {
            id: floorId,
            name: "Floor",
            floorMap: { type: "image", src: null, width: 1000, height: 700 },
            rooms: [],
            walls: [],
            doors: [],
            structures: [],
        };

    // 평면도 업로드/제거는 이제 설정 > 병원·층·병동 관리에서만 가능하다 — Floor Editor는
    // store에 저장된 배경 이미지를 그대로 읽어서 그 위에 그리기만 한다(읽기 전용).
    const background = floor.floorMap?.src || floor.image || null;

    const [rooms, setRooms] = useState(
        floor.rooms
    );

    const [selectedRoom, setSelectedRoom] = useState(null);

    // 벽/문 — 방(room)과 달리 센서·환자와 무관한 순수 건물 구조 요소라 별도 배열로 관리한다
    // (2026-07-22 피드백 — 실제 건물 구조 표현).
    const [walls, setWalls] = useState(floor.walls || []);
    const [doors, setDoors] = useState(floor.doors || []);
    const [selectedWall, setSelectedWall] = useState(null);
    const [selectedDoor, setSelectedDoor] = useState(null);

    // 계단/엘리베이터 — 문(door)과 동일하게 방(room)이 아닌 순수 구조 심볼로 별도 관리한다
    // (2026-07-22 피드백 — "문처럼 심볼을 두고 선택하게" 해달라는 요청 반영).
    const [structures, setStructures] = useState(floor.structures || []);
    const [selectedStructure, setSelectedStructure] = useState(null);

    const [zoom, setZoom] = useState(100);

    const [grid, setGrid] = useState(true);

    const [snap, setSnap] = useState(false);

    // "사각형"(드래그로 즉시 생성, draw.io 스타일)이 기본값 — 점을 하나씩 찍는 "다각형"
    // 모드보다 훨씬 간편해서 대부분의(직사각형) 병실은 이걸로 충분하다 (2026-07-22 피드백).
    const [drawMode, setDrawMode] = useState("rect");

    // 배치도 전체(방+벽+문)를 한꺼번에 감싸는 바운딩 박스 + 모서리 리사이즈 핸들을
    // 켜고 끄는 토글 — 켜져 있는 동안 모서리를 드래그하면 전체가 비율대로 확대/축소된다
    // (2026-07-22 피드백 — "전체 잡아서 드래그로 크기 늘리기").
    const [groupSelect, setGroupSelect] = useState(false);

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

    // RoomProperty에 넘길 "살아있는" 선택 방 — selectedRoom은 선택/생성된 시점의 스냅샷이라,
    // 그 이후 RoomProperty에서 값을 바꿔도(호실 번호 입력, 병상 수 +/- 등) rooms 배열은
    // 정상적으로 갱신되지만 selectedRoom 자체는 갱신되지 않아 입력창에 반영되지 않는(입력이
    // 안 먹는 것처럼 보이는) 버그가 있었다. rooms에서 매번 다시 찾아 최신 값을 넘긴다.
    const selectedRoomLive = useMemo(
        () => rooms.find((r) => r.id === selectedRoom?.id) || null,
        [rooms, selectedRoom],
    );

    const saveFloor = () => {

        saveFloorRooms(floorId, rooms, { src: background }, walls, doors, structures);

        alert("저장되었습니다. 대시보드에도 즉시 반영됩니다.");

    };

    // 층 이름은 방 배치(rooms/walls/doors)와 달리 "저장" 버튼을 눌러야 반영되는 초안이
    // 아니라, 설정 > 병원·층·병동 관리(FloorManager)의 이름 변경과 동일하게 즉시 store에
    // 반영한다 — 단순 메타데이터라 draft 개념을 둘 이유가 없다.
    const renameFloor = (value) => {

        setHospital((prev) => ({
            ...prev,
            floors: prev.floors.map((f) =>
                f.id === floorId ? { ...f, name: value } : f
            ),
        }));

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

                        <span>

                            <Minus size={16} />

                            {walls.length} Walls

                        </span>

                        <span>

                            <DoorOpen size={16} />

                            {doors.length} Doors

                        </span>

                        <span>

                            <Footprints size={16} />

                            {structures.length} Structures

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

                    <input
                        className="editor-floor-name-input"
                        value={floor.name}
                        onChange={(e) => renameFloor(e.target.value)}
                        placeholder="층 이름"
                    />

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

                drawMode={drawMode}

                setDrawMode={setDrawMode}

                groupSelect={groupSelect}

                setGroupSelect={setGroupSelect}

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

                    drawMode={drawMode}

                    walls={walls}

                    setWalls={setWalls}

                    doors={doors}

                    setDoors={setDoors}

                    selectedWall={selectedWall}

                    setSelectedWall={setSelectedWall}

                    selectedDoor={selectedDoor}

                    setSelectedDoor={setSelectedDoor}

                    structures={structures}

                    setStructures={setStructures}

                    selectedStructure={selectedStructure}

                    setSelectedStructure={setSelectedStructure}

                    groupSelect={groupSelect}

                />

                <RoomProperty

                    room={selectedRoomLive}

                    setRooms={setRooms}

                    rooms={rooms}

                    background={background}

                />

            </div>

            {

                rooms.length === 0 && (

                    <div className="editor-empty-banner">

                        병실이 없습니다.

                        캔버스를 클릭+드래그해서 병실을 생성하세요.

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

                    <span>

                        Walls :

                        {" "}

                        {walls.length}

                    </span>

                    <span>

                        Doors :

                        {" "}

                        {doors.length}

                    </span>

                    <span>

                        Structures :

                        {" "}

                        {structures.length}

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
