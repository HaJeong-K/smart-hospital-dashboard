import RoomPolygon from "./RoomPolygon";

function RoomOverlay({

    rooms,

    statusFilter,

    onRoomClick,

    viewBox,

}) {

    // 필터가 선택된 상태에서는 방을 화면에서 아예 지우지 않고, 선택한 상태와
    // 일치하지 않는 방만 회색으로 흐리게 표시한다 — 배치도 전체 구조는 그대로 유지한 채
    // 원하는 상태만 눈에 띄도록 하기 위함 (필터 없음 = 전부 정상 표시).
    const hasFilter = statusFilter && statusFilter.size > 0;

    return (

        <>

            {

                rooms.map(room=>{

                    const dimmed = hasFilter && !statusFilter.has(room.status.room);

                    return (

                        <RoomPolygon

                            key={room.id}

                            room={room}

                            dimmed={dimmed}

                            viewBox={viewBox}

                            onClick={()=>

                                onRoomClick(room)

                            }

                        />

                    );

                })

            }

        </>

    );

}

export default RoomOverlay;
