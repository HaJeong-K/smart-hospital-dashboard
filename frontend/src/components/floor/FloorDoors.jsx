import { getDoorGeometry } from "../../utils/structureGeometry";

// 문 색상 — 벽/사각형 벽과 같은 회색(#6b7280, WallLayer.jsx 참고)으로 통일했다
// (Floor Editor의 DoorLayer.jsx와 동일하게 맞춤).
const DOOR_COLOR = "#6b7280";

// 관제 화면(Monitoring)에서 문을 그대로 보여주는 읽기 전용 레이어 — 편집 기능은
// components/editor/DoorLayer.jsx(Floor Editor 전용)에 있다.
function FloorDoors({ doors }) {
    if (!doors || doors.length === 0) return null;

    return (
        <g>
            {doors.map((door) => {
                const { glyphPath } = getDoorGeometry(door);
                return (
                    <path
                        key={door.id}
                        d={glyphPath}
                        fill="none"
                        stroke={DOOR_COLOR}
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                );
            })}
        </g>
    );
}

export default FloorDoors;
