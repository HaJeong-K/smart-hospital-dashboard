import { ROOM_TYPES, STATUS_META } from "../../data/floorsData";

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// 환자 관리 화면 전용 라벨.
// - 상태 색상은 방 폴리곤 채우기 색 하나로만 표현하고(중복 방지), 라벨 맨 앞에는
//   테두리 없는 작은 점 하나를 곁들여 상태를 보조 설명한다.
// - 다인실(최대 8인실)은 좌/우 2열로 나눠 표시한다 (예: 8인실 → 좌측 4명, 우측 4명).
// - 방의 실제 크기(boxWidth/boxHeight)에 맞춰 글자 크기와 좌우 열 간격을 계산해서,
//   배치도가 확대되어도 글자가 밀리거나 잘리지 않고 주어진 영역을 최대한 활용하도록 한다.
function PatientRoomLabel({ room, centerX, centerY, boxWidth = 140, boxHeight = 110, status }) {
    const isPatientRoom = room.type === "patient";
    const dotColor = STATUS_META[status]?.color || STATUS_META.normal.color;

    if (!isPatientRoom) {
        // 로비/공용화장실/복도처럼 room.roomNo 자체가 이미 유형명과 같은 경우
        // "공용화장실 · 공용화장실"처럼 중복 표기되는 문제가 있었다 — roomNo와
        // 유형 라벨이 실제로 다를 때만("101"호 · 처치실처럼) 유형을 덧붙인다.
        const typeLabel = ROOM_TYPES[room.type]?.label || "";
        const showTypeLabel = typeLabel && typeLabel !== room.roomNo;
        const fontSize = clamp(Math.min(boxWidth, boxHeight) / 7, 13, 19);
        return (
            <g>
                <circle cx={centerX - fontSize * 3.6} cy={centerY} r={Math.max(4, fontSize * 0.28)} fill={dotColor} />
                <text
                    x={centerX + fontSize * 0.3}
                    y={centerY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize={fontSize}
                    fontWeight="700"
                >
                    {room.roomNo}{showTypeLabel ? ` · ${typeLabel}` : ""}
                </text>
            </g>
        );
    }

    const beds = room.beds;
    const count = beds.length;
    const useTwoColumns = count > 2;
    const leftCount = useTwoColumns ? Math.ceil(count / 2) : count;
    const rightCount = useTwoColumns ? count - leftCount : 0;
    const rowsPerColumn = Math.max(leftCount, rightCount, 1);

    // 제목(호실명) 영역을 위쪽에 확보하고 남은 높이를 이름 목록 줄 간격으로 나눈다.
    const titleFontSize = clamp(boxWidth / 9, 14, 20);
    const titleBlockHeight = titleFontSize + 14;
    const availableHeight = Math.max(boxHeight - titleBlockHeight - 10, rowsPerColumn * 16);
    const lineHeight = clamp(availableHeight / rowsPerColumn, 16, 30);

    // 열 폭 기준으로도 글자 크기를 한 번 더 제한해서(대략 6~8자 이름 기준) 잘리지 않게 한다.
    const columnWidth = useTwoColumns ? boxWidth / 2 - 14 : boxWidth - 20;
    const widthBasedFont = columnWidth / 4.6;
    const nameFontSize = clamp(Math.min(lineHeight - 6, widthBasedFont), 11, 16);

    const totalHeight = lineHeight * rowsPerColumn;
    const titleY = centerY - totalHeight / 2 - titleBlockHeight / 2;
    const firstRowY = centerY - totalHeight / 2 + lineHeight / 2;

    const columnOffset = useTwoColumns ? clamp(boxWidth / 4, 34, 92) : 0;

    const leftBeds = useTwoColumns ? beds.slice(0, leftCount) : beds;
    const rightBeds = useTwoColumns ? beds.slice(leftCount) : [];

    const renderColumn = (columnBeds, x, startIndex) =>
        columnBeds.map((bed, i) => {
            const name = bed.patient?.name || "공석";
            const index = startIndex + i;
            return (
                <text
                    key={bed.id}
                    x={x}
                    y={firstRowY + i * lineHeight}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={name === "공석" ? "rgba(255,255,255,.65)" : "white"}
                    fontStyle={name === "공석" ? "italic" : "normal"}
                    fontSize={nameFontSize}
                    fontWeight="600"
                >
                    {index + 1}. {name}
                </text>
            );
        });

    const titleText = `${room.roomNo} (${count}인실)`;
    const titleHalfWidth = (titleText.length * titleFontSize * 0.58) / 2;

    return (
        <g>
            <circle
                cx={centerX - titleHalfWidth - Math.max(8, titleFontSize * 0.3)}
                cy={titleY}
                r={Math.max(4, titleFontSize * 0.26)}
                fill={dotColor}
            />
            <text
                x={centerX}
                y={titleY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize={titleFontSize}
                fontWeight="800"
            >
                {room.roomNo} ({count}인실)
            </text>

            {useTwoColumns ? (
                <>
                    {renderColumn(leftBeds, centerX - columnOffset, 0)}
                    {renderColumn(rightBeds, centerX + columnOffset, leftCount)}
                </>
            ) : (
                renderColumn(leftBeds, centerX, 0)
            )}
        </g>
    );
}

export default PatientRoomLabel;
