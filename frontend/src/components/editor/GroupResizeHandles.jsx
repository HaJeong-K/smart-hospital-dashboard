import { useEffect, useRef, useState } from "react";

const CANVAS_W = 1000;
const CANVAS_H = 700;

// 방(room.polygon) + 벽(wall.points) + 문(door.x/y) 전체를 감싸는 바운딩 박스(0~1 정규화).
function getBoundingBox(rooms, walls, doors) {
    const points = [];
    for (const room of rooms) points.push(...(room.polygon || []));
    for (const wall of walls) points.push(...(wall.points || []));
    for (const door of doors) points.push([door.x, door.y]);
    if (points.length === 0) return null;

    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    return {
        minX: Math.min(...xs),
        maxX: Math.max(...xs),
        minY: Math.min(...ys),
        maxY: Math.max(...ys),
    };
}

// "전체 선택" 모드 전용 — 배치도 전체(방+벽+문)를 감싸는 바운딩 박스와 네 모서리 리사이즈
// 핸들을 그린다. 모서리를 드래그하면 반대쪽 모서리를 고정점 삼아 전체가 같은 비율로
// 확대/축소된다(가로세로 따로 조절되지 않음 — 2026-07-22 피드백).
// PolygonLayer/WallLayer와 동일하게 이 레이어 자체의 <g>에서 getScreenCTM()으로 좌표를
// 변환해, EditorCanvas의 pan/zoom 상태와 무관하게 정확한 좌표를 얻는다.
function GroupResizeHandles({ rooms, walls, doors, setRooms, setWalls, setDoors }) {
    const groupRef = useRef(null);
    const [drag, setDrag] = useState(null);

    const toLocalPoint = (clientX, clientY) => {
        const ctm = groupRef.current?.getScreenCTM();
        if (!ctm) return { x: 0, y: 0 };
        const point = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
        return { x: point.x / CANVAS_W, y: point.y / CANVAS_H };
    };

    useEffect(() => {
        if (!drag) return undefined;

        const handleMove = (e) => {
            const current = toLocalPoint(e.clientX, e.clientY);
            const { anchor, startCorner, originalRooms, originalWalls, originalDoors } = drag;

            const startDist = Math.hypot(startCorner.x - anchor.x, startCorner.y - anchor.y);
            if (startDist === 0) return;
            const currentDist = Math.hypot(current.x - anchor.x, current.y - anchor.y);
            const scale = Math.max(0.1, Math.min(currentDist / startDist, 20));

            const transformPoint = ([x, y]) => [
                Math.max(0, Math.min(1, anchor.x + (x - anchor.x) * scale)),
                Math.max(0, Math.min(1, anchor.y + (y - anchor.y) * scale)),
            ];

            setRooms(originalRooms.map((room) => ({ ...room, polygon: room.polygon.map(transformPoint) })));
            setWalls(originalWalls.map((wall) => ({ ...wall, points: wall.points.map(transformPoint) })));
            setDoors(
                originalDoors.map((door) => {
                    const [x, y] = transformPoint([door.x, door.y]);
                    return { ...door, x, y };
                }),
            );
        };

        const handleUp = () => setDrag(null);

        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleUp);
        return () => {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", handleUp);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [drag]);

    const box = getBoundingBox(rooms, walls, doors);
    if (!box) return null;

    const corners = [
        { key: "nw", x: box.minX, y: box.minY, anchor: { x: box.maxX, y: box.maxY }, cursor: "nwse-resize" },
        { key: "ne", x: box.maxX, y: box.minY, anchor: { x: box.minX, y: box.maxY }, cursor: "nesw-resize" },
        { key: "sw", x: box.minX, y: box.maxY, anchor: { x: box.maxX, y: box.minY }, cursor: "nesw-resize" },
        { key: "se", x: box.maxX, y: box.maxY, anchor: { x: box.minX, y: box.minY }, cursor: "nwse-resize" },
    ];

    const startDrag = (e, corner) => {
        e.stopPropagation();
        setDrag({
            anchor: corner.anchor,
            startCorner: { x: corner.x, y: corner.y },
            originalRooms: JSON.parse(JSON.stringify(rooms)),
            originalWalls: JSON.parse(JSON.stringify(walls)),
            originalDoors: JSON.parse(JSON.stringify(doors)),
        });
    };

    return (
        <g ref={groupRef}>
            <rect
                x={box.minX * CANVAS_W}
                y={box.minY * CANVAS_H}
                width={(box.maxX - box.minX) * CANVAS_W}
                height={(box.maxY - box.minY) * CANVAS_H}
                fill="none"
                stroke="#7c3aed"
                strokeWidth="2"
                strokeDasharray="10 6"
                pointerEvents="none"
            />
            {corners.map((corner) => (
                <rect
                    key={corner.key}
                    x={corner.x * CANVAS_W - 7}
                    y={corner.y * CANVAS_H - 7}
                    width="14"
                    height="14"
                    fill="#7c3aed"
                    stroke="white"
                    strokeWidth="2"
                    style={{ cursor: corner.cursor }}
                    onMouseDown={(e) => startDrag(e, corner)}
                />
            ))}
        </g>
    );
}

export default GroupResizeHandles;
