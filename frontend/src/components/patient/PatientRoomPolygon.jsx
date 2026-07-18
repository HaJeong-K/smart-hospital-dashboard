import { useState } from "react";

import PatientRoomLabel from "./PatientRoomLabel";
import { STATUS_META } from "../../data/floorsData";

// Dashboard의 RoomPolygon을 기반으로 하되, 환자 관리 화면에서 "확대된" 배치도로
// 쓰이도록 클릭 시 모달(전체 이력)을 열고, 병실 안에 모든 환자 이름을 나열한다.
function PatientRoomPolygon({ room, onClick }) {
    const [hover, setHover] = useState(false);

    const points = room.polygon.map(([x, y]) => `${x * 1000},${y * 700}`).join(" ");

    const centerX = (room.polygon.reduce((a, b) => a + b[0], 0) / room.polygon.length) * 1000;
    const centerY = (room.polygon.reduce((a, b) => a + b[1], 0) / room.polygon.length) * 700;

    // 배치도가 주어진 영역을 최대한 활용하도록, 라벨이 방 폭/높이에 맞춰
    // 좌우 2단 배치·글자 크기를 스스로 계산할 수 있게 방의 실제 크기(px)를 함께 넘긴다.
    const xs = room.polygon.map(([x]) => x * 1000);
    const ys = room.polygon.map(([, y]) => y * 700);
    const boxWidth = Math.max(...xs) - Math.min(...xs);
    const boxHeight = Math.max(...ys) - Math.min(...ys);

    const status = room.status.room;

    return (
        <g
            className={`room enlarged ${status}`}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={onClick}
            style={{ cursor: "pointer" }}
        >
            <polygon
                points={points}
                fill={STATUS_META[status]?.color}
                stroke="white"
                strokeWidth={hover ? 6 : 3}
                opacity={hover ? 1 : 0.88}
            />

            <PatientRoomLabel
                room={room}
                centerX={centerX}
                centerY={centerY}
                boxWidth={boxWidth}
                boxHeight={boxHeight}
                status={status}
            />
        </g>
    );
}

export default PatientRoomPolygon;
