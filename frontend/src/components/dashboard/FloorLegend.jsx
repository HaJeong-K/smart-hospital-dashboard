import { STATUS_META } from "../../data/floorsData";

// 5단계 상태 범례 — 색상 규칙: 정상(초록)/움직임 없음(파랑)/호흡 이상(주황)/낙상(빨강)/센서 오류(검정)
const LEGEND_ORDER = ["normal", "inactive", "warning", "danger", "sensor"];

function FloorLegend() {

    return (

        <div className="floor-legend">

            {LEGEND_ORDER.map((key) => (
                <div key={key}>
                    <span className={`legend ${key}`} />
                    {STATUS_META[key].label}
                </div>
            ))}

        </div>

    );

}

export default FloorLegend;
