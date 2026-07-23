import { getDoorGeometry } from "../../utils/structureGeometry";

// 모니터링 화면(FloorDoors.jsx)과 동일한 색상 — 벽/사각형 벽과 같은 회색(#6b7280,
// WallLayer.jsx 참고)으로 통일했다. 선택 시에만 파란색으로 바뀐다.
const DOOR_COLOR = "#6b7280";
const DOOR_COLOR_ACTIVE = "#3b82f6";

// 문은 항상 벽 위에 스냅되어 생성되므로(EditorCanvas의 door 모드 참고), 방/벽과 달리
// 자유롭게 드래그 이동시키지 않는다 — 위치를 바꾸려면 삭제 후 원하는 지점에 다시 찍는다.
// 선택(클릭) + 삭제(Delete 키, EditorCanvas에서 처리)만 지원한다.
function DoorLayer({ doors, selectedDoor, setSelectedDoor }) {
    return (
        <g>
            {doors.map((door) => {
                const { hinge, glyphPath } = getDoorGeometry(door);
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
                        {/* 경첩→문짝→열림 궤적을 하나의 매끄러운 선(hook 모양)으로 표현
                            (참고 이미지 door.png와 동일한 형태) */}
                        <path
                            d={glyphPath}
                            fill="none"
                            stroke={color}
                            strokeWidth={active ? 5.5 : 5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
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
