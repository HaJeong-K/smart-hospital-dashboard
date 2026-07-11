import RoomPolygon from "./RoomPolygon";

function RoomOverlay({

    rooms,

    onRoomClick,

}) {

    return (

        <>

            {

                rooms.map(room=>(

                    <RoomPolygon

                        key={room.id}

                        room={room}

                        onClick={()=>

                            onRoomClick(room)

                        }

                    />

                ))

            }

        </>

    );

}

export default RoomOverlay;