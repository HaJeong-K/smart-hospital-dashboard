import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    BedDouble,
    ChevronDown,
    ChevronUp,
    ShieldAlert,
    TriangleAlert,
    SquarePen,
    Plus,
} from "lucide-react";

import { useDashboardStore } from "../store/useDashboardStore";
import { ROOM_TYPES, STATUS_META } from "../data/floorsData";
import { topRiskPatients } from "../utils/stats";

// 호실별 관리 화면.
// - 1인실/다인실을 포함한 병실뿐 아니라 화장실/복도/공용공간/대기실/처치실 등
//   모든 구역(zone)을 층별로 그룹핑해서 보여준다 ("1층 로비", "1층 공용화장실", "1층 101호" ...).
// - 병실을 펼치면 배정된 모든 환자의 상세(누적 낙상/호흡이상 횟수, 과거 병력, 현재 증상)를
//   확인할 수 있고, 누적 횟수가 높은 환자가 위쪽에 오도록 정렬한다.
// - 시드 데이터에 가상의 낙상/호흡이상 누적 횟수를 미리 채워 두어(virtual mock data),
//   랭킹이 실제로 동작하는 것을 바로 확인할 수 있다.
// - 층 추가, 호실 생성/수정/삭제(위치·크기 편집 포함), 센서 등록은 실제로는 이미
//   Floor Editor(/editor/:floorId)에 구현되어 있었지만 사이드바 어디에서도 연결되지
//   않아 접근할 방법이 없었다. 여기서 층별로 "구조 편집" 버튼을 눌러 바로 진입할 수 있게 한다.
function RoomsManager() {
    const navigate = useNavigate();
    const floors = useDashboardStore((s) => s.hospital.floors);
    const resolveAllForRoom = useDashboardStore((s) => s.resolveAllForRoom);
    const alarms = useDashboardStore((s) => s.alarms);
    const addFloor = useDashboardStore((s) => s.addFloor);

    const [keyword, setKeyword] = useState("");
    // 예전에는 병실 유형(병실/공용화장실/복도 등)으로 필터링했는데, 화면 자체가 이미
    // 층별로 그룹핑되어 보여지는 구조라 유형 필터의 실효성이 낮았다. 층별로 바로 골라볼 수
    // 있도록 필터 기준을 층으로 변경한다 (T54).
    const [floorFilter, setFloorFilter] = useState("all");
    const [expandedId, setExpandedId] = useState(null);

    const handleAddFloor = () => {
        const id = addFloor();
        navigate(`/editor/${id}`);
    };

    const topRisk = useMemo(() => topRiskPatients(floors, 5), [floors]);

    const groups = useMemo(() => {
        const q = keyword.trim().toLowerCase();
        return floors
            .filter((floor) => floorFilter === "all" || floor.id === floorFilter)
            .map((floor) => {
                const rooms = floor.rooms.filter((room) => {
                    if (!q) return true;
                    const roomNo = String(room.roomNo || "").toLowerCase();
                    const patientNames = (room.beds || [])
                        .map((b) => (b.patient?.name || "").toLowerCase())
                        .join(" ");
                    return roomNo.includes(q) || patientNames.includes(q);
                });
                return { floor, rooms };
            }).filter((g) => g.rooms.length > 0);
    }, [floors, keyword, floorFilter]);

    return (
        <div className="page-wrap">
            <div className="page-title">
                <div>
                    <h1>호실별 관리</h1>
                    <p>층별로 모든 병실/공용구역을 확인하고, 병실은 환자별 누적 낙상·호흡이상 횟수 순으로 정렬됩니다.</p>
                </div>
                <button className="toolbar-btn primary" onClick={handleAddFloor}>
                    <Plus size={16} /> 층 추가
                </button>
            </div>

            {topRisk.length > 0 && (
                <div className="top-risk-panel">
                    <h3><TriangleAlert size={16} /> 고위험 환자 TOP {topRisk.length}</h3>
                    <p className="top-risk-panel__desc">누적 낙상·호흡이상 횟수가 높은 환자를 우선순위 순으로 보여줍니다.</p>

                    <div className="top-risk-grid">
                        {topRisk.map((p, index) => (
                            <div key={p.bed.id} className={`top-risk-card rank-${index + 1}`}>
                                <div className="top-risk-card__top">
                                    <span className="top-risk-rank">{index + 1}</span>
                                    <div className="top-risk-card__name">
                                        <strong>{p.patient.name}</strong>
                                        <span>{p.patient.age}세</span>
                                    </div>
                                </div>

                                <div className="top-risk-loc">
                                    {p.floorName} {p.roomNo} · {p.bed.label}
                                </div>

                                <div className="top-risk-counts">
                                    <span className="top-risk-count danger">
                                        <span className="legend danger" /> 낙상 <strong>{p.patient.fallCount || 0}</strong>
                                    </span>
                                    <span className="top-risk-count warning">
                                        <span className="legend warning" /> 호흡이상 <strong>{p.patient.breathCount || 0}</strong>
                                    </span>
                                </div>

                                {(p.patient.history || p.patient.currentSymptom) && (
                                    <div className="top-risk-summary">
                                        {p.patient.currentSymptom && (
                                            <p><span className="top-risk-summary__tag">현재 증상</span>{p.patient.currentSymptom}</p>
                                        )}
                                        {p.patient.history && (
                                            <p><span className="top-risk-summary__tag">병력</span>{p.patient.history}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="filter-row">
                <div className="search-bar toolbar-search">
                    <Search size={16} />
                    <input
                        placeholder="호실 / 환자명 검색"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                </div>

                <div className="chip-group">
                    <button
                        className={`chip ${floorFilter === "all" ? "active" : ""}`}
                        onClick={() => setFloorFilter("all")}
                    >
                        전체
                    </button>
                    {floors.map((floor) => (
                        <button
                            key={floor.id}
                            className={`chip ${floorFilter === floor.id ? "active" : ""}`}
                            onClick={() => setFloorFilter(floor.id)}
                        >
                            {floor.name}
                        </button>
                    ))}
                </div>
            </div>

            {groups.length === 0 && <div className="room-empty">조건에 맞는 호실/구역이 없습니다.</div>}

            {groups.map(({ floor, rooms }) => (
                <div className="floor-group" key={floor.id}>
                    <h3 className="floor-group__title">
                        {floor.name} <span>· {rooms.length}개 구역</span>
                        <button
                            className="toolbar-btn floor-group__edit-btn"
                            onClick={() => navigate(`/editor/${floor.id}`)}
                            title="이 층의 호실 생성/수정/삭제, 위치·크기 편집"
                        >
                            <SquarePen size={14} /> 구조 편집
                        </button>
                    </h3>

                    <div className="room-manage-list">
                        {rooms.map((room) => {
                            const status = room.status.room;
                            const isOpen = expandedId === room.id;
                            const isPatientRoom = room.type === "patient";
                            const hasAlarm = alarms.some((a) => a.roomId === room.id && a.floorId === floor.id);

                            // 누적 낙상*2 + 호흡이상 점수가 높은 환자가 위쪽에 오도록 정렬 (공석은 맨 뒤)
                            const rankedBeds = isPatientRoom
                                ? [...room.beds].sort((a, b) => {
                                      if (!a.patient && !b.patient) return 0;
                                      if (!a.patient) return 1;
                                      if (!b.patient) return -1;
                                      const scoreA = (a.patient.fallCount || 0) * 2 + (a.patient.breathCount || 0);
                                      const scoreB = (b.patient.fallCount || 0) * 2 + (b.patient.breathCount || 0);
                                      return scoreB - scoreA;
                                  })
                                : [];

                            return (
                                <div key={room.id} className={`room-manage-item ${status}`}>
                                    <div
                                        className="room-manage-summary"
                                        onClick={() => setExpandedId(isOpen ? null : room.id)}
                                    >
                                        <span className="room-status" style={{ background: STATUS_META[status]?.color }} />
                                        <BedDouble size={16} />
                                        <strong>{floor.name} {room.roomNo}</strong>
                                        {ROOM_TYPES[room.type]?.label && ROOM_TYPES[room.type].label !== room.roomNo && (
                                            <span className="room-manage-type">{ROOM_TYPES[room.type].label}</span>
                                        )}
                                        {isPatientRoom && (
                                            <span className="room-manage-patient">
                                                {room.beds.length}인실 · 입실 {room.beds.filter((b) => b.patient).length}/{room.beds.length}
                                            </span>
                                        )}
                                        {hasAlarm && <ShieldAlert size={16} color="var(--danger)" />}
                                        <span className="room-manage-status-badge">
                                            <span className={`legend ${status}`} /> {STATUS_META[status]?.label}
                                        </span>
                                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </div>

                                    {isOpen && (
                                        <div className="room-manage-detail">
                                            <div className="zone-grid">
                                                {room.zones.map((zone) => (
                                                    <div key={zone.id} className={`zone-tile ${zone.status}`}>
                                                        <span>{zone.label}</span>
                                                        <strong><span className={`legend ${zone.status}`} /> {STATUS_META[zone.status]?.label}</strong>
                                                    </div>
                                                ))}
                                            </div>

                                            {hasAlarm && (
                                                <div className="patient-actions">
                                                    <button
                                                        className="alarm-resolve-btn confirm"
                                                        onClick={() => resolveAllForRoom(floor.id, room.id, "confirmed")}
                                                    >
                                                        이 구역 전체 정상 해제
                                                    </button>
                                                    <button
                                                        className="alarm-resolve-btn false"
                                                        onClick={() => resolveAllForRoom(floor.id, room.id, "false_alarm")}
                                                    >
                                                        오탐 처리
                                                    </button>
                                                </div>
                                            )}

                                            {isPatientRoom && (
                                                <div className="bed-rank-list">
                                                    {rankedBeds.map((bed) => {
                                                        const zone = room.zones.find((z) => z.id === bed.zoneId);
                                                        return (
                                                            <div key={bed.id} className="bed-rank-row">
                                                                <span
                                                                    className="bed-status-dot"
                                                                    style={{ background: STATUS_META[zone?.status || "normal"]?.color }}
                                                                />
                                                                <strong>{bed.label}</strong>
                                                                {bed.patient ? (
                                                                    <>
                                                                        <span>{bed.patient.name} ({bed.patient.age}세)</span>
                                                                        <div className="bed-rank-counts">
                                                                            <span><span className="legend danger" /> 낙상 <strong>{bed.patient.fallCount || 0}</strong></span>
                                                                            <span><span className="legend warning" /> 호흡이상 <strong>{bed.patient.breathCount || 0}</strong></span>
                                                                        </div>
                                                                        {(bed.patient.history || bed.patient.currentSymptom) && (
                                                                            <div className="bed-history-line">
                                                                                {bed.patient.history && <>과거 병력: {bed.patient.history}. </>}
                                                                                {bed.patient.currentSymptom && <>현재 증상: {bed.patient.currentSymptom}</>}
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <span className="bed-vacant">공석</span>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default RoomsManager;
