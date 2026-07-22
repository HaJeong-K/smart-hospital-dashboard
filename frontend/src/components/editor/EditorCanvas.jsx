import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";

import PolygonLayer from "./PolygonLayer";
import WallLayer from "./WallLayer";
import DoorLayer from "./DoorLayer";
import StructureLayer from "./StructureLayer";
import GroupResizeHandles from "./GroupResizeHandles";
import { createDrawnPatientRoom } from "../../data/floorsData";
import { createWall, createDoor, findNearestWallPoint, createStructure } from "../../utils/structureGeometry";

const GRID = 20;
const WALL_ANGLE_STEP = Math.PI / 4; // 45도 단위로 스냅 — 대부분의 벽은 수평/수직/45도 대각선

// 사각형 드래그 모드별 미리보기 색상 — 방(파랑)/사각형 벽(회색)/계단(보라)/엘리베이터(청록)를
// 구분해서 드래그 중에도 어떤 걸 만들고 있는지 헷갈리지 않도록 한다.
const RECT_PREVIEW_COLORS = {
    rect: { fill: "rgba(37,99,235,.18)", stroke: "#2563eb" },
    wallRect: { fill: "rgba(107,114,128,.18)", stroke: "#6b7280" },
    stairs: { fill: "rgba(124,58,237,.18)", stroke: "#7c3aed" },
    elevator: { fill: "rgba(13,148,136,.18)", stroke: "#0d9488" },
};

const STRUCTURE_MODES = new Set(["stairs", "elevator"]);

// 직전 점(from) 기준으로 to 방향을 가장 가까운 45도(수평/수직/대각선) 각도로 스냅한다.
// 거리는 실제 마우스 위치 그대로 유지하고 각도만 반듯하게 맞춘다 — 자유 곡선 벽을 손으로
// 그릴 때 미세하게 삐뚤어지는 문제를 해결한다(Shift를 누르면 스냅을 끄고 자유 각도로 그림).
function snapWallAngle(from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.hypot(dx, dy);
    if (dist === 0) return to;
    const angle = Math.round(Math.atan2(dy, dx) / WALL_ANGLE_STEP) * WALL_ANGLE_STEP;
    return {
        x: from.x + Math.cos(angle) * dist,
        y: from.y + Math.sin(angle) * dist,
    };
}

// zoom(%), grid(표시 여부), snap(격자 스냅 여부)는 상위(FloorEditor)의 툴바 상태와 동기화되는
// "제어(controlled)" 값이다. undo/redo는 ref를 통해 상위 툴바 버튼에서도 호출할 수 있도록
// forwardRef + useImperativeHandle로 노출한다.
// (이전에는 zoom/grid/snap props가 이 컴포넌트에서 아예 구독되지 않아 툴바 버튼이 캔버스에
//  아무 영향을 주지 못했고, undo/redo 버튼도 console.log만 찍는 스텁이었다.)
const EditorCanvas = forwardRef(function EditorCanvas(
    {
        background,
        rooms,
        setRooms,
        selectedRoom,
        setSelectedRoom,
        zoom = 100,
        onZoomChange = () => {},
        grid = true,
        snap = false,
        drawMode = "rect",
        walls = [],
        setWalls = () => {},
        doors = [],
        setDoors = () => {},
        selectedWall = null,
        setSelectedWall = () => {},
        selectedDoor = null,
        setSelectedDoor = () => {},
        structures = [],
        setStructures = () => {},
        selectedStructure = null,
        setSelectedStructure = () => {},
        groupSelect = false,
    },
    ref,
) {
    const svgRef = useRef(null);
    const contentRef = useRef(null); // 좌표 변환 기준 — 아래 getSvgPoint 참고
    const wrapperRef = useRef(null);

    const [drawing, setDrawing] = useState(false);
    const [draft, setDraft] = useState([]);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [spacePressed, setSpacePressed] = useState(false);
    const [panning, setPanning] = useState(false);
    const [mouse, setMouse] = useState({ x: 0, y: 0 });

    // 벽 그리기(다각형 방과 동일하게 점을 찍고 더블클릭으로 완료) — wallDraft.
    // wallPreviewPoint는 45도 각도 스냅이 적용된 "다음 점 미리보기" 위치(추적선 끝점).
    const [wallDrawing, setWallDrawing] = useState(false);
    const [wallDraft, setWallDraft] = useState([]);
    const [wallPreviewPoint, setWallPreviewPoint] = useState(null);

    // 사각형 드래그 모드(draw.io 스타일) — 클릭한 지점(rectStartRef)에서 드래그해서
    // 놓은 지점까지를 사각형 미리보기(rectPreview)로 보여주다가, 마우스를 놓는 순간
    // 그대로 방(patient room)을 생성한다. 점을 하나씩 찍어야 하는 기존 "다각형" 모드보다
    // 훨씬 빠르게 방을 만들 수 있다 (2026-07-22 피드백).
    const rectStartRef = useRef(null);
    const [rectPreview, setRectPreview] = useState(null);
    const MIN_RECT_SIZE = 8; // 캔버스 단위(1000x700 기준) — 실수로 클릭만 해도 방이 생기지 않도록

    const scale = zoom / 100;
    const setScalePercent = (percent) => onZoomChange(Math.max(20, Math.min(500, Math.round(percent))));

    const last = useRef({ x: 0, y: 0 });

    /* ===========================
       SPACE KEY (팬 모드 토글)
    =========================== */
    useEffect(() => {
        const keyDown = (e) => {
            if (e.code === "Space") {
                e.preventDefault();
                setSpacePressed(true);
            }
        };
        const keyUp = (e) => {
            if (e.code === "Space") {
                setSpacePressed(false);
            }
        };
        window.addEventListener("keydown", keyDown);
        window.addEventListener("keyup", keyUp);
        return () => {
            window.removeEventListener("keydown", keyDown);
            window.removeEventListener("keyup", keyUp);
        };
    }, []);

    /* ===========================
       좌표 변환
    =========================== */
    // 기존에는 "화면 픽셀 - 오프셋 → 나누기 scale"로 직접 계산했는데, 이 계산은 <svg>가
    // 실제로 화면에 렌더링된 픽셀 크기(예: 762x533)가 viewBox(1000x700)와 다르다는 점을
    // 반영하지 못해서, 화면 크기에 따라 클릭 지점과 실제 찍히는 위치가 어긋났다(문이
    // "옆으로" 찍히는 등). getScreenCTM()은 viewBox 스케일링까지 포함해 정확히 역변환해준다
    // — PolygonLayer/WallLayer가 이미 이 방식으로 정확하게 동작하고 있어 동일하게 맞췄다.
    const getSvgPoint = (event) => {
        const ctm = contentRef.current?.getScreenCTM();
        if (!ctm) return { x: 0, y: 0 };
        const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(ctm.inverse());
        return { x: point.x, y: point.y };
    };

    /* ===========================
       GRID SNAP (snap prop이 켜져 있을 때만 격자에 맞춘다)
    =========================== */
    const snapPoint = (point) => {
        if (!snap) return point;
        return {
            x: Math.round(point.x / GRID) * GRID,
            y: Math.round(point.y / GRID) * GRID,
        };
    };

    /* ===========================
       마우스 이벤트
    =========================== */
    const mouseDown = (e) => {
        if (spacePressed) {
            setPanning(true);
            last.current = { x: e.clientX, y: e.clientY };
            return;
        }
        if (e.button !== 0) return;
        // 더블클릭(벽/다각형 완료)의 두 번째 클릭이 mousedown으로도 잡혀서, 완료 직전에
        // 원치 않는 점이 하나 더 찍히는 문제가 있었다(벽이 삐뚤게 보이는 원인).
        // e.detail은 클릭 횟수(더블클릭=2)라 이 경우만 걸러낸다.
        if (e.detail > 1) return;

        const p = snapPoint(getSvgPoint(e));

        if (drawMode === "rect" || drawMode === "wallRect" || STRUCTURE_MODES.has(drawMode)) {
            rectStartRef.current = p;
            setRectPreview({ x: p.x, y: p.y, w: 0, h: 0 });
            return;
        }

        if (drawMode === "wall") {
            const last = wallDraft[wallDraft.length - 1];
            const target = last && !e.shiftKey ? snapWallAngle(last, p) : p;
            setWallDraft((prev) => [...prev, target]);
            setWallDrawing(true);
            return;
        }

        if (drawMode === "door") {
            // 문은 격자 스냅이 아니라 "가장 가까운 벽 위의 지점"에 스냅된다 — grid-snap이
            // 적용되지 않은 원본 좌표를 기준으로 가장 가까운 벽 세그먼트를 찾는다.
            const raw = getSvgPoint(e);
            const nearest = findNearestWallPoint(walls, raw.x, raw.y);
            if (!nearest) return; // 벽이 하나도 없으면 문을 놓을 수 없다
            const door = createDoor(nearest.x, nearest.y, nearest.angle);
            setDoors((prev) => [...prev, door]);
            setSelectedDoor(door);
            return;
        }

        setDraft((prev) => [...prev, p]);
        setDrawing(true);
    };

    const mouseMove = (e) => {
        const p = getSvgPoint(e);
        setMouse({ x: p.x, y: p.y });

        if ((drawMode === "rect" || drawMode === "wallRect" || STRUCTURE_MODES.has(drawMode)) && rectStartRef.current) {
            const sp = snapPoint(p);
            const start = rectStartRef.current;
            setRectPreview({
                x: Math.min(start.x, sp.x),
                y: Math.min(start.y, sp.y),
                w: Math.abs(sp.x - start.x),
                h: Math.abs(sp.y - start.y),
            });
        }

        if (drawMode === "wall" && wallDraft.length > 0) {
            const last = wallDraft[wallDraft.length - 1];
            setWallPreviewPoint(e.shiftKey ? p : snapWallAngle(last, p));
        }

        if (!panning) return;

        const dx = e.clientX - last.current.x;
        const dy = e.clientY - last.current.y;

        setOffset((prev) => ({
            x: prev.x + dx,
            y: prev.y + dy,
        }));

        last.current = { x: e.clientX, y: e.clientY };
    };

    // 사각형 드래그를 마치는 순간(mouseup) 미리보기 크기 그대로 방을 생성한다.
    // 기존 폴리곤 방 생성(finishPolygon)과 동일하게 createDrawnPatientRoom을 재사용해
    // room 데이터 구조(beds/zones/sensors)는 그대로 맞춰준다 — 유형/병상 수는 생성 후
    // 우측 Room Property 패널에서 바꾸면 된다.
    // (mouseUp에 직접 인라인한다 — 별도 헬퍼로 분리하면 이벤트 핸들러에서만 호출되는
    // 함수라는 걸 정적 분석기가 추적하지 못해, 내부의 Date.now() 호출을 "렌더 중 호출될
    // 수도 있는 불순 함수"로 오탐하는 문제가 있었다.)
    const mouseUp = () => {
        setPanning(false);
        if (drawMode !== "rect" && drawMode !== "wallRect" && !STRUCTURE_MODES.has(drawMode)) return;

        const start = rectStartRef.current;
        const preview = rectPreview;
        rectStartRef.current = null;
        setRectPreview(null);

        if (!start || !preview) return;
        if (preview.w < MIN_RECT_SIZE || preview.h < MIN_RECT_SIZE) return;

        const { x, y, w, h } = preview;
        const corners = [
            [x, y],
            [x + w, y],
            [x + w, y + h],
            [x, y + h],
        ].map(([px, py]) => [
            Math.max(0, Math.min(1, px / 1000)),
            Math.max(0, Math.min(1, py / 700)),
        ]);

        if (drawMode === "wallRect") {
            // 사각형 4변을 각각 독립된 벽 세그먼트로 만든다 — 한 변만 선택해서 따로
            // 옮기거나 지울 수 있어야 하므로, 닫힌 폴리곤 하나가 아니라 4개의 벽으로 저장한다.
            const segments = [
                [corners[0], corners[1]],
                [corners[1], corners[2]],
                [corners[2], corners[3]],
                [corners[3], corners[0]],
            ];
            const newWalls = segments.map((points) => createWall(points));
            setWalls((prev) => [...prev, ...newWalls]);
            setSelectedWall(newWalls[0]);
            return;
        }

        if (STRUCTURE_MODES.has(drawMode)) {
            // 계단/엘리베이터는 방(room)이 아니라 문(door)과 동일한 순수 구조 심볼이다 —
            // 사각형으로 그리듯 드래그하지만 zones/beds/sensors/status는 갖지 않는다.
            const structure = createStructure(drawMode, corners);
            setStructures((prev) => [...prev, structure]);
            setSelectedStructure(structure);
            return;
        }

        // mouseUp은 실제 마우스 이벤트에서만 호출되는 이벤트 핸들러라 렌더 중에는 절대
        // 실행되지 않는다(finishPolygon과 동일 패턴).
        const id = `room-${Date.now()}`;
        const room = createDrawnPatientRoom(id, `${rooms.length + 101}`, corners);

        pushHistory();
        setRooms((prev) => [...prev, room]);
        setSelectedRoom(room);
    };

    const wheel = (e) => {
        e.preventDefault();
        if (!e.ctrlKey) return;

        const delta = e.deltaY < 0 ? 8 : -8;
        setScalePercent(zoom + delta);
    };

    /* ===========================
       HISTORY (UNDO / REDO)
    =========================== */
    const undoStack = useRef([]);
    const redoStack = useRef([]);

    const pushHistory = () => {
        undoStack.current.push(JSON.parse(JSON.stringify(rooms)));
        if (undoStack.current.length > 50) {
            undoStack.current.shift();
        }
    };

    const undo = () => {
        if (undoStack.current.length === 0) return;
        redoStack.current.push(JSON.parse(JSON.stringify(rooms)));
        setRooms(undoStack.current.pop());
    };

    const redo = () => {
        if (redoStack.current.length === 0) return;
        undoStack.current.push(JSON.parse(JSON.stringify(rooms)));
        setRooms(redoStack.current.pop());
    };

    // 상위 툴바(FloorEditor > EditorToolbar)의 Undo/Redo 버튼에서 호출할 수 있도록 노출
    useImperativeHandle(ref, () => ({ undo, redo }));

    /* ===========================
       폴리곤 그리기
    =========================== */
    const finishPolygon = () => {
        if (draft.length < 3) return;

        const id = `room-${Date.now()}`;
        const room = createDrawnPatientRoom(
            id,
            `${rooms.length + 101}`,
            draft.map((point) => [point.x / 1000, point.y / 700]),
        );

        pushHistory();
        setRooms((prev) => [...prev, room]);
        setSelectedRoom(room);
        setDraft([]);
        setDrawing(false);
    };

    const cancelPolygon = () => {
        setDraft([]);
        setDrawing(false);
        setWallDraft([]);
        setWallDrawing(false);
        setWallPreviewPoint(null);
        rectStartRef.current = null;
        setRectPreview(null);
    };

    /* ===========================
       벽 그리기 (방과 달리 zones/beds가 없는 열린 선)
    =========================== */
    const finishWall = () => {
        if (wallDraft.length < 2) return;

        const points = wallDraft.map((point) => [
            Math.max(0, Math.min(1, point.x / 1000)),
            Math.max(0, Math.min(1, point.y / 700)),
        ]);

        const wall = createWall(points);

        setWalls((prev) => [...prev, wall]);
        setSelectedWall(wall);
        setWallDraft([]);
        setWallDrawing(false);
        setWallPreviewPoint(null);
    };

    /* ===========================
       그리드
    =========================== */
    const gridLines = useMemo(() => {
        const lines = [];
        for (let x = 0; x <= 1000; x += GRID) {
            lines.push(
                <line
                    key={`v-${x}`}
                    x1={x}
                    y1="0"
                    x2={x}
                    y2="700"
                    stroke="#d1d5db"
                    strokeOpacity=".2"
                />
            );
        }
        for (let y = 0; y <= 700; y += GRID) {
            lines.push(
                <line
                    key={`h-${y}`}
                    x1="0"
                    y1={y}
                    x2="1000"
                    y2={y}
                    stroke="#d1d5db"
                    strokeOpacity=".2"
                />
            );
        }
        return lines;
    }, []);

    /* ===========================
       KEYBOARD SHORTCUT
    =========================== */
    useEffect(() => {
        const keyDown = (e) => {
            if (e.ctrlKey && e.key === "z") {
                e.preventDefault();
                undo();
            }
            if (e.ctrlKey && e.key === "y") {
                e.preventDefault();
                redo();
            }
            if (e.key === "Delete") {
                if (selectedRoom) {
                    pushHistory();
                    setRooms((prev) =>
                        prev.filter((room) => room.id !== selectedRoom.id)
                    );
                    setSelectedRoom(null);
                } else if (selectedWall) {
                    // 벽/문 삭제는 현재 Undo/Redo 히스토리(rooms만 추적) 대상이 아니다.
                    setWalls((prev) => prev.filter((w) => w.id !== selectedWall.id));
                    setSelectedWall(null);
                } else if (selectedDoor) {
                    setDoors((prev) => prev.filter((d) => d.id !== selectedDoor.id));
                    setSelectedDoor(null);
                } else if (selectedStructure) {
                    setStructures((prev) => prev.filter((s) => s.id !== selectedStructure.id));
                    setSelectedStructure(null);
                }
            }
        };
        window.addEventListener("keydown", keyDown);
        return () => {
            window.removeEventListener("keydown", keyDown);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rooms, selectedRoom, walls, selectedWall, doors, selectedDoor, structures, selectedStructure]);

    /* ===========================
       AUTO FIT
    =========================== */
    const fitScreen = () => {
        setScalePercent(100);
        setOffset({ x: 0, y: 0 });
    };

    /* ===========================
       DOUBLE CLICK -> 폴리곤 완료
    =========================== */
    const doubleClick = () => {
        if (drawMode === "wall") finishWall();
        else finishPolygon();
    };

    /* ===========================
       RENDER
    =========================== */
    return (
        <div className="editor-canvas-wrapper" ref={wrapperRef}>
            <div className="editor-topbar">
                <div className="editor-info">
                    <span>
                        {drawMode === "rect" && "드래그하여 방 생성"}
                        {drawMode === "polygon" && "점을 찍어 방 생성"}
                        {drawMode === "wall" && "점을 찍어 벽 생성 (더블클릭 완료, 45도 자동 정렬 · Shift로 자유 각도)"}
                        {drawMode === "wallRect" && "드래그하여 사각형 벽(4변) 생성"}
                        {drawMode === "door" && (walls.length === 0 ? "먼저 벽을 그려주세요" : "벽 위를 클릭하면 문 생성")}
                        {drawMode === "stairs" && "드래그하여 계단 심볼 생성"}
                        {drawMode === "elevator" && "드래그하여 엘리베이터 심볼 생성"}
                        {groupSelect && " · 모서리를 드래그하면 전체가 비율대로 확대/축소됩니다"}
                    </span>
                    <span>Zoom {zoom}%</span>
                    <span>Rooms {rooms.length}</span>
                    <span>Walls {walls.length}</span>
                    <span>Doors {doors.length}</span>
                    {drawMode === "polygon" && <span>Draft {draft.length}</span>}
                    {drawMode === "wall" && <span>Draft {wallDraft.length}</span>}
                    <span>Grid {grid ? "ON" : "OFF"}</span>
                    <span>Snap {snap ? "ON" : "OFF"}</span>
                    <span>X {mouse.x.toFixed(0)}</span>
                    <span>Y {mouse.y.toFixed(0)}</span>
                </div>

                <div className="editor-buttons">
                    <button className="toolbar-btn" onClick={undo}>
                        Undo
                    </button>
                    <button className="toolbar-btn" onClick={redo}>
                        Redo
                    </button>
                    <button className="toolbar-btn" onClick={fitScreen}>
                        Auto Fit
                    </button>
                    {drawMode === "polygon" && (
                        <button className="toolbar-btn" onClick={finishPolygon}>
                            Polygon 완료
                        </button>
                    )}
                    {drawMode === "wall" && (
                        <button className="toolbar-btn" onClick={finishWall}>
                            벽 완료
                        </button>
                    )}
                    <button className="toolbar-btn" onClick={cancelPolygon}>
                        취소
                    </button>
                </div>
            </div>

            <div className="editor-stage">
                <svg
                    ref={svgRef}
                    viewBox="0 0 1000 700"
                    className="editor-svg"
                    onMouseDown={mouseDown}
                    onMouseMove={mouseMove}
                    onMouseUp={mouseUp}
                    onDoubleClick={doubleClick}
                    onWheel={wheel}
                >
                    <g ref={contentRef} transform={`translate(${offset.x},${offset.y}) scale(${scale})`}>
                        {/* GRID */}
                        {grid && <g>{gridLines}</g>}

                        {/* FLOOR IMAGE */}
                        {background && (
                            <image
                                href={background}
                                width="1000"
                                height="700"
                                preserveAspectRatio="none"
                            />
                        )}

                        {/* WALLS — 방(zones/beds가 있는 면적)보다 먼저 그려서, 방이 없는
                            구간(복도/외벽 등)에서만 실제로 보이도록 한다 */}
                        <WallLayer
                            walls={walls}
                            selectedWall={selectedWall}
                            setWalls={setWalls}
                            setSelectedWall={setSelectedWall}
                        />

                        {/* DOORS */}
                        <DoorLayer
                            doors={doors}
                            selectedDoor={selectedDoor}
                            setSelectedDoor={setSelectedDoor}
                        />

                        {/* STRUCTURES — 계단/엘리베이터(문처럼 순수 심볼, 방과 무관) */}
                        <StructureLayer
                            structures={structures}
                            rooms={rooms}
                            selectedStructure={selectedStructure}
                            setStructures={setStructures}
                            setSelectedStructure={setSelectedStructure}
                        />

                        {/* ROOM POLYGON */}
                        <PolygonLayer
                            rooms={rooms}
                            structures={structures}
                            selectedRoom={selectedRoom}
                            setRooms={setRooms}
                            setSelectedRoom={setSelectedRoom}
                        />

                        {/* DRAWING */}
                        {draft.length > 0 && (
                            <>
                                <polyline
                                    fill="rgba(37,99,235,.18)"
                                    stroke="#2563eb"
                                    strokeWidth="2"
                                    points={draft.map((p) => `${p.x},${p.y}`).join(" ")}
                                />
                                {draft.map((point, index) => (
                                    <circle
                                        key={index}
                                        cx={point.x}
                                        cy={point.y}
                                        r="5"
                                        fill="#2563eb"
                                    />
                                ))}
                                {/* drawing 상태일 때만 마우스 추적선 표시 */}
                                {drawing && (
                                    <line
                                        x1={draft[draft.length - 1].x}
                                        y1={draft[draft.length - 1].y}
                                        x2={mouse.x}
                                        y2={mouse.y}
                                        stroke="#2563eb"
                                        strokeDasharray="8"
                                    />
                                )}
                            </>
                        )}

                        {/* 벽 그리기 중 미리보기 — 방 draft와 달리 닫힌 도형이 아니라 열린 선 */}
                        {wallDraft.length > 0 && (
                            <>
                                <polyline
                                    fill="none"
                                    stroke="#6b7280"
                                    strokeWidth="6"
                                    strokeLinecap="square"
                                    points={wallDraft.map((p) => `${p.x},${p.y}`).join(" ")}
                                />
                                {wallDraft.map((point, index) => (
                                    <circle
                                        key={index}
                                        cx={point.x}
                                        cy={point.y}
                                        r="5"
                                        fill="#6b7280"
                                    />
                                ))}
                                {wallDrawing && wallPreviewPoint && (
                                    <line
                                        x1={wallDraft[wallDraft.length - 1].x}
                                        y1={wallDraft[wallDraft.length - 1].y}
                                        x2={wallPreviewPoint.x}
                                        y2={wallPreviewPoint.y}
                                        stroke="#6b7280"
                                        strokeDasharray="8"
                                    />
                                )}
                            </>
                        )}

                        {/* 사각형 드래그 미리보기 — 놓는 순간 이 크기 그대로 방/사각형 벽/계단/엘리베이터가 생성된다 */}
                        {(drawMode === "rect" || drawMode === "wallRect" || STRUCTURE_MODES.has(drawMode)) && rectPreview && (
                            <rect
                                x={rectPreview.x}
                                y={rectPreview.y}
                                width={rectPreview.w}
                                height={rectPreview.h}
                                fill={RECT_PREVIEW_COLORS[drawMode]?.fill}
                                stroke={RECT_PREVIEW_COLORS[drawMode]?.stroke}
                                strokeWidth="2"
                                strokeDasharray="6"
                            />
                        )}

                        {/* 전체 선택 — 배치도 전체(방+벽+문)를 감싸는 모서리 핸들. 드래그하면
                            반대쪽 모서리를 고정점 삼아 전체가 비율대로 확대/축소된다. */}
                        {groupSelect && (
                            <GroupResizeHandles
                                rooms={rooms}
                                walls={walls}
                                doors={doors}
                                setRooms={setRooms}
                                setWalls={setWalls}
                                setDoors={setDoors}
                            />
                        )}
                    </g>
                </svg>
            </div>

            <div className="editor-footer">
                <input
                    type="range"
                    min="40"
                    max="500"
                    value={zoom}
                    onChange={(e) => setScalePercent(Number(e.target.value))}
                />
                <span>{zoom}%</span>
            </div>
        </div>
    );
});

export default EditorCanvas;
