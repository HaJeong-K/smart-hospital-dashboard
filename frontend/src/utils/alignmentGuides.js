// 캔바/미리캔버스 스타일 정렬 안내선 — 방/구조물을 드래그로 옮길 때, 다른 방/구조물과
// 중심뿐 아니라 좌/우/상/하 경계까지 가까워지면 그 축을 감지한다. 같은 크기의 방을
// 나란히 붙일 때 경계선(가장자리)까지 맞춰줘야 "각지고 깔끔하게" 배치되므로, 중심 정렬만
// 있던 것에 경계 정렬을 더했다 (2026-07-22 피드백 — "옆 구조체랑 크기, 위치 맞추는거").

export const SVG_WIDTH = 1000;
export const SVG_HEIGHT = 700;
export const SNAP_THRESHOLD = 6; // 캔버스 단위(1000x700 기준)

export function polygonBox(polygon) {
    const xs = polygon.map(([x]) => x * SVG_WIDTH);
    const ys = polygon.map(([, y]) => y * SVG_HEIGHT);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    return {
        minX,
        maxX,
        minY,
        maxY,
        centerX: (minX + maxX) / 2,
        centerY: (minY + maxY) / 2,
    };
}

// movedPolygon(드래그 중인 도형)의 좌/중앙/우, 상/중앙/하 좌표를 targetPolygons(다른
// 방/구조물들)의 같은 3개 기준선과 비교해서, SNAP_THRESHOLD 이내로 가까운 축이 있으면
// 그 좌표를 돌려준다(위치를 강제로 옮기지는 않고, 안내선 표시 용도로만 쓴다).
export function findAlignmentGuide(movedPolygon, targetPolygons) {
    const box = polygonBox(movedPolygon);
    const xCandidates = [box.minX, box.centerX, box.maxX];
    const yCandidates = [box.minY, box.centerY, box.maxY];

    let guideX = null;
    let guideY = null;

    for (const targetPolygon of targetPolygons) {
        const t = polygonBox(targetPolygon);
        const tXs = [t.minX, t.centerX, t.maxX];
        const tYs = [t.minY, t.centerY, t.maxY];

        if (guideX === null) {
            for (const cx of xCandidates) {
                const hit = tXs.find((tx) => Math.abs(tx - cx) < SNAP_THRESHOLD);
                if (hit !== undefined) {
                    guideX = hit;
                    break;
                }
            }
        }

        if (guideY === null) {
            for (const cy of yCandidates) {
                const hit = tYs.find((ty) => Math.abs(ty - cy) < SNAP_THRESHOLD);
                if (hit !== undefined) {
                    guideY = hit;
                    break;
                }
            }
        }

        if (guideX !== null && guideY !== null) break;
    }

    return { x: guideX, y: guideY };
}

// 변(edge) 중점 핸들로 크기를 조정할 때 쓰는 버전 — movingCoord(지금 드래그로 움직이는
// 변의 좌표, 캔버스 단위)가 만들어내는 폭(axis="x") 또는 높이(axis="y")가 다른 방/
// 구조물의 폭/높이와 같아지면, 그 변의 현재 좌표를 그대로 안내선 좌표로 돌려준다
// (2026-07-22 피드백 — "옆 구조체랑 크기 같아졌을 때 선").
export function findSizeMatchGuide(polygon, targetPolygons, axis, movingCoord) {
    const box = polygonBox(polygon);
    const size = axis === "x" ? box.maxX - box.minX : box.maxY - box.minY;

    for (const targetPolygon of targetPolygons) {
        const t = polygonBox(targetPolygon);
        const targetSize = axis === "x" ? t.maxX - t.minX : t.maxY - t.minY;
        if (Math.abs(size - targetSize) < SNAP_THRESHOLD) {
            return axis === "x" ? { x: movingCoord, y: null } : { x: null, y: movingCoord };
        }
    }

    return { x: null, y: null };
}
