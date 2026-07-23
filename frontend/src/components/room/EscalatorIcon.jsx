import escalatorIconSrc from "../../assets/icons/escalator.png";

const CANVAS_W = 1000;
const CANVAS_H = 700;

// room.type === "escalator"인 구조물 위에 겹쳐 그리는 에스컬레이터 기호 — 사용자가
// 제공한 참고 아이콘(에스컬레이터.png)을 그대로 사용한다. StairsIcon과 동일하게
// 방 폴리곤의 바운딩 박스 중심에 정사각형으로 맞춰 배치한다.
function EscalatorIcon({ room }) {
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
    const size = Math.min(width, height) * 0.75;

    return (
        <image
            className="raster-structure-icon"
            href={escalatorIconSrc}
            x={cx - size / 2}
            y={cy - size / 2}
            width={size}
            height={size}
            preserveAspectRatio="xMidYMid meet"
            pointerEvents="none"
        />
    );
}

export default EscalatorIcon;
