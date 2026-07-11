import FloorImage from "./FloorImage";

import RoomOverlay from "../room/RoomOverlay";

import SensorOverlay from "../sensor/SensorOverlay";

import FloorHeader from "../dashboard/FloorHeader";

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