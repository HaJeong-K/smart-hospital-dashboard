import {
    ShieldAlert,
    HeartPulse,
    MoonStar,
    Radar,
    CheckCircle2,
    XCircle,
    TriangleAlert,
    Eye,
    EyeOff,
} from "lucide-react";

import { useDashboardStore } from "../store/useDashboardStore";
import { formatDateTime } from "../utils/stats";
import { ALARM_TYPE_TO_STATUS } from "../data/floorsData";

const TYPE_ICON = { fall: ShieldAlert, breath: HeartPulse, inactivity: MoonStar, sensor: Radar };

// 알람 심각도 분류 — 낙상(danger)=Critical, 호흡이상(warning)=Warning,
// 움직임없음/센서오류(inactive/sensor)=Info. 기존 5단계 상태 색상 규칙은 그대로 두고
// 그 위에 심각도 라벨만 추가로 매핑한다.
const SEVERITY_LABEL = { danger: "Critical", warning: "Warning", inactive: "Info", sensor: "Info" };
const SEVERITY_CSS = { danger: "danger", warning: "warning", inactive: "info", sensor: "info" };

// 알람 관리 화면 — 실시간 알람 목록 + Critical/Warning/Info 심각도 분류 + 확인(ACK) +
// 처리완료 상태 관리(정상 해제/오탐). 과거 이력을 날짜로 조회하는 기능은 "과거 이력"
// (`/logs`, `LogAnalysis.jsx`) 화면으로 분리했다 — 여기는 "지금 활성 알람을 처리"하는
// 실시간 대응용 화면이라 사후 조회 용도와 목적이 달라 분리함.
// "센서 이상"은 더 이상 별도 처리 액션/이력 분류가 아니다 — 오탐 처리 시 해당 구역에
// 누적되는 값은 통계 보고서의 "센서 점검 필요 구역"에서 확인한다.
function AlarmsManager() {
    const alarms = useDashboardStore((s) => s.alarms);
    const resolveAlarm = useDashboardStore((s) => s.resolveAlarm);
    const ackAlarm = useDashboardStore((s) => s.ackAlarm);
    const triggerRandomAlarm = useDashboardStore((s) => s.triggerRandomAlarm);

    return (
        <div className="page-wrap">
            <div className="page-title">
                <div>
                    <h1>알람 관리</h1>
                    <p>위치(호실/구역) 상세와 함께 알람을 확인하고, 정상 해제 / 오탐으로 분류합니다.</p>
                </div>

                <div className="chip-group">
                    <button className="chip" onClick={() => triggerRandomAlarm("fall")}>
                        <ShieldAlert size={14} /> 낙상
                    </button>
                    <button className="chip" onClick={() => triggerRandomAlarm("breath")}>
                        <HeartPulse size={14} /> 호흡이상
                    </button>
                    <button className="chip" onClick={() => triggerRandomAlarm("inactivity")}>
                        <MoonStar size={14} /> 움직임 없음
                    </button>
                    <button className="chip" onClick={() => triggerRandomAlarm("sensor")}>
                        <Radar size={14} /> 센서 오류
                    </button>
                </div>
            </div>

            <div className="stat-tile-row">
                <div className="stat-tile">
                    <span className="stat-tile__label"><TriangleAlert size={14} /> 활성 알람</span>
                    <div className="stat-tile__value">{alarms.length}</div>
                </div>
                <div className="stat-tile">
                    <span className="stat-tile__label"><span className="legend danger" /> 낙상</span>
                    <div className="stat-tile__value">{alarms.filter((a) => a.type === "fall").length}</div>
                </div>
                <div className="stat-tile">
                    <span className="stat-tile__label"><span className="legend warning" /> 호흡 이상</span>
                    <div className="stat-tile__value">{alarms.filter((a) => a.type === "breath").length}</div>
                </div>
                <div className="stat-tile">
                    <span className="stat-tile__label"><span className="legend inactive" /> 움직임 없음</span>
                    <div className="stat-tile__value">{alarms.filter((a) => a.type === "inactivity").length}</div>
                </div>
                <div className="stat-tile">
                    <span className="stat-tile__label"><span className="legend sensor" /> 센서 오류</span>
                    <div className="stat-tile__value">{alarms.filter((a) => a.type === "sensor").length}</div>
                </div>
            </div>

            <div className="panel-section">
                <h3>활성 알람</h3>
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>발생 시각</th>
                                <th>위치</th>
                                <th>유형</th>
                                <th>심각도</th>
                                <th>환자</th>
                                <th>확인</th>
                                <th>처리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alarms.length === 0 && (
                                <tr><td colSpan={7} className="room-empty">활성 알람이 없습니다.</td></tr>
                            )}
                            {alarms.map((a) => {
                                const Icon = TYPE_ICON[a.type] || TriangleAlert;
                                const statusKey = ALARM_TYPE_TO_STATUS[a.type] || "warning";
                                return (
                                    <tr key={a.id}>
                                        <td>{formatDateTime(a.time)}</td>
                                        <td>{a.floorName} {a.roomNo} · {a.zoneLabel}</td>
                                        <td><Icon size={14} /> <span className={`legend ${statusKey}`} /> {a.typeLabel}</td>
                                        <td>
                                            <span className={`badge-tag ${SEVERITY_CSS[statusKey]}`}>
                                                {SEVERITY_LABEL[statusKey]}
                                            </span>
                                        </td>
                                        <td>{a.patientName || "-"}</td>
                                        <td>
                                            {a.acked ? (
                                                <span className="badge-tag success"><Eye size={12} /> 확인됨</span>
                                            ) : (
                                                <button className="toolbar-btn ack-btn" onClick={() => ackAlarm(a.id)}>
                                                    <EyeOff size={13} /> 확인
                                                </button>
                                            )}
                                        </td>
                                        <td>
                                            <div className="patient-actions">
                                                <button
                                                    className="alarm-resolve-btn confirm"
                                                    onClick={() => resolveAlarm(a.id, "confirmed")}
                                                >
                                                    <CheckCircle2 size={14} /> 정상 해제
                                                </button>
                                                <button
                                                    className="alarm-resolve-btn false"
                                                    onClick={() => resolveAlarm(a.id, "false_alarm")}
                                                >
                                                    <XCircle size={14} /> 오탐
                                                </button>
                                            </div>
                                        </td>
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

export default AlarmsManager;
