import {
    TriangleAlert,
    CircleAlert,
    HeartPulse,
    ShieldAlert,
} from "lucide-react";

const alarms = [
    {
        id: 1,
        room: "303호",
        level: "danger",
        icon: ShieldAlert,
        title: "낙상 감지",
        time: "14:12:18",
    },
    {
        id: 2,
        room: "302호",
        level: "warning",
        icon: HeartPulse,
        title: "호흡 이상",
        time: "14:10:02",
    },
    {
        id: 3,
        room: "301호",
        level: "normal",
        icon: CircleAlert,
        title: "센서 연결",
        time: "14:07:33",
    },
];

function AlarmPanel() {
    return (
        <aside className="alarm-panel">

            <div className="alarm-header">

                <TriangleAlert size={22} />

                <h2>Alarm</h2>

            </div>

            <div className="alarm-list">

                {alarms.map((alarm) => {

                    const Icon = alarm.icon;

                    return (

                        <div
                            key={alarm.id}
                            className={`alarm-card ${alarm.level}`}
                        >

                            <Icon size={20} />

                            <div className="alarm-info">

                                <strong>

                                    {alarm.room}

                                </strong>

                                <span>

                                    {alarm.title}

                                </span>

                            </div>

                            <small>

                                {alarm.time}

                            </small>

                        </div>

                    );

                })}

            </div>

        </aside>
    );
}

export default AlarmPanel;