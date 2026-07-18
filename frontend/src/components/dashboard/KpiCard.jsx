import {

    HeartPulse,

    BedDouble,

    TriangleAlert,

    Radar,

} from "lucide-react";

const icons={

    patient:HeartPulse,

    room:BedDouble,

    alarm:TriangleAlert,

    radar:Radar,

};

function KpiCard({

    title,

    value,

    type,

}){

    const Icon=icons[type];
    // 알람 건수 카드만 위험(빨강) 톤, 나머지는 신뢰감 있는 브랜드 블루 톤 배지로 표시한다.
    const tone = type === "alarm" ? "danger" : "primary";

    return(

        <div className="kpi-card">

            <div>

                <span>

                    {title}

                </span>

                <h2>

                    {value}

                </h2>

            </div>

            <div className={`kpi-icon ${tone}`}>
                <Icon size={22}/>
            </div>

        </div>

    );

}

export default KpiCard;