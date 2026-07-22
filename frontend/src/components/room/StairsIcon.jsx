const CANVAS_W = 1000;
const CANVAS_H = 700;
const TREAD_COUNT = 6;

// room.type === "stairs"인 방 위에 겹쳐 그리는 계단 기호 — 건축 도면에서 흔히 쓰는
// "디딤판(평행선) + 진행 방향 화살표" 형태. 방 폴리곤의 바운딩 박스를 기준으로 계산해서
// 사각형이 아닌(회전/비정형) 폴리곤이어도 대략적인 위치에 맞게 그려진다.
// color: 모니터링 화면은 진한 상태색 위에 그려지므로 기본값(흰색)이 잘 보이지만, Floor
// Editor는 옅은 반투명 선택색 위에 그려져 흰색이 묻히므로 더 어두운 색을 넘겨서 쓴다.
function StairsIcon({ room, color = "white" }) {
    const xs = room.polygon.map(([x]) => x * CANVAS_W);
    const ys = room.polygon.map(([, y]) => y * CANVAS_H);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const width = maxX - minX;
    const height = maxY - minY;
    if (width <= 0 || height <= 0) return null;

    const margin = Math.min(width, height) * 0.18;
    const x0 = minX + margin;
    const x1 = maxX - margin;
    const y0 = minY + margin;
    const y1 = maxY - margin;

    // 진행 방향(계단을 오르내리는 방향)은 방의 긴 변 쪽 — 디딤판(tread) 선은 그와
    // 수직으로 짧은 변 방향을 가로지르며 늘어선다.
    const vertical = width >= height;
    const treads = [];
    for (let i = 0; i <= TREAD_COUNT; i++) {
        if (vertical) {
            const x = x0 + ((x1 - x0) * i) / TREAD_COUNT;
            treads.push(<line key={i} x1={x} y1={y0} x2={x} y2={y1} />);
        } else {
            const y = y0 + ((y1 - y0) * i) / TREAD_COUNT;
            treads.push(<line key={i} x1={x0} y1={y} x2={x1} y2={y} />);
        }
    }

    const midStart = vertical ? { x: x0, y: (y0 + y1) / 2 } : { x: (x0 + x1) / 2, y: y0 };
    const midEnd = vertical ? { x: x1, y: (y0 + y1) / 2 } : { x: (x0 + x1) / 2, y: y1 };
    const angle = Math.atan2(midEnd.y - midStart.y, midEnd.x - midStart.x);
    const arrowSize = Math.max(6, Math.min(width, height) * 0.12);
    const a1 = angle + Math.PI * 0.8;
    const a2 = angle - Math.PI * 0.8;

    return (
        <g stroke={color} strokeWidth="2" opacity="0.85" fill="none" pointerEvents="none">
            {treads}
            <line
                x1={midStart.x}
                y1={midStart.y}
                x2={midEnd.x}
                y2={midEnd.y}
                strokeDasharray="1 5"
                strokeLinecap="round"
            />
            <polyline
                points={`${midEnd.x + Math.cos(a1) * arrowSize},${midEnd.y + Math.sin(a1) * arrowSize} ${midEnd.x},${midEnd.y} ${midEnd.x + Math.cos(a2) * arrowSize},${midEnd.y + Math.sin(a2) * arrowSize}`}
            />
        </g>
    );
}

export default StairsIcon;
