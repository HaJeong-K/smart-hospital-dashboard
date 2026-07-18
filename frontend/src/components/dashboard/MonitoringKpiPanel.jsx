import { Wind, Users, Radar, ShieldAlert, AlertOctagon } from "lucide-react";

import { useDashboardStore } from "../../store/useDashboardStore";
import { getMonitoringStats } from "../../utils/stats";

function MonitoringKpiCard({ icon: Icon, tone, title, value, unit, desc }) {
    return (
        <div className="kpi-card monitoring-kpi-card">
            <div>
                <span>{title}</span>
                <h2>
                    {value}
                    {unit && <small className="kpi-unit">{unit}</small>}
                </h2>
                {desc && <p className="kpi-desc">{desc}</p>}
            </div>
            <div className={`kpi-icon ${tone}`}>
                <Icon size={22} />
            </div>
        </div>
    );
}

// "Monitoring" 탭(구 대시보드+모니터링 통합)의 핵심 KPI 5종.
// 병원 전체의 실시간 상태를 한눈에 관제한다는 목적에 맞춰, 층별 배치도 위쪽에
// 항상 고정으로 노출된다.
function MonitoringKpiPanel() {
    const floors = useDashboardStore((s) => s.hospital.floors);
    const eventLog = useDashboardStore((s) => s.eventLog);
    const connectionStatus = useDashboardStore((s) => s.connectionStatus);

    const stats = getMonitoringStats(floors, eventLog, connectionStatus);

    return (
        <div className="monitoring-kpi-grid">
            <MonitoringKpiCard
                icon={Users}
                tone="primary"
                title="현재 관제 중 환자 수"
                value={stats.monitoredPatients}
                unit="명"
            />

            <MonitoringKpiCard
                icon={Wind}
                tone="primary"
                title="평균 호흡수"
                value={stats.monitoredPatients > 0 ? stats.avgRespRate.toFixed(1) : "-"}
                unit="회/분"
            />

            <MonitoringKpiCard
                icon={Radar}
                tone="primary"
                title="센서 연결률"
                value={stats.sensorConnectionRate.toFixed(0)}
                unit="%"
                desc={connectionStatus === "connected" ? "서버 연결됨" : "서버 연결 끊김"}
            />

            <MonitoringKpiCard
                icon={ShieldAlert}
                tone="danger"
                title="오늘 위험 발생 건수"
                value={stats.todayAlertCount}
                unit="건"
            />

            <MonitoringKpiCard
                icon={AlertOctagon}
                tone="danger"
                title="Critical 이벤트 수"
                value={stats.todayCriticalCount}
                unit="건"
                desc={`오늘 전체 ${stats.todayAlertCount}건 중 ${stats.criticalEventRatio.toFixed(0)}%`}
            />
        </div>
    );
}

export default MonitoringKpiPanel;
