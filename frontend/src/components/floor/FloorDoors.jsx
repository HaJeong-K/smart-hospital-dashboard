import { getDoorGeometry } from "../../utils/structureGeometry";

// 문 색상 — 벽과 같은 회색을 쓰면 벽 사이에 묻혀 식별이 잘 안 됐다. 방/벽과 겹치지 않는
// 따뜻한 계열(앰버)로 바꿔 어떤 배경(벽/방 상태색) 위에서도 눈에 띄도록 한다 (2026-07-22 피드백).
const DOOR_COLOR = "#f59e0b";

// 관제 화면(Monitoring)에서 문을 그대로 보여주는 읽기 전용 레이어 — 편집 기능은
// components/editor/DoorLayer.jsx(Floor Editor 전용)에 있다.
function FloorDoors({ doors }) {
    if (!doors || doors.length === 0) return null;

    return (
        <g>
            {doors.map((door) => {
                const { hinge, leafEnd, arcPath } = getDoorGeometry(door);
                return (
                    <g key={door.id}>
                        <circle cx={hinge.x} cy={hinge.y} r="3.5" fill={DOOR_COLOR} />
                        <line
                            x1={hinge.x}
                            y1={hinge.y}
                            x2={leafEnd.x}
                            y2={leafEnd.y}
                            stroke={DOOR_COLOR}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                        />
                        <path
                            d={arcPath}
                            fill="none"
                            stroke={DOOR_COLOR}
                            strokeWidth="1.5"
                            strokeDasharray="4 3"
                            opacity="0.8"
                        />
                    </g>
                );
            })}
        </g>
    );
}

export default FloorDoors;
