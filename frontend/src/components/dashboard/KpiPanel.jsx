// ⚠️ DEPRECATED — Dashboard.jsx가 이제 MonitoringKpiPanel(최종 스펙에 정의된 5개 KPI)을
// 사용하므로 이 컴포넌트는 더 이상 라우팅에서 쓰이지 않는다. 삭제 도구가 없어 코드만 남겨둔다.
import KpiCard from "./KpiCard";
import { useDashboardStore } from "../../store/useDashboardStore";
import { getFacilityStats } from "../../utils/stats";

function KpiPanel() {
    const floors = useDashboardStore((s) => s.hospital.floors);
    const alarms = useDashboardStore((s) => s.alarms);
    const stats = getFacilityStats(floors);

    return (
        <div className="kpi-panel">

            <KpiCard
                title="입원환자"
                value={String(stats.totalPatients)}
                type="patient"
            />

            <KpiCard
                title="병실"
                value={String(stats.totalPatientRooms)}
                type="room"
            />

            <KpiCard
                title="Radar"
                value={String(stats.sensorTotal)}
                type="radar"
            />

            <KpiCard
                title="Alarm"
                value={String(alarms.length)}
                type="alarm"
            />

        </div>
    );
}

export default KpiPanel;
