import {
    Bed,
    UserRound,
    HeartPulse,
    Activity,
    Calendar,
    Phone,
} from "lucide-react";

function PatientPanel({ room }) {

    if (!room) {

        return (

            <div className="patient-panel empty">

                <div className="patient-empty">

                    <div className="patient-empty-left">

                        <div className="patient-empty-icon">

                            <UserRound size={34} />

                        </div>

                        <h2>Patient Information</h2>

                        <div className="patient-line"></div>

                    </div>

                    <div className="patient-empty-right">

                        <Bed size={90} />

                        <p>병실을 선택하세요.</p>

                    </div>

                </div>

            </div>

        );

    }

    return (

        <div className="patient-panel">

            <div className="patient-header">

                <div className="patient-avatar">

                    <UserRound size={34} />

                </div>

                <div>

                    <h2>{room.patient.name}</h2>

                    <span>{room.roomNo}호</span>

                </div>

            </div>

            <div className="patient-card">

                <div className="patient-row">

                    <HeartPulse size={18} />

                    <span>심박수</span>

                    <strong>76 BPM</strong>

                </div>

                <div className="patient-row">

                    <Activity size={18} />

                    <span>호흡수</span>

                    <strong>18 rpm</strong>

                </div>

                <div className="patient-row">

                    <Calendar size={18} />

                    <span>나이</span>

                    <strong>{room.patient.age}세</strong>

                </div>

                <div className="patient-row">

                    <Phone size={18} />

                    <span>보호자</span>

                    <strong>등록됨</strong>

                </div>

            </div>

        </div>

    );

}

export default PatientPanel;