import { useEffect, useRef, useState } from "react";

import StairsIcon from "../room/StairsIcon";
import ElevatorIcon from "../room/ElevatorIcon";
import { SVG_WIDTH, SVG_HEIGHT, findAlignmentGuide, findSizeMatchGuide } from "../../utils/alignmentGuides";

const ICONS = { stairs: StairsIcon, elevator: ElevatorIcon };

// 계단/엘리베이터 — 문(DoorLayer)처럼 방(room)과 무관한 순수 구조 심볼이다. 사각형 방을
// 그리듯 드래그로 폴리곤을 잡지만, zones/beds/sensors/status 같은 방 데이터는 없다.
// 선택 → 통째로 이동 / 꼭짓점 드래그로 크기 조정은 PolygonLayer와 동일한 방식을 그대로 쓴다.
// 통째로 옮기는 중에는 캔바/미리캔버스처럼, 다른 방·구조물과 경계(좌우상하)나 중심이
// 가까워지면 안내선(가이드)만 뜬다 — 처음엔 실제로 그 축에 위치를 강제로 붙였는데
// "너무 꽉 잡는다"는 피드백으로 위치는 마우스를 그대로 따라가게 두고 시각적 안내선만
// 표시하도록 바꿨다 (2026-07-22 피드백).
function StructureLayer({ structures, rooms = [], selectedStructure, setStructures, setSelectedStructure }) {
    const [dragVertex, setDragVertex] = useState(null); // { id, index }
    const [dragStructure, setDragStructure] = useState(null); // { id }
    const [dragEdge, setDragEdge] = useState(null); // { id, edgeIndex, axis }
    const [guide, setGuide] = useState(null); // { x, y } — 스냅된 축(없으면 null)

    const groupRef = useRef(null);
    const lastPointRef = useRef({ x: 0, y: 0 });

    const toLocalPoint = (clientX, clientY) => {
        const ctm = groupRef.current?.getScreenCTM();
        if (!ctm) return { x: 0, y: 0 };
        const point = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
        return { x: point.x, y: point.y };
    };

    const updateVertex = (id, index, x, y) => {
        setStructures((prev) =>
            prev.map((s) => {
                if (s.id !== id) return s;
                const polygon = [...s.polygon];
                polygon[index] = [
                    Math.max(0, Math.min(1, x / SVG_WIDTH)),
                    Math.max(0, Math.min(1, y / SVG_HEIGHT)),
                ];
                return { ...s, polygon };
            }),
        );
    };

    // 변(edge) 중점 핸들 — 그 변을 이루는 두 꼭짓점만 변에 수직인 축으로 함께 움직여서
    // 반대쪽 변은 고정한 채 폭 또는 높이만 조정한다 (PolygonLayer와 동일한 방식). 이렇게
    // 조정된 폭/높이가 다른 방·구조물과 같아지면 안내선을 띄운다 (2026-07-22 피드백).
    const updateEdge = (id, edgeIndex, axis, delta) => {
        setStructures((prev) => {
            const current = prev.find((s) => s.id === id);
            if (!current) return prev;

            const n = current.polygon.length;
            const i1 = edgeIndex;
            const i2 = (edgeIndex + 1) % n;
            const polygon = current.polygon.map(([x, y], idx) => {
                if (idx !== i1 && idx !== i2) return [x, y];
                if (axis === "y") {
                    return [x, Math.max(0, Math.min(1, y + delta / SVG_HEIGHT))];
                }
                return [Math.max(0, Math.min(1, x + delta / SVG_WIDTH)), y];
            });

            const targets = [
                ...prev.filter((s) => s.id !== id).map((s) => s.polygon),
                ...rooms.map((r) => r.polygon),
            ];
            const movingCoord = axis === "x" ? polygon[i1][0] * SVG_WIDTH : polygon[i1][1] * SVG_HEIGHT;
            setGuide(findSizeMatchGuide(polygon, targets, axis, movingCoord));

            return prev.map((s) => (s.id === id ? { ...s, polygon } : s));
        });
    };

    const moveStructure = (id, dx, dy) => {
        setStructures((prev) => {
            const current = prev.find((s) => s.id === id);
            if (!current) return prev;

            // 위치는 항상 마우스를 그대로 따라간다 — 스냅으로 억지로 당기지 않는다.
            const polygon = current.polygon.map(([x, y]) => [
                Math.max(0, Math.min(1, x + dx / SVG_WIDTH)),
                Math.max(0, Math.min(1, y + dy / SVG_HEIGHT)),
            ]);

            const targets = [
                ...prev.filter((s) => s.id !== id).map((s) => s.polygon),
                ...rooms.map((r) => r.polygon),
            ];
            setGuide(findAlignmentGuide(polygon, targets));

            return prev.map((s) => (s.id === id ? { ...s, polygon } : s));
        });
    };

    const startVertexDrag = (e, id, index) => {
        e.stopPropagation();
        lastPointRef.current = toLocalPoint(e.clientX, e.clientY);
        setDragVertex({ id, index });
    };

    const startStructureDrag = (e, id) => {
        e.stopPropagation();
        lastPointRef.current = toLocalPoint(e.clientX, e.clientY);
        setDragStructure({ id });
    };

    const startEdgeDrag = (e, id, edgeIndex, axis) => {
        e.stopPropagation();
        lastPointRef.current = toLocalPoint(e.clientX, e.clientY);
        setDragEdge({ id, edgeIndex, axis });
    };

    useEffect(() => {
        if (!dragVertex && !dragStructure && !dragEdge) return;

        const handleMove = (e) => {
            const point = toLocalPoint(e.clientX, e.clientY);

            if (dragVertex) {
                updateVertex(dragVertex.id, dragVertex.index, point.x, point.y);
            }

            if (dragStructure) {
                const dx = point.x - lastPointRef.current.x;
                const dy = point.y - lastPointRef.current.y;
                moveStructure(dragStructure.id, dx, dy);
            }

            if (dragEdge) {
                const delta = dragEdge.axis === "y"
                    ? point.y - lastPointRef.current.y
                    : point.x - lastPointRef.current.x;
                updateEdge(dragEdge.id, dragEdge.edgeIndex, dragEdge.axis, delta);
            }

            lastPointRef.current = point;
        };

        const handleUp = () => {
            setDragVertex(null);
            setDragStructure(null);
            setDragEdge(null);
            setGuide(null);
        };

        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleUp);

        return () => {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", handleUp);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dragVertex, dragStructure, dragEdge]);

    return (
        <g ref={groupRef}>
            {structures.map((structure) => {
                const points = structure.polygon
                    .map(([x, y]) => `${x * SVG_WIDTH},${y * SVG_HEIGHT}`)
                    .join(" ");
                const active = selectedStructure?.id === structure.id;
                const Icon = ICONS[structure.type];

                return (
                    <g
                        key={structure.id}
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStructure(structure);
                        }}
                    >
                        <polygon
                            points={points}
                            fill="var(--map-background)"
                            stroke={active ? "#3b82f6" : "none"}
                            strokeWidth={active ? 3 : 0}
                            onMouseDown={(e) => startStructureDrag(e, structure.id)}
                        />

                        {Icon && <Icon room={structure} color="var(--text)" />}

                        {active &&
                            structure.polygon.map(([x, y], index) => (
                                <circle
                                    key={index}
                                    cx={x * SVG_WIDTH}
                                    cy={y * SVG_HEIGHT}
                                    r="6"
                                    fill="#ffffff"
                                    stroke="#2563eb"
                                    strokeWidth="3"
                                    onMouseDown={(e) => startVertexDrag(e, structure.id, index)}
                                />
                            ))}

                        {/* 변(edge) 중점 핸들 — 꼭짓점 대신 이걸 잡고 드래그하면 그 변만
                            늘어나거나 줄어든다(폭 또는 높이만 조정, 반대쪽 변은 고정). */}
                        {active &&
                            structure.polygon.map(([x1, y1], index) => {
                                const [x2, y2] = structure.polygon[(index + 1) % structure.polygon.length];
                                const mx = ((x1 + x2) / 2) * SVG_WIDTH;
                                const my = ((y1 + y2) / 2) * SVG_HEIGHT;
                                const horizontal = Math.abs(x2 - x1) >= Math.abs(y2 - y1);
                                const axis = horizontal ? "y" : "x";
                                const cursor = horizontal ? "ns-resize" : "ew-resize";

                                return (
                                    <rect
                                        key={`edge-${index}`}
                                        x={mx - (horizontal ? 9 : 5)}
                                        y={my - (horizontal ? 5 : 9)}
                                        width={horizontal ? 18 : 10}
                                        height={horizontal ? 10 : 18}
                                        rx="3"
                                        fill="#ffffff"
                                        stroke="#2563eb"
                                        strokeWidth="2"
                                        style={{ cursor }}
                                        onMouseDown={(e) => startEdgeDrag(e, structure.id, index, axis)}
                                    />
                                );
                            })}
                    </g>
                );
            })}

            {/* 정렬 안내선 — 통째로 이동(dragStructure) 중엔 다른 방/구조물의 경계·중심과
                가까워지면, 변 핸들로 크기를 조정(dragEdge)하는 동안엔 폭/높이가 같아지면
                캔버스 전체 폭/높이로 표시된다(위치를 강제로 옮기지는 않음). 라이트 모드는
                회색, 다크 모드는 흰색(--align-guide). */}
            {(dragStructure || dragEdge) && guide?.x !== null && guide?.x !== undefined && (
                <line x1={guide.x} y1="0" x2={guide.x} y2={SVG_HEIGHT} stroke="var(--align-guide)" strokeWidth="1.5" strokeDasharray="5 4" pointerEvents="none" />
            )}
            {(dragStructure || dragEdge) && guide?.y !== null && guide?.y !== undefined && (
                <line x1="0" y1={guide.y} x2={SVG_WIDTH} y2={guide.y} stroke="var(--align-guide)" strokeWidth="1.5" strokeDasharray="5 4" pointerEvents="none" />
            )}
        </g>
    );
}

export default StructureLayer;
