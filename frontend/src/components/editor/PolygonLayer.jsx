import { useEffect, useRef, useState } from "react";

const SVG_WIDTH = 1000;
const SVG_HEIGHT = 700;

function PolygonLayer({ rooms, selectedRoom, setRooms, setSelectedRoom }) {
    const [dragVertex, setDragVertex] = useState(null); // { roomId, index }
    const [dragRoom, setDragRoom] = useState(null); // { roomId }

    // 좌표 변환 기준이 되는 <g> 참조.
    // 이 <g>는 EditorCanvas의 zoom/pan <g> 안쪽에 위치하므로,
    // 이 요소의 getScreenCTM()을 이용하면 zoom/pan 상태와 무관하게
    // 정확한 로컬(캔버스) 좌표를 얻을 수 있다.
    const groupRef = useRef(null);

    // 폴리곤 이동(drag) 시 이전 프레임의 로컬 좌표를 저장해
    // 델타(dx, dy)를 계산하기 위한 ref.
    const lastPointRef = useRef({ x: 0, y: 0 });

    /* ===========================
       화면 좌표 -> 캔버스 로컬 좌표 변환
    =========================== */
    const toLocalPoint = (clientX, clientY) => {
        const ctm = groupRef.current?.getScreenCTM();
        if (!ctm) return { x: 0, y: 0 };

        const point = new DOMPoint(clientX, clientY).matrixTransform(
            ctm.inverse()
        );
        return { x: point.x, y: point.y };
    };

    /* ===========================
       Room / Vertex 업데이트
    =========================== */
    const updateVertex = (roomId, index, x, y) => {
        setRooms((prev) =>
            prev.map((room) => {
                if (room.id !== roomId) return room;
                const polygon = [...room.polygon];
                polygon[index] = [
                    Math.max(0, Math.min(1, x / SVG_WIDTH)),
                    Math.max(0, Math.min(1, y / SVG_HEIGHT)),
                ];
                return { ...room, polygon };
            })
        );
    };

    const moveRoom = (roomId, dx, dy) => {
        setRooms((prev) =>
            prev.map((room) => {
                if (room.id !== roomId) return room;
                const polygon = room.polygon.map(([x, y]) => [
                    Math.max(0, Math.min(1, x + dx / SVG_WIDTH)),
                    Math.max(0, Math.min(1, y + dy / SVG_HEIGHT)),
                ]);
                return { ...room, polygon };
            })
        );
    };

    /* ===========================
       드래그 시작
       - 드래그 시작 시점의 로컬 좌표를 lastPointRef에 저장해두고,
         이후 window mousemove에서 그 지점 대비 델타를 계산한다.
    =========================== */
    const startVertexDrag = (e, roomId, index) => {
        e.stopPropagation();
        lastPointRef.current = toLocalPoint(e.clientX, e.clientY);
        setDragVertex({ roomId, index });
    };

    const startRoomDrag = (e, roomId) => {
        e.stopPropagation();
        lastPointRef.current = toLocalPoint(e.clientX, e.clientY);
        setDragRoom({ roomId });
    };

    /* ===========================
       드래그 중 (window 레벨에서 처리)
       - 개별 polygon/circle에만 mousemove를 걸면 커서가 그 영역을
         벗어나는 순간 드래그가 끊기므로, 드래그가 시작된 동안에는
         window 전체에서 이동/해제를 감지한다.
    =========================== */
    useEffect(() => {
        if (!dragVertex && !dragRoom) return;

        const handleMove = (e) => {
            const point = toLocalPoint(e.clientX, e.clientY);

            if (dragVertex) {
                updateVertex(dragVertex.roomId, dragVertex.index, point.x, point.y);
            }

            if (dragRoom) {
                const dx = point.x - lastPointRef.current.x;
                const dy = point.y - lastPointRef.current.y;
                moveRoom(dragRoom.roomId, dx, dy);
            }

            lastPointRef.current = point;
        };

        const handleUp = () => {
            setDragVertex(null);
            setDragRoom(null);
        };

        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleUp);

        return () => {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", handleUp);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dragVertex, dragRoom]);

    return (
        <g ref={groupRef}>
            {rooms.map((room) => {
                const points = room.polygon
                    .map(([x, y]) => `${x * SVG_WIDTH},${y * SVG_HEIGHT}`)
                    .join(" ");
                const active = selectedRoom?.id === room.id;

                return (
                    <g
                        key={room.id}
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRoom(room);
                        }}
                    >
                        <polygon
                            points={points}
                            fill={active ? "rgba(59,130,246,.35)" : "rgba(34,197,94,.25)"}
                            stroke={active ? "#3b82f6" : "#22c55e"}
                            strokeWidth={active ? 4 : 2}
                            onMouseDown={(e) => startRoomDrag(e, room.id)}
                        />

                        {active &&
                            room.polygon.map(([x, y], index) => (
                                <circle
                                    key={index}
                                    cx={x * SVG_WIDTH}
                                    cy={y * SVG_HEIGHT}
                                    r="6"
                                    fill="#ffffff"
                                    stroke="#2563eb"
                                    strokeWidth="3"
                                    onMouseDown={(e) =>
                                        startVertexDrag(e, room.id, index)
                                    }
                                />
                            ))}
                    </g>
                );
            })}
        </g>
    );
}

export default PolygonLayer;