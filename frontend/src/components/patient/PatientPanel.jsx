import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    UserRound,
    HeartPulse,
    Activity,
    CheckCircle2,
    XCircle,
    Pencil,
    ShieldAlert,
    Maximize2,
} from "lucide-react";

import { useDashboardStore } from "../../store/useDashboardStore";
import { mockVitals } from "../../utils/stats";
import { STATUS_META } from "../../data/floorsData";

function BedEditForm({ floorId, roomId, bed, onDone }) {
    const updateBedPatient = useDashboardStore((s) => s.updateBedPatient);
    const [name, setName] = useState(bed.patient?.name || "");
    const [age, setAge] = useState(bed.patient?.age || "");
    const [history, setHistory] = useState(bed.patient?.history || "");
    const [currentSymptom, setCurrentSymptom] = useState(bed.patient?.currentSymptom || "");

    const save = () => {
        updateBedPatient(floorId, roomId, bed.id, {
            name,
            age: Number(age) || 0,
            history,
            currentSymptom,
        });
        onDone();
    };

    const discharge = () => {
        if (!window.confirm(`${bed.label} 환자를 퇴실 처리하시겠습니까?`)) return;
        updateBedPatient(floorId, roomId, bed.id, null);
        onDone();
    };

    return (
        <div className="patient-card">
            <div className="patient-edit-row">
                <input placeholder="환자명" value={name} onChange={(e) => setName(e.target.value)} />
                <input
                    placeholder="나이"
                    type="number"
                    style={{ width: 60 }}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                />
            </div>
            <textarea
                className="patient-note-input"
                rows={2}
                placeholder="과거 병력"
                value={history}
                onChange={(e) => setHistory(e.target.value)}
                style={{ marginTop: 8 }}
            />
            <textarea
                className="patient-note-input"
                rows={2}
                placeholder="현재 증상"
                value={currentSymptom}
                onChange={(e) => setCurrentSymptom(e.target.value)}
                style={{ marginTop: 8 }}
            />
            <div className="patient-actions">
                <button className="toolbar-btn primary" onClick={save}>저장</button>
                {bed.patient && <button className="toolbar-btn danger" onClick={discharge}>퇴실</button>}
                <button className="toolbar-btn" onClick={onDone}>취소</button>
            </div>
        </div>
    );
}

function PatientPanel({ floorId, room }) {
    const navigate = useNavigate();
    const resolveAllForRoom = useDashboardStore((s) => s.resolveAllForRoom);
    const alarms = useDashboardStore((s) => s.alarms);
    const requestPatientDetail = useDashboardStore((s) => s.requestPatientDetail);
    const [editingBedId, setEditingBedId] = useState(null);

    // Monitoring 패널의 확대 아이콘 — "환자 관리" 탭으로 이동하면서 지금 보고 있는
    // 호실의 상세 모달이 자동으로 열리도록 store에 1회성 요청을 남겨둔다.
    const openInPatientsManager = () => {
        if (!room) return;
        requestPatientDetail(floorId, room.id);
        navigate("/patients");
    };

    useEffect(() => setEditingBedId(null), [room?.id]);

    if (!room) {
        // 이전에는 이 빈 상태(.patient-empty 및 하위 클래스들)에 대한 CSS가 전혀 없어서
        // 아이콘/제목/구분선/안내문구가 스타일 없이 그대로 쌓여 "환자 정보 영역이 깨져
        // 보인다"는 원인이 되었다 — 하나의 중앙 정렬된 빈 상태로 다시 구성한다 (T52).
        return (
            <div className="patient-panel empty">
                <div className="patient-empty">
                    <div className="patient-empty-icon">
                        <UserRound size={30} />
                    </div>
                    <h2>Patient Information</h2>
                    <p>배치도에서 병실을 클릭하면<br />환자 정보가 여기에 표시됩니다.</p>
                </div>
            </div>
        );
    }

    const isPatientRoom = room.type === "patient";
    const roomAlarms = alarms.filter((a) => a.floorId === floorId && a.roomId === room.id);
    const occupied = isPatientRoom ? room.beds.filter((b) => b.patient).length : 0;

    return (
        <div className="patient-panel">

            <div className="patient-header">

                <div className="patient-avatar">

                    <UserRound size={34} />

                </div>

                <div>

                    <h2>{room.roomNo}</h2>
                    <span>
                        {isPatientRoom ? `${room.beds.length}인실 · 입실 ${occupied}/${room.beds.length}` : room.roomNo}
                    </span>

                </div>

                <button
                    className="patient-panel-expand-btn"
                    onClick={openInPatientsManager}
                    title="환자 관리에서 이 호실 상세 보기"
                >
                    <Maximize2 size={16} />
                </button>

            </div>

            {/* 병상이 많은 다인실(최대 8인실)도 전부 스크롤로 확인할 수 있도록
                헤더 아래 내용 전체를 별도 스크롤 영역으로 감싼다. (기존에는 패널 높이가
                고정+overflow:hidden 이라 3번째 병상부터 화면에서 아예 잘려 보이지 않았음) */}
            <div className="patient-panel-body">

                {/* 구역(zone)별 상태 — 병상/화장실 등 존 단위로 관리 */}
                <div className="patient-card">
                    {room.zones.map((zone) => (
                        <div className="patient-row" key={zone.id}>
                            <span className={`legend ${zone.status}`} />
                            <span>{zone.label}</span>
                            <strong>{STATUS_META[zone.status]?.label}</strong>
                        </div>
                    ))}
                </div>

                {roomAlarms.length > 0 && (
                    <div className="patient-card alarm-active">
                        {roomAlarms.map((a) => (
                            <div key={a.id} className="patient-row">
                                <ShieldAlert size={18} />
                                <span>{a.zoneLabel} · {a.typeLabel}</span>
                            </div>
                        ))}
                        <div className="patient-actions">
                            <button
                                className="alarm-resolve-btn confirm"
                                onClick={() => resolveAllForRoom(floorId, room.id, "confirmed")}
                            >
                                <CheckCircle2 size={14} /> 정상 해제
                            </button>
                            <button
                                className="alarm-resolve-btn false"
                                onClick={() => resolveAllForRoom(floorId, room.id, "false_alarm")}
                            >
                                <XCircle size={14} /> 오탐
                            </button>
                        </div>
                    </div>
                )}

                {isPatientRoom && room.beds.map((bed) => {
                    const vitals = bed.patient ? mockVitals(bed.id, worstBedStatus(room, bed)) : null;
                    return (
                        <div className="patient-card" key={bed.id}>
                            <div className="patient-row" style={{ justifyContent: "space-between" }}>
                                <strong>{bed.label}</strong>
                                <button className="icon-button-sm" onClick={() => setEditingBedId(editingBedId === bed.id ? null : bed.id)}>
                                    <Pencil size={13} />
                                </button>
                            </div>

                            {editingBedId === bed.id ? (
                                <BedEditForm floorId={floorId} roomId={room.id} bed={bed} onDone={() => setEditingBedId(null)} />
                            ) : bed.patient ? (
                                <>
                                    <div className="patient-row"><span>환자명</span><strong>{bed.patient.name || "-"}</strong></div>
                                    <div className="patient-row"><span>나이</span><strong>{bed.patient.age}세</strong></div>
                                    <div className="patient-row"><HeartPulse size={14} /><span>심박수</span><strong>{vitals.heartRate} BPM</strong></div>
                                    <div className="patient-row"><Activity size={14} /><span>호흡수</span><strong>{vitals.respRate} rpm</strong></div>
                                    <div className="patient-row">
                                        <span>누적 낙상 / 호흡이상</span>
                                        <strong>{bed.patient.fallCount || 0}회 / {bed.patient.breathCount || 0}회</strong>
                                    </div>
                                    {bed.patient.currentSymptom && (
                                        <div className="patient-row"><span>현재 증상</span><strong>{bed.patient.currentSymptom}</strong></div>
                                    )}
                                </>
                            ) : (
                                <div className="room-empty" style={{ padding: 10 }}>공석 · 환자를 배정하려면 편집을 누르세요</div>
                            )}
                        </div>
                    );
                })}

            </div>

        </div>
    );
}

function worstBedStatus(room, bed) {
    const zone = room.zones.find((z) => z.id === bed.zoneId);
    return zone?.status || "normal";
}

export default PatientPanel;
