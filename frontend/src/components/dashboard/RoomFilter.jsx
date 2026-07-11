import { Filter } from "lucide-react";

const filters = [
    {
        key: "all",
        label: "전체",
    },
    {
        key: "normal",
        label: "정상",
    },
    {
        key: "warning",
        label: "주의",
    },
    {
        key: "danger",
        label: "위험",
    },
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

                        {item.label}

                    </button>

                ))

            }

        </div>

    );

}

export default RoomFilter;