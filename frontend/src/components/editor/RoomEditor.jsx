import { useMemo, useState } from "react";
import { Search, BedDouble, User, Radar, Trash2, ShieldAlert } from "lucide-react";

import { STATUS_META } from "../../data/floorsData";

// 좌측 "병실 목록" 사이드바. floor의 rooms 배열을 검색/선택/삭제할 수 있다.
// 이전에는 이 파일이 자기 자신을 import해서 무한 재귀 렌더링을 일으켰던 버그가 있었음(수정됨).
function RoomEditor({ rooms, selectedRoom, setSelectedRoom, setRooms }) {
    const [keyword, setKeyword] = useState("");

    const filtered = useMemo(() => {
        const q = keyword.trim().toLowerCase();
        if (!q) return rooms;
        return rooms.filter((room) => {
            const roomNo = String(room.roomNo || "").toLowerCase();
            const patientNames = (room.beds || [])
                .map((b) => (b.patient?.name || "").toLowerCase())
                .join(" ");
            return roomNo.includes(q) || patientNames.includes(q);
        });
    }, [rooms, keyword]);

    const removeRoom = (e, room) => {
        e.stopPropagation();
        if (!window.confirm(`${room.roomNo}호를 삭제하시겠습니까?`)) return;
        setRooms?.((prev) => prev.filter((item) => item.id !== room.id));
        if (selectedRoom?.id === room.id) setSelectedRoom(null);
    };

    return (
        <div className="room-editor">
            <div className="room-editor-header">
                <h2>병실 목록</h2>
                <span style={{ color: "var(--text-secondary)", fontSize: 12.5 }}>
                    총 {rooms.length}개 · 캔버스에서 Polygon을 그려 새 병실을 추가하세요
                </span>
            </div>

            <div className="room-search">
                <Search size={16} />
                <input
                    type="text"
                    placeholder="호실 / 환자명 검색"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />
            </div>

            <div className="room-list">
                {filtered.length === 0 && (
                    <div className="room-empty">
                        {rooms.length === 0
                            ? "등록된 병실이 없습니다."
                            : "검색 결과가 없습니다."}
                    </div>
                )}

                {filtered.map((room) => {
                    const status = room.status?.room || "normal";
                    const isPatientRoom = room.type === "patient";
                    const occupied = isPatientRoom ? (room.beds || []).filter((b) => b.patient).length : 0;
                    return (
                        <div
                            key={room.id}
                            className={`room-item ${selectedRoom?.id === room.id ? "selected" : ""}`}
                            onClick={() => setSelectedRoom(room)}
                        >
                            <span
                                className="room-status"
                                style={{ background: STATUS_META[status]?.color }}
                            />
                            <div className="room-main">
                                <div className="room-top">
                                    <BedDouble size={15} />
                                    <strong>{room.roomNo}호</strong>
                                    {status !== "normal" && (
                                        <ShieldAlert size={14} color="var(--danger)" />
                                    )}
                                    <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-secondary)" }}>
                                        {STATUS_META[status]?.label}
                                    </span>
                                </div>
                                <div className="room-patient">
                                    <User size={13} />
                                    {isPatientRoom
                                        ? `입실 ${occupied}/${room.beds?.length || 0}`
                                        : "공용 구역"}
                                </div>
                                <div className="room-sensor">
                                    <Radar size={13} />
                                    {room.sensors?.length
                                        ? room.sensors.map((s) => s.id).join(", ")
                                        : "센서 없음"}
                                </div>
                            </div>
                            <button
                                className="icon-button"
                                onClick={(e) => removeRoom(e, room)}
                                title="병실 삭제"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default RoomEditor;
