import FloorImage from "./FloorImage";

import RoomOverlay from "../room/RoomOverlay";

import SensorOverlay from "../sensor/SensorOverlay";

import FloorHeader from "../dashboard/FloorHeader";

// preserveAspectRatio="xMidYMid meet" (기본값): 균일 스케일로 늘어짐/눌림 없이 표시한다.
// "slice"는 박스를 꽉 채우지만 좌우(또는 상하)가 잘려서 방("301", "화장실" 등)이 화면
// 밖으로 잘려 보이는 문제가 있었다 — .floor-svg에 준 object-fit:contain(layout.css)이
// 잘리지 않고 박스 안에 딱 맞게 축소해 보여주는 역할을 한다 (늘어짐도, 잘림도 없음).
function FloorCanvas({

    floor,

    onRoomClick,

}){

    return(

        <div className="floor-canvas">

            <FloorHeader

                floor={floor}

            />

            <svg

                className="floor-svg"

                viewBox="0 0 1000 700"

                preserveAspectRatio="xMidYMid meet"

            >

                <FloorImage floor={floor}/>

                <RoomOverlay

                    rooms={floor.rooms}

                    onRoomClick={onRoomClick}

                />

                <SensorOverlay

                    rooms={floor.rooms}

                />

            </svg>

        </div>

    );

}

export default FloorCanvas;