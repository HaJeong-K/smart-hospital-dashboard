import {
    Server,
    Wifi,
    Database,
    ShieldCheck,
} from "lucide-react";

const systems = [
    {
        title: "FastAPI",
        status: "ONLINE",
        icon: Server,
    },
    {
        title: "Radar",
        status: "31 / 31",
        icon: Wifi,
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

function SystemStatus() {
    return (
        <div className="system-status">

            {systems.map((item) => {

                const Icon = item.icon;

                return (

                    <div
                        key={item.title}
                        className="system-card"
                    >

                        <Icon size={22} />

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