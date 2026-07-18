import { Filter } from "lucide-react";

import { STATUS_META } from "../../data/floorsData";

// 이모지 대신 범례(FloorLegend)와 동일한 단색 원(.legend)으로 상태를 표시해
// 화면 전체에서 상태 표기 방식을 하나로 통일한다.
const filters = [
    { key: "all", label: "전체" },
    { key: "normal", label: "정상" },
    { key: "inactive", label: "움직임 없음" },
    { key: "warning", label: "호흡 이상" },
    { key: "danger", label: "낙상" },
    { key: "sensor", label: "센서 오류" },
];

function RoomFilter({
    selected,
    onChange,
}) {

    return (

        <div className="room-filter">

            <Filter size={18}/>

            {

                filters.map(item=>(

                    <button

                        key={item.key}

                        className={selected===item.key?"active":""}

                        onClick={()=>onChange(item.key)}

                    >

                        {item.key !== "all" && <span className={`legend ${item.key}`} />}
                        {item.label}

                    </button>

                ))

            }

        </div>

    );

}

export default RoomFilter;
