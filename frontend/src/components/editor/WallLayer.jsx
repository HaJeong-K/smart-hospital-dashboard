import { useEffect, useRef, useState } from "react";

import { CANVAS_W, CANVAS_H, pointsToString } from "../../utils/structureGeometry";

// PolygonLayer(방)와 동일한 드래그 방식(선택 → 통째로 이동 / 꼭짓점 드래그로 재형성)을
// 벽(열린 선, 채우기 없음)에 적용한다. 벽은 방과 달리 zones/beds가 없는 순수 구조물이라
// 별도 레이어로 분리했다.
function WallLayer({ walls, selectedWall, setWalls, setSelectedWall }) {
    const [dragVertex, setDragVertex] = useState(null); // { wallId, index }
    const [dragWall, setDragWall] = useState(null); // { wallId }

    const groupRef = useRef(null);
    const lastPointRef = useRef({ x: 0, y: 0 });

    const toLocalPoint = (clientX, clientY) => {
        const ctm = groupRef.current?.getScreenCTM();
        if (!ctm) return { x: 0, y: 0 };
        const point = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
        return { x: point.x, y: point.y };
    };

    const updateVertex = (wallId, index, x, y) => {
        setWalls((prev) =>
            prev.map((wall) => {
                if (wall.id !== wallId) return wall;
                const points = [...wall.points];
                points[index] = [
                    Math.max(0, Math.min(1, x / CANVAS_W)),
                    Math.max(0, Math.min(1, y / CANVAS_H)),
                ];
                return { ...wall, points };
            }),
        );
    };

    const moveWall = (wallId, dx, dy) => {
        setWalls((prev) =>
            prev.map((wall) => {
                if (wall.id !== wallId) return wall;
                const points = wall.points.map(([x, y]) => [
                    Math.max(0, Math.min(1, x + dx / CANVAS_W)),
                    Math.max(0, Math.min(1, y + dy / CANVAS_H)),
                ]);
                return { ...wall, points };
            }),
        );
    };

    const startVertexDrag = (e, wallId, index) => {
        e.stopPropagation();
        lastPointRef.current = toLocalPoint(e.clientX, e.clientY);
        setDragVertex({ wallId, index });
    };

    const startWallDrag = (e, wallId) => {
        e.stopPropagation();
        lastPointRef.current = toLocalPoint(e.clientX, e.clientY);
        setDragWall({ wallId });
    };

    useEffect(() => {
        if (!dragVertex && !dragWall) return;

        const handleMove = (e) => {
            const point = toLocalPoint(e.clientX, e.clientY);

            if (dragVertex) {
                updateVertex(dragVertex.wallId, dragVertex.index, point.x, point.y);
            }

            if (dragWall) {
                const dx = point.x - lastPointRef.current.x;
                const dy = point.y - lastPointRef.current.y;
                moveWall(dragWall.wallId, dx, dy);
            }

            lastPointRef.current = point;
        };

        const handleUp = () => {
            setDragVertex(null);
            setDragWall(null);
        };

        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleUp);

        return () => {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", handleUp);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dragVertex, dragWall]);

    return (
        <g ref={groupRef}>
            {walls.map((wall) => {
                const active = selectedWall?.id === wall.id;
                const strokeWidth = Math.max(4, (wall.thickness || 0.006) * CANVAS_W);

                return (
                    <g
                        key={wall.id}
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedWall(wall);
                        }}
                    >
                        <polyline
                            points={pointsToString(wall.points)}
                            fill="none"
                            stroke={active ? "#3b82f6" : "#6b7280"}
                            strokeWidth={strokeWidth}
                            strokeLinecap="square"
                            strokeLinejoin="round"
                            onMouseDown={(e) => startWallDrag(e, wall.id)}
                        />

                        {active &&
                            wall.points.map(([x, y], index) => (
                                <circle
                                    key={index}
                                    cx={x * CANVAS_W}
                                    cy={y * CANVAS_H}
                                    r="6"
                                    fill="#ffffff"
                                    stroke="#3b82f6"
                                    strokeWidth="3"
                                    onMouseDown={(e) => startVertexDrag(e, wall.id, index)}
                                />
                            ))}
                    </g>
                );
            })}
        </g>
    );
}

export default WallLayer;
