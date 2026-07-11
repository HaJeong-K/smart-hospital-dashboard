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

            <Icon size={28}/>

        </div>

    );

}

export default KpiCard;