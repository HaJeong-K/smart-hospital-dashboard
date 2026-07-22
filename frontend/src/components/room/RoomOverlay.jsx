import RoomPolygon from "./RoomPolygon";

function RoomOverlay({

    rooms,

    onRoomClick,

    viewBox,

}) {

    return (

        <>

            {

                rooms.map(room=>(

                    <RoomPolygon

                        key={room.id}

                        room={room}

                        viewBox={viewBox}

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
