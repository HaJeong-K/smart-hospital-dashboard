import { useMemo } from "react";

import FloorImage from "./FloorImage";

import RoomOverlay from "../room/RoomOverlay";

import SensorOverlay from "../sensor/SensorOverlay";

import FloorWalls from "./FloorWalls";

import FloorDoors from "./FloorDoors";

import FloorStructures from "./FloorStructures";

import FloorHeader from "../dashboard/FloorHeader";

const CANVAS_W = 1000;
const CANVAS_H = 700;
const ZOOM_PADDING_RATIO = 0.035; // 방/벽이 차지한 영역 기준 여백(그 영역 크기 대비 비율) — 평면도를 더 크게 보이게 하기 위해 축소 (2026-07-22 피드백)

// 방(room) 폴리곤 + 벽(wall) 선 + 계단/엘리베이터 심볼이 실제로 그려진 영역만 계산한다 —
// 0~1 정규화 좌표 기준. 셋 다 포함해야 방이 없는 복도/외벽/계단실 구간까지 잘리지 않고
// 화면에 들어온다.
function getRoomsBoundingBox(rooms, walls, structures) {
    const roomPoints = (rooms || []).flatMap((room) => room.polygon || []);
    const wallPoints = (walls || []).flatMap((wall) => wall.points || []);
    const structurePoints = (structures || []).flatMap((s) => s.polygon || []);
    const points = [...roomPoints, ...wallPoints, ...structurePoints];
    if (points.length === 0) return null;

    const xs = points.map(([x]) => x);
    const ys = points.map(([, y]) => y);

    return {
        minX: Math.min(...xs),
        maxX: Math.max(...xs),
        minY: Math.min(...ys),
        maxY: Math.max(...ys),
    };
}

// 실제 평면도 이미지가 업로드된 층은 이미지 전체(1000x700)를 그대로 보여주고,
// 아직 이미지가 없는 층(데모/미등록 상태)은 등록된 방들이 실제로 그려진 영역만큼만
// 확대해서 보여준다. 방이 캔버스의 한쪽 구석에만 배치돼 있을 때, 나머지 빈 캔버스
// 때문에 정작 방들은 작게 보이던 문제를 해결한다 (2026-07-22 피드백 — "평면도 더 키워줘").
function getViewBox(floor) {
    if (floor.floorMap?.src) {
        return { x: 0, y: 0, w: CANVAS_W, h: CANVAS_H };
    }

    const box = getRoomsBoundingBox(floor.rooms, floor.walls, floor.structures);
    if (!box) return { x: 0, y: 0, w: CANVAS_W, h: CANVAS_H };

    const { minX, maxX, minY, maxY } = box;
    const padX = (maxX - minX) * ZOOM_PADDING_RATIO || 0.03;
    const padY = (maxY - minY) * ZOOM_PADDING_RATIO || 0.03;

    const x0 = Math.max(0, minX - padX);
    const y0 = Math.max(0, minY - padY);
    const x1 = Math.min(1, maxX + padX);
    const y1 = Math.min(1, maxY + padY);

    return {
        x: x0 * CANVAS_W,
        y: y0 * CANVAS_H,
        w: (x1 - x0) * CANVAS_W,
        h: (y1 - y0) * CANVAS_H,
    };
}

function FloorCanvas({

    floor,

    statusFilter,

    onRoomClick,

}){

    const viewBox = useMemo(() => getViewBox(floor), [floor]);

    return(

        <div className="floor-canvas">

            <FloorHeader

                floor={floor}

            />

            {/* preserveAspectRatio="xMidYMid meet" (기본값): 균일 스케일로 늘어짐/눌림 없이 표시한다.
                "slice"는 박스를 꽉 채우지만 좌우(또는 상하)가 잘려서 방("301", "화장실" 등)이 화면
                밖으로 잘려 보이는 문제가 있었다 — .floor-svg에 준 object-fit:contain(layout.css)이
                잘리지 않고 박스 안에 딱 맞게 축소해 보여주는 역할을 한다 (늘어짐도, 잘림도 없음). */}
            <svg

                className="floor-svg"

                viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}

                preserveAspectRatio="xMidYMid meet"

            >

                <FloorImage floor={floor} showGrid={false}/>

                <FloorWalls walls={floor.walls} />

                <FloorStructures structures={floor.structures} />

                <FloorDoors doors={floor.doors} />

                <RoomOverlay

                    rooms={floor.rooms}

                    statusFilter={statusFilter}

                    onRoomClick={onRoomClick}

                    viewBox={viewBox}

                />

                <SensorOverlay

                    rooms={floor.rooms}

                    statusFilter={statusFilter}

                />

            </svg>

        </div>

    );

}

export default FloorCanvas;
