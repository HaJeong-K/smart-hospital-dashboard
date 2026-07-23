import SensorIcon from "./SensorIcon";

function SensorOverlay({ rooms, statusFilter }) {

    // 상태 필터로 회색 처리된(선택한 상태와 일치하지 않는) 방은 레이더 아이콘도 함께
    // 숨겨서, 필터링과 무관하게 항상 빨갛게 펄스치는 아이콘 때문에 "회색 처리" 효과가
    // 무색해지는 것을 막는다.
    const hasFilter = statusFilter && statusFilter.size > 0;

    return (

        <>

            {

                rooms

                    .filter(room => !hasFilter || statusFilter.has(room.status.room))

                    .map(room=>(

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