import {
    ShieldAlert,
    HeartPulse,
    Radar,
    CircleCheckBig,
} from "lucide-react";

const events = [
    {
        id: 1,
        time: "14:22:01",
        title: "303호 낙상 감지",
        type: "danger",
        icon: ShieldAlert,
    },
    {
        id: 2,
        time: "14:19:52",
        title: "302호 호흡 이상",
        type: "warning",
        icon: HeartPulse,
    },
    {
        id: 3,
        time: "14:15:11",
        title: "301호 센서 연결",
        type: "normal",
        icon: Radar,
    },
    {
        id: 4,
        time: "14:10:32",
        title: "301호 상태 정상",
        type: "success",
        icon: CircleCheckBig,
    },
];

function EventTimeline() {
    return (
        <div className="event-panel">

            <div className="event-title">

                <h3>Event Timeline</h3>

            </div>

            <div className="event-list">

                {events.map((event) => {

                    const Icon = event.icon;

                    return (

                        <div
                            key={event.id}
                            className={`event-item ${event.type}`}
                        >

                            <Icon size={18} />

                            <div className="event-content">

                                <strong>

                                    {event.title}

                                </strong>

                                <span>

                                    {event.time}

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