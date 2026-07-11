import { useEffect, useMemo, useRef, useState } from "react";

import PolygonLayer from "./PolygonLayer";

const GRID = 20;

function MiniMap({ background, rooms }) {
    return (
        <div className="editor-minimap">
            <svg viewBox="0 0 1000 700">
                {background && (
                    <image href={background} width="1000" height="700" />
                )}
                {rooms.map((room) => (
                    <polygon
                        key={room.id}
                        points={room.polygon
                            .map(([x, y]) => `${x * 1000},${y * 700}`)
                            .join(" ")}
                        fill="rgba(59,130,246,.3)"
                        stroke="#2563eb"
                        strokeWidth="2"
                    />
                ))}
            </svg>
        </div>
    );
}

function EditorCanvas({
    background,
    rooms,
    setRooms,
    selectedRoom,
    setSelectedRoom,
}) {
    const svgRef = useRef(null);
    const wrapperRef = useRef(null);

    const [drawing, setDrawing] = useState(false);
    const [draft, setDraft] = useState([]);
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [spacePressed, setSpacePressed] = useState(false);
    const [panning, setPanning] = useState(false);
    const [mouse, setMouse] = useState({ x: 0, y: 0 });

    const last = useRef({ x: 0, y: 0 });

    // Date.now() 대신 ref 기반 증가 카운터로 room id를 생성한다.
    // (렌더 경로에서 impure 함수를 직접 호출하지 않기 위함)
    const nextRoomId = useRef(1);

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
    const getSvgPoint = (event) => {
        const rect = svgRef.current.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left - offset.x) / scale,
            y: (event.clientY - rect.top - offset.y) / scale,
        };
    };

    /* ===========================
       GRID SNAP
    =========================== */
    const snapPoint = (point) => {
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

        const p = snapPoint(getSvgPoint(e));
        setDraft((prev) => [...prev, p]);
        setDrawing(true);
    };

    const mouseMove = (e) => {
        const p = getSvgPoint(e);
        setMouse({ x: p.x, y: p.y });

        if (!panning) return;

        const dx = e.clientX - last.current.x;
        const dy = e.clientY - last.current.y;

        setOffset((prev) => ({
            x: prev.x + dx,
            y: prev.y + dy,
        }));

        last.current = { x: e.clientX, y: e.clientY };
    };

    const mouseUp = () => {
        setPanning(false);
    };

    const wheel = (e) => {
        e.preventDefault();
        if (!e.ctrlKey) return;

        const delta = e.deltaY < 0 ? 0.08 : -0.08;
        setScale((prev) => Math.max(0.4, Math.min(5, prev + delta)));
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

    /* ===========================
       폴리곤 그리기
    =========================== */
    const finishPolygon = () => {
        if (draft.length < 3) return;

        const room = {
            id: nextRoomId.current++,
            roomNo: `${rooms.length + 101}`,
            polygon: draft.map((point) => [point.x / 1000, point.y / 700]),
            patient: { name: "", age: 0 },
            sensors: [],
            status: { room: "normal" },
        };

        pushHistory();
        setRooms((prev) => [...prev, room]);
        setSelectedRoom(room);
        setDraft([]);
        setDrawing(false);
    };

    const cancelPolygon = () => {
        setDraft([]);
        setDrawing(false);
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
            if (e.key === "Delete" && selectedRoom) {
                pushHistory();
                setRooms((prev) =>
                    prev.filter((room) => room.id !== selectedRoom.id)
                );
                setSelectedRoom(null);
            }
        };
        window.addEventListener("keydown", keyDown);
        return () => {
            window.removeEventListener("keydown", keyDown);
        };
    }, [rooms, selectedRoom]);

    /* ===========================
       AUTO FIT
    =========================== */
    const fitScreen = () => {
        setScale(1);
        setOffset({ x: 0, y: 0 });
    };

    /* ===========================
       DOUBLE CLICK -> 폴리곤 완료
    =========================== */
    const doubleClick = () => {
        finishPolygon();
    };

    /* ===========================
       RENDER
    =========================== */
    return (
        <div className="editor-canvas-wrapper" ref={wrapperRef}>
            <div className="editor-topbar">
                <div className="editor-info">
                    <span>Zoom {(scale * 100).toFixed(0)}%</span>
                    <span>Rooms {rooms.length}</span>
                    <span>Draft {draft.length}</span>
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
                    <button className="toolbar-btn" onClick={finishPolygon}>
                        Polygon 완료
                    </button>
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
                    <g transform={`translate(${offset.x},${offset.y}) scale(${scale})`}>
                        {/* GRID */}
                        <g>{gridLines}</g>

                        {/* FLOOR IMAGE */}
                        {background && (
                            <image
                                href={background}
                                width="1000"
                                height="700"
                                preserveAspectRatio="none"
                            />
                        )}

                        {/* ROOM POLYGON */}
                        <PolygonLayer
                            rooms={rooms}
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
                    </g>
                </svg>

                <MiniMap background={background} rooms={rooms} />
            </div>

            <div className="editor-footer">
                <input
                    type="range"
                    min="40"
                    max="500"
                    value={scale * 100}
                    onChange={(e) => {
                        setScale(Number(e.target.value) / 100);
                    }}
                />
                <span>{(scale * 100).toFixed(0)}%</span>
            </div>
        </div>
    );
}

export default EditorCanvas;