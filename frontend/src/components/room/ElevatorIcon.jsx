const CANVAS_W = 1000;
const CANVAS_H = 700;

// room.type === "elevator"인 방 위에 겹쳐 그리는 엘리베이터 기호 — 실제 엘리베이터
// 호출 버튼과 동일한 위/아래 삼각형(▲▼) 아이콘. StairsIcon과 동일하게 방 폴리곤의
// 바운딩 박스 중심을 기준으로 계산해서 사각형이 아닌 폴리곤이어도 대략 중앙에 그려진다.
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
    const size = Math.max(8, Math.min(width, height) * 0.32);
    const gap = size * 0.35;

    const upTri = `${cx},${cy - gap - size} ${cx - size * 0.55},${cy - gap} ${cx + size * 0.55},${cy - gap}`;
    const downTri = `${cx},${cy + gap + size} ${cx - size * 0.55},${cy + gap} ${cx + size * 0.55},${cy + gap}`;

    return (
        <g fill={color} opacity="0.9" pointerEvents="none">
            <polygon points={upTri} />
            <polygon points={downTri} />
        </g>
    );
}

export default ElevatorIcon;
