import {
    Server,
    Wifi,
    Database,
    ShieldCheck,
} from "lucide-react";

import { useDashboardStore } from "../../store/useDashboardStore";
import { getFacilityStats } from "../../utils/stats";

function SystemStatus() {
    const floors = useDashboardStore((s) => s.hospital.floors);
    const connectionStatus = useDashboardStore((s) => s.connectionStatus);
    const toggleConnection = useDashboardStore((s) => s.toggleConnection);
    const stats = getFacilityStats(floors);
    const online = connectionStatus === "connected";
    const onlineSensors = online ? stats.sensorTotal : 0;

    const systems = [
        {
            title: "FastAPI",
            status: online ? "ONLINE" : "OFFLINE",
            icon: Server,
            danger: !online,
            onClick: toggleConnection,
        },
        {
            title: "Radar",
            status: `${onlineSensors} / ${stats.sensorTotal}`,
            icon: Wifi,
            danger: !online,
        },
        {
            title: "Database",
            status: "Connected",
            icon: Database,
        },
        {
            title: "Security",
            status: "Secure",
            icon: ShieldCheck,
        },
    ];

    return (
        <div className="system-status">

            {systems.map((item) => {

                const Icon = item.icon;

                return (

                    <div
                        key={item.title}
                        className={`system-card ${item.danger ? "danger" : ""}`}
                        onClick={item.onClick}
                        style={item.onClick ? { cursor: "pointer" } : undefined}
                        title={item.onClick ? "클릭하여 서버 연결 상태 시뮬레이션" : undefined}
                    >

                        <div className={`kpi-icon ${item.danger ? "danger" : "primary"}`}>
                            <Icon size={20} />
                        </div>

                        <div>

                            <span>

                                {item.title}

                            </span>

                            <strong>

                                {item.status}

                            </strong>

                        </div>

                    </div>

                );

            })}

        </div>
    );
}

export default SystemStatus;
