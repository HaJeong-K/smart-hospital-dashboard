import { getDoorGeometry } from "../../utils/structureGeometry";

// 모니터링 화면(FloorDoors.jsx)과 동일한 앰버 색상 — 벽(회색)과 구분되어 식별이 잘 되도록
// 통일했다 (2026-07-22 피드백). 선택 시에만 파란색으로 바뀐다.
const DOOR_COLOR = "#f59e0b";
const DOOR_COLOR_ACTIVE = "#3b82f6";

// 문은 항상 벽 위에 스냅되어 생성되므로(EditorCanvas의 door 모드 참고), 방/벽과 달리
// 자유롭게 드래그 이동시키지 않는다 — 위치를 바꾸려면 삭제 후 원하는 지점에 다시 찍는다.
// 선택(클릭) + 삭제(Delete 키, EditorCanvas에서 처리)만 지원한다.
function DoorLayer({ doors, selectedDoor, setSelectedDoor }) {
    return (
        <g>
            {doors.map((door) => {
                const { hinge, leafEnd, arcPath } = getDoorGeometry(door);
                const active = selectedDoor?.id === door.id;
                const color = active ? DOOR_COLOR_ACTIVE : DOOR_COLOR;

                return (
                    <g
                        key={door.id}
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDoor(door);
                        }}
                        style={{ cursor: "pointer" }}
                    >
                        {/* 경첩 지점 */}
                        <circle cx={hinge.x} cy={hinge.y} r="3.5" fill={color} />
                        {/* 문짝 */}
                        <line
                            x1={hinge.x}
                            y1={hinge.y}
                            x2={leafEnd.x}
                            y2={leafEnd.y}
                            stroke={color}
                            strokeWidth={active ? 4 : 3.5}
                            strokeLinecap="round"
                        />
                        {/* 열림 궤적(호) */}
                        <path
                            d={arcPath}
                            fill="none"
                            stroke={color}
                            strokeWidth="1.5"
                            strokeDasharray="4 3"
                            opacity="0.8"
                        />
                        {/* 클릭 판정 영역(선이 얇아 선택하기 어려운 문제 보완) */}
                        <circle cx={hinge.x} cy={hinge.y} r="9" fill="transparent" />
                    </g>
                );
            })}
        </g>
    );
}

export default DoorLayer;
