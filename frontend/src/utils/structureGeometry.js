// 벽(wall)/문(door) — 방(room)과 달리 센서·환자와 무관한 순수 "건물 구조" 요소.
// 방 폴리곤과 동일하게 좌표는 0~1 정규화 값으로 저장하고, 렌더링 시점(에디터/모니터링)에
// 캔버스 크기(1000x700)로 환산한다. 이 파일은 그 환산·문 기호(door glyph) 계산을
// 에디터(WallLayer/DoorLayer)와 모니터링 표시(FloorWalls/FloorDoors)가 공통으로 쓰도록 모아둔다.

export const CANVAS_W = 1000;
export const CANVAS_H = 700;

export function toCanvasPoints(points) {
    return (points || []).map(([x, y]) => [x * CANVAS_W, y * CANVAS_H]);
}

export function pointsToString(points) {
    return toCanvasPoints(points)
        .map(([x, y]) => `${x},${y}`)
        .join(" ");
}

function uid(prefix = "id") {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createWall(points, thickness = 0.006) {
    return { id: uid("wall"), points, thickness };
}

const DEFAULT_DOOR_WIDTH = 0.03; // 캔버스 폭(1000) 대비 비율 — 약 30 유닛(사람 한 명 지나갈 정도)

export function createDoor(x, y, angle, width = DEFAULT_DOOR_WIDTH) {
    return { id: uid("door"), x, y, angle, width };
}

// 계단/엘리베이터 — 문과 마찬가지로 방(room)이 아니라 순수 구조 심볼이다. 사각형 방처럼
// 드래그로 폴리곤(사각형 4점)을 잡지만, zones/beds/sensors/status 같은 방 데이터는
// 전혀 갖지 않는다 — 그리려면 유형을 먼저 고르고 사각형을 그은 뒤 심볼이 뜨는 게 아니라,
// 문처럼 "그 심볼 자체를 놓는" 전용 도구로 바로 생성된다 (2026-07-22 피드백).
export function createStructure(type, polygon) {
    return { id: uid(type), type, polygon };
}

// 클릭 지점(px, py — 캔버스 단위)에서 가장 가까운 벽 세그먼트를 찾아, 그 위로 투영(snap)한
// 좌표 + 세그먼트 방향(angle, degree)을 돌려준다. 문은 항상 벽 위에만 놓일 수 있다.
export function findNearestWallPoint(walls, px, py) {
    let best = null;

    for (const wall of walls || []) {
        const pts = toCanvasPoints(wall.points);
        for (let i = 0; i < pts.length - 1; i++) {
            const [x1, y1] = pts[i];
            const [x2, y2] = pts[i + 1];
            const dx = x2 - x1;
            const dy = y2 - y1;
            const lenSq = dx * dx + dy * dy;
            if (lenSq === 0) continue;

            let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
            t = Math.max(0, Math.min(1, t));

            const sx = x1 + t * dx;
            const sy = y1 + t * dy;
            const dist = Math.hypot(px - sx, py - sy);

            if (!best || dist < best.dist) {
                const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
                best = { dist, x: sx / CANVAS_W, y: sy / CANVAS_H, angle };
            }
        }
    }

    return best;
}

// 문 기호(door glyph) — 경첩(hinge)에서 벽과 수직 방향으로 뻗은 문짝(leaf) 직선과,
// 문짝이 닫힌 위치(벽을 따라)까지 이어지는 열림 궤적(호, arc)을 계산한다.
// 건축 도면에서 흔히 쓰는 표준 문 기호와 동일한 형태.
export function getDoorGeometry(door) {
    const hx = door.x * CANVAS_W;
    const hy = door.y * CANVAS_H;
    const w = (door.width || DEFAULT_DOOR_WIDTH) * CANVAS_W;
    const wallRad = (door.angle * Math.PI) / 180;
    const leafRad = wallRad + Math.PI / 2;

    const leafX = hx + Math.cos(leafRad) * w;
    const leafY = hy + Math.sin(leafRad) * w;

    const closedX = hx + Math.cos(wallRad) * w;
    const closedY = hy + Math.sin(wallRad) * w;

    return {
        hinge: { x: hx, y: hy },
        leafEnd: { x: leafX, y: leafY },
        closedEnd: { x: closedX, y: closedY },
        radius: w,
        // 경첩 → 문짝 끝 → 닫힘 위치를 잇는 부채꼴 호(quarter arc)
        arcPath: `M ${leafX} ${leafY} A ${w} ${w} 0 0 0 ${closedX} ${closedY}`,
        // 경첩→문짝→열림 궤적을 하나의 연속된 선(hook 모양)으로 그리기 위한 path.
        // 참고 이미지(door.png)처럼 점/파선 없이 매끄러운 단일 선으로 표현한다.
        glyphPath: `M ${hx} ${hy} L ${leafX} ${leafY} A ${w} ${w} 0 0 0 ${closedX} ${closedY}`,
    };
}
