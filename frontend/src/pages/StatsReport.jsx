import { useMemo, useState } from "react";
import {
    BedDouble,
    HeartPulse,
    Radar,
    TriangleAlert,
    CheckCircle2,
    XCircle,
    Wrench,
    Wind,
    Download,
    Clock3,
    ShieldAlert,
    MapPin,
    UserRound,
} from "lucide-react";

import { useDashboardStore } from "../store/useDashboardStore";
import {
    getFacilityStats,
    getMonitoringStats,
    getEventTrend,
    getRoomFrequency,
    getRoomFrequencyByType,
    getTimeOfDayStats,
    getZoneTypeStats,
    topRiskPatients,
    getRespirationTrend,
    getSensorErrorStats,
} from "../utils/stats";
import { STATUS_META } from "../data/floorsData";
import TrendBarChart from "../components/stats/TrendBarChart";

function Bar({ value, total, color }) {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
        <div className="stat-bar-track">
            <div className="stat-bar-fill" style={{ width: `${pct}%`, background: color }} />
        </div>
    );
}

const PERIODS = [
    ["day", "일별", 7],
    ["week", "주별", 6],
    ["month", "월별", 6],
];

// 통계 보고서 — 시설 전체/층별 현황 + 기간별(일/주/월) 위험 발생 추이 + 호실별 위험 발생
// 빈도 + 센서 연결률 + 평균 호흡수 변화 + 이벤트 유형별 통계. (실제 데이터 기반, 하드코딩 없음.
// 단, 평균 호흡수 변화는 실제 활력징후 시계열 로그가 아직 없어 현재 평균값 기준의 참고용
// 시뮬레이션 추이입니다 — utils/stats.js의 getRespirationTrend 주석 참고.)
function StatsReport() {
    const floors = useDashboardStore((s) => s.hospital.floors);
    const eventLog = useDashboardStore((s) => s.eventLog);
    const connectionStatus = useDashboardStore((s) => s.connectionStatus);
    const stats = getFacilityStats(floors);
    const monitoring = getMonitoringStats(floors, eventLog, connectionStatus);

    const [period, setPeriod] = useState("day");
    const periodCount = PERIODS.find(([key]) => key === period)?.[2] || 7;

    const trend = useMemo(() => getEventTrend(eventLog, period, periodCount), [eventLog, period, periodCount]);
    const roomFrequency = useMemo(() => getRoomFrequency(eventLog, 8), [eventLog]);
    const fallFrequency = useMemo(() => getRoomFrequencyByType(eventLog, "fall", 6), [eventLog]);
    const breathFrequency = useMemo(() => getRoomFrequencyByType(eventLog, "breath", 6), [eventLog]);
    const timeOfDay = useMemo(() => getTimeOfDayStats(eventLog), [eventLog]);
    const zoneTypeStats = useMemo(() => getZoneTypeStats(eventLog), [eventLog]);
    const topPatients = useMemo(() => topRiskPatients(floors, 5), [floors]);
    const respTrend = useMemo(() => getRespirationTrend(floors, 7), [floors]);
    const sensorErrorStats = useMemo(() => getSensorErrorStats(floors, 8), [floors]);

    const resolvedConfirmed = eventLog.filter((e) => e.action === "resolved" && e.resolution === "confirmed").length;
    const resolvedFalse = eventLog.filter((e) => e.action === "resolved" && e.resolution === "false_alarm").length;
    const totalResolved = resolvedConfirmed + resolvedFalse;

    const maxRoomFreq = Math.max(1, ...roomFrequency.map((r) => r.count));
    const maxFallFreq = Math.max(1, ...fallFrequency.map((r) => r.count));
    const maxBreathFreq = Math.max(1, ...breathFrequency.map((r) => r.count));
    const maxZoneType = Math.max(1, ...zoneTypeStats.map((z) => z.count));
    const maxSensorError = Math.max(1, ...sensorErrorStats.rows.map((r) => r.count));

    // 현재 시설 전체 병실/구역/환자 현황을 CSV로 내보낸다 (원래 Monitoring 툴바에 있던
    // 버튼을 통계 보고서 화면으로 이동함 — 리포트 다운로드는 통계 화면의 기능이 맞다).
    const downloadReport = () => {
        const rows = [["층", "호실/구역", "유형", "병상", "환자명", "상태", "누적낙상", "누적호흡이상"]];
        for (const floor of floors) {
            for (const room of floor.rooms) {
                if (room.type === "patient" && room.beds.length > 0) {
                    for (const bed of room.beds) {
                        rows.push([
                            floor.name,
                            room.roomNo,
                            room.type,
                            bed.label,
                            bed.patient?.name || "공석",
                            room.status.room,
                            bed.patient?.fallCount || 0,
                            bed.patient?.breathCount || 0,
                        ]);
                    }
                } else {
                    rows.push([floor.name, room.roomNo, room.type, "-", "-", room.status.room, "-", "-"]);
                }
            }
        }
        const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
        const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `현황리포트_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="page-wrap">
            <div className="page-title">
                <div>
                    <h1>통계 보고서</h1>
                    <p>현재 시설 데이터 기준 실시간 집계입니다.</p>
                </div>

                <button className="toolbar-btn danger" onClick={downloadReport}>
                    <Download size={18} />
                    Report
                </button>
            </div>

            <div className="stat-tile-row">
                <div className="stat-tile">
                    <span className="stat-tile__label"><BedDouble size={14} /> 총 병실</span>
                    <div className="stat-tile__value">{stats.totalPatientRooms}</div>
                </div>
                <div className="stat-tile">
                    <span className="stat-tile__label"><HeartPulse size={14} /> 입원 환자</span>
                    <div className="stat-tile__value">{stats.totalPatients}</div>
                </div>
                <div className="stat-tile">
                    <span className="stat-tile__label"><Radar size={14} /> 총 센서</span>
                    <div className="stat-tile__value">{stats.sensorTotal}</div>
                </div>
                <div className="stat-tile">
                    <span className="stat-tile__label"><TriangleAlert size={14} /> 전체 구역</span>
                    <div className="stat-tile__value">{stats.totalRooms}</div>
                </div>
                <div className="stat-tile">
                    <span className="stat-tile__label"><Radar size={14} /> 센서 연결률</span>
                    <div className="stat-tile__value">{monitoring.sensorConnectionRate.toFixed(0)}%</div>
                </div>
                <div className="stat-tile">
                    <span className="stat-tile__label"><Wind size={14} /> 평균 호흡수</span>
                    <div className="stat-tile__value">
                        {monitoring.monitoredPatients > 0 ? monitoring.avgRespRate.toFixed(1) : "-"}
                    </div>
                </div>
            </div>

            <div className="panel-section">
                <div className="page-title" style={{ marginBottom: 12 }}>
                    <h3 style={{ margin: 0 }}>기간별 위험 발생 추이</h3>
                    <div className="chip-group">
                        {PERIODS.map(([key, label]) => (
                            <button
                                key={key}
                                className={`chip ${period === key ? "active" : ""}`}
                                onClick={() => setPeriod(key)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
                <TrendBarChart data={trend} unit="건" color="var(--primary)" />
            </div>

            <div className="panel-section">
                <h3><Clock3 size={16} /> 시간대별 발생 분포</h3>
                <p className="settings-tab-desc">
                    하루 중 어느 시간대에 위험 이벤트가 몰리는지 확인합니다(야간 근무 배치 참고용).
                </p>
                <TrendBarChart
                    data={timeOfDay.map((slot) => ({ label: slot.label, value: slot.total }))}
                    unit="건"
                    color="var(--room-danger)"
                />
                {timeOfDay.some((slot) => slot.total > 0) && (
                    <div style={{ marginTop: 12 }}>
                        {timeOfDay.map((slot) => (
                            <div className="stat-bar-row" key={slot.key}>
                                <span className="stat-bar-label">
                                    {slot.label} · 낙상 {slot.fall} · 호흡이상 {slot.breath}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="panel-section">
                <h3>평균 호흡수 변화 (최근 7일)</h3>
                <p className="settings-tab-desc">
                    실제 센서 이력 연동 전까지는 현재 평균 호흡수를 기준으로 한 참고용 추이입니다.
                </p>
                <TrendBarChart data={respTrend} unit="회/분" color="var(--room-inactive)" />
            </div>

            <div className="panel-section">
                <h3>호실별 위험 발생 빈도 TOP {roomFrequency.length}</h3>
                {roomFrequency.length === 0 ? (
                    <div className="room-empty">아직 발생한 이벤트가 없습니다.</div>
                ) : (
                    roomFrequency.map((r) => (
                        <div className="stat-bar-row" key={r.key}>
                            <span className="stat-bar-label">
                                {r.floorName} {r.roomNo} {r.count}건
                            </span>
                            <Bar value={r.count} total={maxRoomFreq} color="var(--room-warning)" />
                        </div>
                    ))
                )}
            </div>

            <div className="panel-section">
                <h3><ShieldAlert size={16} /> 낙상 다발 구역 TOP {fallFrequency.length}</h3>
                {fallFrequency.length === 0 ? (
                    <div className="room-empty">아직 발생한 낙상 이벤트가 없습니다.</div>
                ) : (
                    fallFrequency.map((r) => (
                        <div className="stat-bar-row" key={r.key}>
                            <span className="stat-bar-label">
                                {r.floorName} {r.roomNo} {r.count}건
                            </span>
                            <Bar value={r.count} total={maxFallFreq} color="var(--room-danger)" />
                        </div>
                    ))
                )}
            </div>

            <div className="panel-section">
                <h3><HeartPulse size={16} /> 호흡이상 다발 구역 TOP {breathFrequency.length}</h3>
                {breathFrequency.length === 0 ? (
                    <div className="room-empty">아직 발생한 호흡이상 이벤트가 없습니다.</div>
                ) : (
                    breathFrequency.map((r) => (
                        <div className="stat-bar-row" key={r.key}>
                            <span className="stat-bar-label">
                                {r.floorName} {r.roomNo} {r.count}건
                            </span>
                            <Bar value={r.count} total={maxBreathFreq} color="var(--room-warning)" />
                        </div>
                    ))
                )}
            </div>

            <div className="panel-section">
                <h3><MapPin size={16} /> 구역 유형별 발생 비교</h3>
                <p className="settings-tab-desc">
                    개별 호실 순위 대신 병실/화장실/복도 등 구역 유형 단위로 묶어, 특정 유형에
                    이벤트가 몰리는 패턴이 있는지 확인합니다.
                </p>
                {zoneTypeStats.length === 0 ? (
                    <div className="room-empty">아직 발생한 이벤트가 없습니다.</div>
                ) : (
                    zoneTypeStats.map((z) => (
                        <div className="stat-bar-row" key={z.type}>
                            <span className="stat-bar-label">{z.label} {z.count}건</span>
                            <Bar value={z.count} total={maxZoneType} color="var(--primary)" />
                        </div>
                    ))
                )}
            </div>

            <div className="panel-section">
                <h3>상태 분포 (전체 {stats.totalRooms}개 구역)</h3>
                {["normal", "inactive", "warning", "danger", "sensor"].map((key) => (
                    <div className="stat-bar-row" key={key}>
                        <span className="stat-bar-label">
                            <span className={`legend ${key}`} /> {STATUS_META[key].label} {stats.counts[key]}
                        </span>
                        <Bar value={stats.counts[key]} total={stats.totalRooms} color={STATUS_META[key].color} />
                    </div>
                ))}
            </div>

            <div className="panel-section">
                <h3>알람 처리 통계 (누적 {totalResolved}건)</h3>
                <p className="settings-tab-desc">
                    처리는 "정상 해제"와 "오탐" 2가지로만 분류합니다. (센서 이상 확인은 별도 처리 항목에서 제외되었습니다.)
                </p>
                <div className="stat-bar-row">
                    <span className="stat-bar-label">
                        <CheckCircle2 size={13} /> 정상 해제 {resolvedConfirmed}
                    </span>
                    <Bar value={resolvedConfirmed} total={totalResolved} color="var(--success)" />
                </div>
                <div className="stat-bar-row">
                    <span className="stat-bar-label">
                        <XCircle size={13} /> 오탐(거짓 알람) {resolvedFalse}
                    </span>
                    <Bar value={resolvedFalse} total={totalResolved} color="var(--text-secondary)" />
                </div>
            </div>

            <div className="panel-section">
                <h3>센서 점검 필요 구역 — 오탐 누적 기준 (전체 {sensorErrorStats.total}건)</h3>
                <p className="settings-tab-desc">
                    오탐으로 처리될 때마다 해당 구역에 누적됩니다. 특정 구역의 누적 건수가 유독 높다면
                    레이더 센서 자체의 오작동을 의심하고 점검이 필요합니다.
                </p>
                {sensorErrorStats.rows.length === 0 ? (
                    <div className="room-empty">아직 오탐으로 처리된 이력이 없습니다.</div>
                ) : (
                    sensorErrorStats.rows.map((r) => (
                        <div className="stat-bar-row" key={r.key}>
                            <span className="stat-bar-label">
                                <Wrench size={13} /> {r.floorName} {r.roomNo} · {r.zoneLabel} {r.count}건
                            </span>
                            <Bar value={r.count} total={maxSensorError} color="var(--room-sensor)" />
                        </div>
                    ))
                )}
            </div>

            <div className="panel-section">
                <h3><UserRound size={16} /> 환자별 고위험군 요약 TOP {topPatients.length}</h3>
                <p className="settings-tab-desc">
                    누적 낙상×2 + 호흡이상 점수가 높은 환자 순입니다(호실별 관리 화면과 동일한 기준).
                </p>
                {topPatients.length === 0 ? (
                    <div className="room-empty">아직 누적된 낙상/호흡이상 이력이 없습니다.</div>
                ) : (
                    <div className="table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>환자</th>
                                    <th>위치</th>
                                    <th><span className="legend danger" /> 누적 낙상</th>
                                    <th><span className="legend warning" /> 누적 호흡이상</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topPatients.map((p) => (
                                    <tr key={`${p.roomId}-${p.bed.id}`}>
                                        <td>{p.patient.name} ({p.patient.age}세)</td>
                                        <td>{p.floorName} {p.roomNo} · {p.bed.label}</td>
                                        <td>{p.patient.fallCount || 0}</td>
                                        <td>{p.patient.breathCount || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="panel-section">
                <h3>층별 현황</h3>
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>층</th>
                                <th>구역 수</th>
                                <th>병실 수</th>
                                <th>센서 수</th>
                                <th><span className="legend normal" /> 정상</th>
                                <th><span className="legend inactive" /> 움직임 없음</th>
                                <th><span className="legend warning" /> 호흡 이상</th>
                                <th><span className="legend danger" /> 낙상</th>
                                <th><span className="legend sensor" /> 센서 오류</th>
                            </tr>
                        </thead>
                        <tbody>
                            {floors.map((floor) => {
                                const s = getFacilityStats([floor]);
                                return (
                                    <tr key={floor.id}>
                                        <td>{floor.name}</td>
                                        <td>{s.totalRooms}</td>
                                        <td>{s.totalPatientRooms}</td>
                                        <td>{s.sensorTotal}</td>
                                        <td>{s.counts.normal}</td>
                                        <td>{s.counts.inactive}</td>
                                        <td>{s.counts.warning}</td>
                                        <td>{s.counts.danger}</td>
                                        <td>{s.counts.sensor}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default StatsReport;
