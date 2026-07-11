import {
    HeartPulse,
    Activity,
    UserRound,
    BedDouble,
    Wifi,
} from "lucide-react";

function PatientPanel({ room }) {
    if (!room) {
        return (
            <aside className="patient-panel empty">

                <h2>Patient Information</h2>

                <p>병실을 선택하세요.</p>

            </aside>
        );
    }

    return (
        <aside className="patient-panel">

            <div className="patient-header">

                <UserRound size={42} />

                <div>

                    <h2>{room.patient.name}</h2>

                    <span>{room.roomNo}호</span>

                </div>

            </div>

            <div className="patient-card">

                <div className="patient-row">

                    <BedDouble size={18} />

                    <span>병실</span>

                    <strong>{room.roomNo}</strong>

                </div>

                <div className="patient-row">

                    <UserRound size={18} />

                    <span>나이</span>

                    <strong>{room.patient.age}세</strong>

                </div>

                <div className="patient-row">

                    <HeartPulse size={18} />

                    <span>심박수</span>

                    <strong>

                        {room.status.heartRate ?? "--"} BPM

                    </strong>

                </div>

                <div className="patient-row">

                    <Activity size={18} />

                    <span>호흡상태</span>

                    <strong>

                        {room.status.breath ?? "-"}

                    </strong>

                </div>

                <div className="patient-row">

                    <Wifi size={18} />

                    <span>센서</span>

                    <strong>

                        {room.status.online
                            ? "ONLINE"
                            : "OFFLINE"}

                    </strong>

                </div>

            </div>

        </aside>
    );
}

export default PatientPanel;