import FloorImage from "./FloorImage";

import RoomOverlay from "../room/RoomOverlay";
import SensorOverlay from "../sensor/SensorOverlay";

function FloorCanvas({

    floor,

    onRoomClick,

}) {

    return (

        <div className="floor-canvas">

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