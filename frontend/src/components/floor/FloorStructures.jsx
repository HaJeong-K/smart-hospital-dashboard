import StairsIcon from "../room/StairsIcon";
import ElevatorIcon from "../room/ElevatorIcon";

const ICONS = { stairs: StairsIcon, elevator: ElevatorIcon };

// 관제 화면(Monitoring)에서 계단/엘리베이터 심볼을 그대로 보여주는 읽기 전용 레이어 —
// 편집 기능은 components/editor/StructureLayer.jsx(Floor Editor 전용)에 있다.
// 방(room)이 아니라 문(door)과 동일한 순수 구조 심볼이라 상태색이 없다. 테두리 없이,
// 배경은 평면도 배경색(--map-background)에 맞추고 심볼은 var(--text)로 그려서
// 라이트/다크 모드 어느 쪽이든 배경에 자연스럽게 묻히면서도 심볼 자체는 또렷하게
// 보이도록 한다 (2026-07-22 피드백).
function FloorStructures({ structures }) {
    if (!structures || structures.length === 0) return null;

    return (
        <g>
            {structures.map((structure) => {
                const points = structure.polygon
                    .map(([x, y]) => `${x * 1000},${y * 700}`)
                    .join(" ");
                const Icon = ICONS[structure.type];

                return (
                    <g key={structure.id}>
                        <polygon
                            points={points}
                            fill="var(--map-background)"
                            stroke="none"
                        />
                        {Icon && <Icon room={structure} color="var(--text)" />}
                    </g>
                );
            })}
        </g>
    );
}

export default FloorStructures;
