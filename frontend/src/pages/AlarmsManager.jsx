import { useMemo, useState } from "react";
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
    Search,
} from "lucide-react";

import { useDashboardStore } from "../store/useDashboardStore";
import { formatDateTime } from "../utils/stats";
import { RESOLUTION_LABEL, STATUS_META, ALARM_TYPE_TO_STATUS } from "../data/floorsData";

const TYPE_ICON = { fall: ShieldAlert, breath: HeartPulse, inactivity: MoonStar, sensor: Radar };
const RESOLUTION_BADGE = { confirmed: "success", false_alarm: "neutral" };

// 알람 심각도 분류 — 낙상(danger)=Critical, 호흡이상(warning)=Warning,
// 움직임없음/센서오류(inactive/sensor)=Info. 기존 5단계 상태 색상 규칙은 그대로 두고
// 그 위에 심각도 라벨만 추가로 매핑한다.
const SEVERITY_LABEL = { danger: "Critical", warning: "Warning", inactive: "Info", sensor: "Info" };
const SEVERITY_CSS = { danger: "danger", warning: "warning", inactive: "info", sensor: "info" };

// 알람 관리 화면 — 실시간 알람 목록 + Critical/Warning/Info 심각도 분류 + 확인(ACK) +
// 처리완료 상태 관리(정상 해제/오탐) + 이벤트 이력 조회/검색.
// "센서 이상"은 더 이상 별도 처리 액션/이력 분류가 아니다 — 오탐 처리 시 해당 구역에
// 누적되는 값은 통계 보고서의 "센서 점검 필요 구역"에서 확인한다.
function AlarmsManager() {
    const alarms = useDashboardStore((s) => s.alarms);
    const eventLog = useDashboardStore((s) => s.eventLog);
    const resolveAlarm = useDashboardStore((s) => s.resolveAlarm);
    const ackAlarm = useDashboardStore((s) => s.ackAlarm);
    const triggerRandomAlarm = useDashboardStore((s) => s.triggerRandomAlarm);

    const [historyFilter, setHistoryFilter] = useState("all");
    const [historyKeyword, setHistoryKeyword] = useState("");

    const filteredLog = useMemo(() => {
        let list = eventLog;
        if (historyFilter === "occurred") list = list.filter((e) => e.action === "occurred");
        else if (historyFilter !== "all") list = list.filter((e) => e.action === "resolved" && e.resolution === historyFilter);

        const q = historyKeyword.trim().toLowerCase();
        if (!q) return list;
        return list.filter((e) => {
            const haystack = `${e.floorName} ${e.roomNo} ${e.zoneLabel} ${e.patientName || ""} ${e.typeLabel}`.toLowerCase();
            return haystack.includes(q);
        });
    }, [eventLog, historyFilter, historyKeyword]);

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
                                        <td>{a.floorName} {a.roomNo}{a.roomType === "patient" ? "호" : ""} · {a.zoneLabel}</td>
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

            <div className="panel-section">
                <div className="page-title" style={{ marginBottom: 12 }}>
                    <h3 style={{ margin: 0 }}>이벤트 이력</h3>
                    <div className="chip-group">
                        {[
                            ["all", "전체"],
                            ["occurred", "발생"],
                            ["confirmed", "정상 해제"],
                            ["false_alarm", "오탐"],
                        ].map(([key, label]) => (
                            <button
                                key={key}
                                className={`chip ${historyFilter === key ? "active" : ""}`}
                                onClick={() => setHistoryFilter(key)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="search-bar toolbar-search" style={{ marginBottom: 14, width: 320 }}>
                    <Search size={16} />
                    <input
                        placeholder="호실 / 구역 / 환자명 검색"
                        value={historyKeyword}
                        onChange={(e) => setHistoryKeyword(e.target.value)}
                    />
                </div>

                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>시각</th>
                                <th>위치</th>
                                <th>내용</th>
                                <th>구분</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLog.length === 0 && (
                                <tr><td colSpan={4} className="room-empty">이력이 없습니다.</td></tr>
                            )}
                            {filteredLog.slice(0, 150).map((e) => (
                                <tr key={`${e.id}-${e.action}`}>
                                    <td>{formatDateTime(e.time)}</td>
                                    <td>{e.floorName} {e.roomNo}{e.roomType === "patient" ? "호" : ""} · {e.zoneLabel}</td>
                                    <td>{e.typeLabel}{e.patientName ? ` · ${e.patientName}` : ""}</td>
                                    <td>
                                        {e.action === "occurred" ? (
                                            <span className="badge-tag danger">발생</span>
                                        ) : (
                                            <span className={`badge-tag ${RESOLUTION_BADGE[e.resolution] || "success"}`}>
                                                {RESOLUTION_LABEL[e.resolution]}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AlarmsManager;
