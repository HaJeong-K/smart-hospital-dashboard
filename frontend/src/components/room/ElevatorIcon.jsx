const CANVAS_W = 1000;
const CANVAS_H = 700;

// room.type === "elevator"인 방 위에 겹쳐 그리는 엘리베이터 기호 — 실제 엘리베이터
// 호출버튼/안내판과 동일하게 사각 테두리(칸) 안에 위/아래 삼각형을 넣는다. 테두리가
// "엘리베이터 칸(샤프트)"임을 분명히 해서, 삼각형만 떠 있던 기존 방식보다 한눈에
// "엘리베이터"로 읽히도록 한다. StairsIcon과 동일하게 방 폴리곤의 바운딩 박스 중심을
// 기준으로 계산해서 사각형이 아닌 폴리곤이어도 대략 중앙에 그려진다.
function ElevatorIcon({ room, color = "white" }) {
    const xs = room.polygon.map(([x]) => x * CANVAS_W);
    const ys = room.polygon.map(([, y]) => y * CANVAS_H);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const width = maxX - minX;
    const height = maxY - minY;
    if (width <= 0 || height <= 0) return null;

    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    const boxSize = Math.min(width, height) * 0.6;
    const boxW = boxSize;
    const boxH = boxSize * 1.15;

    const triSize = boxW * 0.3;
    const gap = boxH * 0.08;

    const upTri = `${cx},${cy - gap - triSize} ${cx - triSize * 0.6},${cy - gap} ${cx + triSize * 0.6},${cy - gap}`;
    const downTri = `${cx},${cy + gap + triSize} ${cx - triSize * 0.6},${cy + gap} ${cx + triSize * 0.6},${cy + gap}`;

    return (
        <g pointerEvents="none">
            <rect
                x={cx - boxW / 2}
                y={cy - boxH / 2}
                width={boxW}
                height={boxH}
                rx={boxW * 0.12}
                fill="none"
                stroke={color}
                strokeWidth="2"
                opacity="0.9"
            />
            <g fill={color} opacity="0.9">
                <polygon points={upTri} />
                <polygon points={downTri} />
            </g>
        </g>
    );
}

export default ElevatorIcon;
