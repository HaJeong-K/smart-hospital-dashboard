const CANVAS_W = 1000;
const CANVAS_H = 700;

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// 방이 작거나(작은 화장실/구석 공간) 이름이 길면("응급의료센터" 등) 고정 18px 글자가
// 박스 밖으로 삐져나오는 문제가 있었다 — 방의 실제 크기와 글자 길이를 함께 고려해
// 박스 안에 들어가는 선에서 가능한 큰 글자 크기를 계산한다 (PatientRoomLabel과 동일한
// 방식, 2026-07-22 피드백).
// 호실 번호 입력창이 textarea로 바뀌어 Enter로 줄바꿈을 넣을 수 있게 됐다 — SVG
// <text>는 \n을 자동으로 줄바꿈하지 않으므로, 줄 단위로 쪼개서 <tspan>으로 하나씩
// 그리고 줄 수까지 감안해 글자 크기를 계산한다 (2026-07-22 피드백).
function RoomLabel({ room, color = "white" }) {

    const xs = room.polygon.map(([x]) => x);
    const ys = room.polygon.map(([, y]) => y);

    const centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
    const centerY = (Math.min(...ys) + Math.max(...ys)) / 2;

    const boxWidth = (Math.max(...xs) - Math.min(...xs)) * CANVAS_W;
    const boxHeight = (Math.max(...ys) - Math.min(...ys)) * CANVAS_H;

    const lines = (room.roomNo || "").split("\n");
    const longestLine = Math.max(...lines.map((line) => line.length), 1);

    // 글자 폭은 대략 "폰트 크기 x 0.6 x 글자수"로 근사하고, 박스 폭의 82% 안에는
    // 들어오도록 역산한다. 세로는 줄 수(lines.length)만큼 줄 간격을 곱한 값이 박스
    // 높이를 넘지 않도록 상한을 건다.
    const widthBasedSize = (boxWidth * 0.82) / (longestLine * 0.6);
    const heightBasedSize = (boxHeight * 0.8) / (lines.length * 1.25);
    const fontSize = clamp(Math.min(widthBasedSize, heightBasedSize), 9, 18);
    const lineHeight = fontSize * 1.25;

    const x = centerX * CANVAS_W;
    const firstLineY = centerY * CANVAS_H - ((lines.length - 1) * lineHeight) / 2;

    return (

        <text

            x={x}

            textAnchor="middle"

            fill={color}

            fontSize={fontSize}

            fontWeight="700"

        >

            {lines.map((line, index) => (
                <tspan
                    key={index}
                    x={x}
                    y={firstLineY + index * lineHeight}
                    dominantBaseline="middle"
                >
                    {line}
                </tspan>
            ))}

        </text>

    );

}

export default RoomLabel;
