import SensorIcon from "./SensorIcon";

function SensorOverlay({ rooms }) {

    return (

        <>

            {

                rooms.map(room=>(

                    <SensorIcon

                        key={room.id}

                        room={room}

                    />

                ))

            }

        </>

    );

}

export default SensorOverlay;