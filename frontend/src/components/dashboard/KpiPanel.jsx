import KpiCard from "./KpiCard";

function KpiPanel(){

    return(

        <div className="kpi-panel">

            <KpiCard

                title="입원환자"

                value="58"

                type="patient"

            />

            <KpiCard

                title="병실"

                value="31"

                type="room"

            />

            <KpiCard

                title="Radar"

                value="31"

                type="radar"

            />

            <KpiCard

                title="Alarm"

                value="3"

                type="alarm"

            />

        </div>

    );

}

export default KpiPanel;