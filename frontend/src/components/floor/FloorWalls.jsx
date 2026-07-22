import { CANVAS_W, pointsToString } from "../../utils/structureGeometry";

// 관제 화면(Monitoring)에서 벽을 그대로 보여주는 읽기 전용 레이어 — 편집 기능은
// components/editor/WallLayer.jsx(Floor Editor 전용)에 있다.
function FloorWalls({ walls }) {
    if (!walls || walls.length === 0) return null;

    return (
        <g>
            {walls.map((wall) => (
                <polyline
                    key={wall.id}
                    points={pointsToString(wall.points)}
                    fill="none"
                    stroke="var(--wall-color, #6b7280)"
                    strokeWidth={Math.max(4, (wall.thickness || 0.006) * CANVAS_W)}
                    strokeLinecap="square"
                    strokeLinejoin="round"
                />
            ))}
        </g>
    );
}

export default FloorWalls;
