import { useMemo, useState } from "react";
import { X, ShieldAlert, HeartPulse, User, ArrowRightLeft, Clock3 } from "lucide-react";

import { ROOM_TYPES, STATUS_META, RESOLUTION_LABEL } from "../../data/floorsData";
import { formatDateTime } from "../../utils/stats";
import { useDashboardStore } from "../../store/useDashboardStore";

// 병실 클릭 시 뜨는 상세 이력 모달 — 해당 병실에 배정된 "모든" 환자의
// 누적 낙상/호흡이상 횟수, 과거 병력, 현재 증상, 최근 이벤트 이력을 한번에 확인하고,
// 다른 병상으로 이동(호실 재배정)시킬 수 있다.
function PatientDetailModal({ room, floor, onClose }) {
    const floors = useDashboardStore((s) => s.hospital.floors);
    const eventLog = useDashboardStore((s) => s.eventLog);
    const movePatient = useDashboardStore((s) => s.movePatient);

    const [movingBedId, setMovingBedId] = useState(null);
    const [moveTarget, setMoveTarget] = useState("");

    // 다른 병실/층을 포함해 현재 공석인 모든 병상을 이동 대상 후보로 모은다.
    const emptyBedOptions = useMemo(() => {
        const options = [];
        for (const f of floors) {
            for (const r of f.rooms) {
                if (r.type !== "patient") continue;
                for (const b of r.beds || []) {
                    if (b.patient) continue;
                    if (r.id === room?.id && f.id === floor?.id) continue; // 같은 병실 내 공석은 이동 의미 없음(제외)
                    options.push({
                        key: `${f.id}::${r.id}::${b.id}`,
                        floorId: f.id,
                        floorName: f.name,
                        roomId: r.id,
                        roomNo: r.roomNo,
                        bedId: b.id,
                        bedLabel: b.label,
                    });
                }
            }
        }
        return options;
    }, [floors, room, floor]);

    if (!room) return null;

    const isPatientRoom = room.type === "patient";

    const startMove = (bedId) => {
        setMovingBedId(bedId);
        setMoveTarget(emptyBedOptions[0]?.key || "");
    };

    const confirmMove = (bedId) => {
        const target = emptyBedOptions.find((o) => o.key === moveTarget);
        if (!target) return;
        movePatient(floor.id, room.id, bedId, target.floorId, target.roomId, target.bedId);
        setMovingBedId(null);
        onClose();
    };

    return (
        <div className="patient-detail-overlay" onClick={onClose}>
            <div className="patient-detail-modal" onClick={(e) => e.stopPropagation()}>
                <div className="patient-detail-modal__header">
                    <h2>
                        {floor?.name} {room.roomNo}
                        {!isPatientRoom && ROOM_TYPES[room.type]?.label && ROOM_TYPES[room.type].label !== room.roomNo
                            ? ` · ${ROOM_TYPES[room.type].label}`
                            : ""}
                    </h2>
                    <button className="patient-detail-modal__close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                {isPatientRoom ? (
                    room.beds.map((bed) => {
                        const zone = room.zones.find((z) => z.id === bed.zoneId);
                        const p = bed.patient;
                        const recentEvents = eventLog.filter((e) => e.zoneId === bed.zoneId).slice(0, 5);

                        return (
                            <div key={bed.id} className={`patient-detail-card ${p ? "" : "vacant"}`}>
                                <div className="patient-detail-card__top">
                                    <span
                                        className="room-status"
                                        style={{ background: STATUS_META[zone?.status || "normal"]?.color }}
                                    />
                                    <User size={16} />
                                    <strong>{bed.label}</strong>
                                    {p ? (
                                        <span>{p.name} · {p.age}세</span>
                                    ) : (
                                        <span className="bed-vacant">공석</span>
                                    )}

                                    {p && (
                                        <div className="patient-detail-counts">
                                            <span className="count-pill">
                                                <ShieldAlert size={13} /> 낙상 {p.fallCount || 0}
                                            </span>
                                            <span className="count-pill">
                                                <HeartPulse size={13} /> 호흡이상 {p.breathCount || 0}
                                            </span>
                                        </div>
                                    )}

                                    {p && (
                                        <button
                                            className="icon-button-sm"
                                            title="다른 병상으로 이동"
                                            onClick={() => (movingBedId === bed.id ? setMovingBedId(null) : startMove(bed.id))}
                                        >
                                            <ArrowRightLeft size={14} />
                                        </button>
                                    )}
                                </div>

                                {p && (
                                    <div className="patient-detail-card__meta">
                                        <div><strong>과거 병력</strong> {p.history || "기록 없음"}</div>
                                        <div><strong>현재 증상</strong> {p.currentSymptom || "특이사항 없음"}</div>
                                    </div>
                                )}

                                {p && movingBedId === bed.id && (
                                    <div className="patient-move-row">
                                        {emptyBedOptions.length === 0 ? (
                                            <span className="settings-tab-desc" style={{ margin: 0 }}>
                                                이동 가능한 공석 병상이 없습니다.
                                            </span>
                                        ) : (
                                            <>
                                                <select value={moveTarget} onChange={(e) => setMoveTarget(e.target.value)}>
                                                    {emptyBedOptions.map((o) => (
                                                        <option key={o.key} value={o.key}>
                                                            {o.floorName} {o.roomNo} · {o.bedLabel}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button className="toolbar-btn primary" onClick={() => confirmMove(bed.id)}>
                                                    이동
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}

                                {p && recentEvents.length > 0 && (
                                    <div className="patient-recent-events">
                                        <div className="patient-recent-events__title">
                                            <Clock3 size={13} /> 최근 이벤트
                                        </div>
                                        {recentEvents.map((e) => (
                                            <div key={`${e.id}-${e.action}`} className="patient-recent-events__row">
                                                <span>{formatDateTime(e.time)}</span>
                                                <span>
                                                    {e.action === "occurred" ? e.typeLabel : RESOLUTION_LABEL[e.resolution]}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="patient-detail-card">
                        <p style={{ margin: 0, color: "var(--text-secondary)" }}>
                            공용 구역입니다. 배정된 환자가 없습니다.
                        </p>
                        <div className="zone-grid" style={{ marginTop: 12 }}>
                            {room.zones.map((zone) => (
                                <div key={zone.id} className={`zone-tile ${zone.status}`}>
                                    <span>{zone.label}</span>
                                    <strong><span className={`legend ${zone.status}`} /> {STATUS_META[zone.status]?.label}</strong>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PatientDetailModal;
