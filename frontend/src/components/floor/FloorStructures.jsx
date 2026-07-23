import StairsIcon from "../room/StairsIcon";
import ElevatorIcon from "../room/ElevatorIcon";
import EscalatorIcon from "../room/EscalatorIcon";

const ICONS = { stairs: StairsIcon, elevator: ElevatorIcon, escalator: EscalatorIcon };

// 관제 화면(Monitoring)에서 계단/엘리베이터 심볼을 그대로 보여주는 읽기 전용 레이어 —
// 편집 기능은 components/editor/StructureLayer.jsx(Floor Editor 전용)에 있다.
// 방(room)이 아니라 문(door)과 동일한 순수 구조 심볼이라 상태색이 없다. 배경 채우기가
// 없어 평면도 위에 심볼만 떠 있는 것처럼 보이도록 한다(배경색을 넣으면 실제 배치도
// 배경과 완전히 같은 색이 아니라 사각형이 도드라져 보였음).
function FloorStructures({ structures }) {
    if (!structures || structures.length === 0) return null;

    return (
        <g>
            {structures.map((structure) => {
                const Icon = ICONS[structure.type];

                return (
                    <g key={structure.id}>
                        {Icon && <Icon room={structure} color="var(--text)" />}
                    </g>
                );
            })}
        </g>
    );
}

export default FloorStructures;
