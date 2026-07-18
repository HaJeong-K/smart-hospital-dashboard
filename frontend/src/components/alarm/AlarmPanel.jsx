import {
    TriangleAlert,
    ShieldAlert,
    HeartPulse,
    MoonStar,
    Radar,
    CheckCircle2,
    XCircle,
} from "lucide-react";

import { useDashboardStore } from "../../store/useDashboardStore";
import { formatTime } from "../../utils/stats";
import { STATUS_META, ALARM_TYPE_TO_STATUS } from "../../data/floorsData";

const ICONS = { fall: ShieldAlert, breath: HeartPulse, inactivity: MoonStar, sensor: Radar };

function AlarmPanel() {
    const alarms = useDashboardStore((s) => s.alarms);
    const resolveAlarm = useDashboardStore((s) => s.resolveAlarm);

    return (
        <aside className="alarm-panel">

            <div className="alarm-header">

                <TriangleAlert size={22} />
                <h2>Alarm</h2>
                <span className="alarm-count">{alarms.length}</span>

            </div>

            <div className="alarm-list">

                {alarms.length === 0 && (
                    <div className="room-empty">활성 알람이 없습니다.</div>
                )}

                {alarms.map((alarm) => {

                    const Icon = ICONS[alarm.type] || TriangleAlert;
                    const statusKey = ALARM_TYPE_TO_STATUS[alarm.type] || "warning";
                    const level = statusKey === "danger" ? "danger" : statusKey === "sensor" ? "sensor" : "warning";

                    return (

                        <div
                            key={alarm.id}
                            className={`alarm-card ${level}`}
                        >

                            <Icon size={20} />

                            <div className="alarm-info">

                                <strong>
                                    {alarm.floorName} {alarm.roomNo}
                                    {alarm.roomType === "patient" ? "호" : ""} · {alarm.zoneLabel}
                                </strong>

                                <span>
                                    <span className={`legend ${statusKey}`} /> {alarm.typeLabel}
                                    {alarm.patientName ? ` · ${alarm.patientName}` : ""}
                                </span>

                                <div className="alarm-actions">
                                    <button
                                        className="alarm-resolve-btn confirm"
                                        onClick={() => resolveAlarm(alarm.id, "confirmed")}
                                    >
                                        <CheckCircle2 size={14} /> 정상 해제
                                    </button>
                                    <button
                                        className="alarm-resolve-btn false"
                                        onClick={() => resolveAlarm(alarm.id, "false_alarm")}
                                    >
                                        <XCircle size={14} /> 오탐
                                    </button>
                                </div>

                            </div>

                            <small>

                                {formatTime(alarm.time)}

                            </small>

                        </div>

                    );

                })}

            </div>

        </aside>
    );
}

export default AlarmPanel;
