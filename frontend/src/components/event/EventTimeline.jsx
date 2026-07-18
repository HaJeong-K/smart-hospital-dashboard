import {
    ShieldAlert,
    HeartPulse,
    MoonStar,
    Radar,
    CircleCheckBig,
    XCircle,
} from "lucide-react";

import { useDashboardStore } from "../../store/useDashboardStore";
import { formatTime } from "../../utils/stats";
import { RESOLUTION_LABEL } from "../../data/floorsData";

const TYPE_ICON = { fall: ShieldAlert, breath: HeartPulse, inactivity: MoonStar, sensor: Radar };
const RESOLUTION_ICON = { confirmed: CircleCheckBig, false_alarm: XCircle };
const RESOLUTION_CSS = { confirmed: "success", false_alarm: "normal" };

function EventTimeline() {
    const eventLog = useDashboardStore((s) => s.eventLog);

    return (
        <div className="event-panel">

            <div className="event-title">

                <h3>Event Timeline</h3>

            </div>

            <div className="event-list">

                {eventLog.length === 0 && (
                    <div className="room-empty">이벤트 이력이 없습니다.</div>
                )}

                {eventLog.slice(0, 40).map((event) => {

                    const isResolved = event.action === "resolved";
                    const Icon = isResolved
                        ? (RESOLUTION_ICON[event.resolution] || CircleCheckBig)
                        : (TYPE_ICON[event.type] || ShieldAlert);

                    const cssType = isResolved
                        ? (RESOLUTION_CSS[event.resolution] || "success")
                        : (event.type === "fall" ? "danger" : event.type === "sensor" ? "sensor" : "warning");

                    const title = isResolved
                        ? `${event.floorName} ${event.roomNo} ${event.zoneLabel} — ${RESOLUTION_LABEL[event.resolution]}`
                        : `${event.floorName} ${event.roomNo} ${event.zoneLabel} ${event.typeLabel}`;

                    return (

                        <div
                            key={`${event.id}-${event.action}`}
                            className={`event-item ${cssType}`}
                        >

                            <Icon size={18} />

                            <div className="event-content">

                                <strong>
                                    {title}
                                </strong>

                                <span>
                                    {formatTime(event.time)}
                                </span>

                            </div>

                        </div>

                    );

                })}

            </div>

        </div>
    );
}

export default EventTimeline;
