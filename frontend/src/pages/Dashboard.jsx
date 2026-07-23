import { useMemo, useState } from "react";

import { useDashboardStore } from "../store/useDashboardStore";

import FloorCanvas from "../components/floor/FloorCanvas";

import PatientPanel from "../components/patient/PatientPanel";
import AlarmPanel from "../components/alarm/AlarmPanel";

import EventTimeline from "../components/event/EventTimeline";

import MonitoringKpiPanel from "../components/dashboard/MonitoringKpiPanel";
import TopToolbar from "../components/dashboard/TopToolbar";
import RoomFilter from "../components/dashboard/RoomFilter";
import FloorPicker from "../components/dashboard/FloorPicker";
import SearchBar from "../components/layout/Header/SearchBar";

// 병실/환자 검색어로 방을 걸러낸 floor 객체를 새로 만든다 — 상태 필터(RoomFilter)와 달리
// 검색은 "찾고 있는 특정 방"을 좁히는 용도라 일치하지 않는 방을 화면에서 제외한다.
function applySearch(floor, keyword) {
    if (!floor) return floor;
    const q = keyword.trim().toLowerCase();
    if (!q) return floor;
    return {
        ...floor,
        rooms: floor.rooms.filter((room) => {
            const roomNo = String(room.roomNo || "").toLowerCase();
            const patientNames = (room.beds || [])
                .map((b) => (b.patient?.name || "").toLowerCase())
                .join(" ");
            return roomNo.includes(q) || patientNames.includes(q);
        }),
    };
}

// "Monitoring" 화면 — 병원 전체 실시간 관제(핵심 기능 정리 기준).
// 예전에는 사이드바의 "대시보드"와 "모니터링"이 둘 다 이 화면을 가리켜 사실상 중복이었고,
// 이후 "모니터링" 전용 KPI 화면을 별도로 만들었다가, 최종 정리안에서는 별도 "대시보드" 메뉴 없이
// KPI + 층별 실시간 상태 + 이벤트 로그 + 환자 상세 + 실시간 알림이 전부 "Monitoring" 하나로
// 합쳐지는 것이 맞다고 확인되어, 이 화면(구 Dashboard.jsx)이 그 통합 화면 역할을 한다.
function Dashboard() {
    const floors = useDashboardStore((s) => s.hospital.floors);
    const selectedFloorId = useDashboardStore((s) => s.selectedFloorId);
    const setSelectedFloorId = useDashboardStore((s) => s.setSelectedFloorId);

    // 상태 필터 — 다중 선택(체크박스). 빈 Set이면 필터링 없이 전체 표시.
    const [filters, setFilters] = useState(() => new Set());
    const [keyword, setKeyword] = useState("");

    // 선택한 방 — 층을 두 개 동시에 보여주므로, 어느 층의 방을 클릭했는지도 함께
    // 기억해야 한다(같은 roomId가 서로 다른 층에 존재할 수 있음).
    const [activeRoom, setActiveRoom] = useState(null); // { floorId, roomId }

    // 오른쪽에 보여줄 층을 사용자가 직접 고른 적이 있으면 그 값을 우선한다 — 고른 적이
    // 없으면(null) 선택한 층의 다음 층(없으면 이전 층)을 기본값으로 자동 계산한다.
    const [manualSecondaryId, setManualSecondaryId] = useState(null);

    const toggleFilter = (key) => {
        setFilters((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const clearFilters = () => setFilters(new Set());

    const primaryFloor = useMemo(
        () => floors.find((f) => f.id === selectedFloorId) || floors[0] || null,
        [floors, selectedFloorId],
    );

    // 선택한 층 옆에 함께 보여줄 인접 층 — 배치도 영역이 한 층만 보여줄 때 남는 공간이
    // 많다는 피드백에 따라, 층 목록에서 선택한 층의 다음 층(없으면 이전 층)을 나란히
    // 표시한다. 층이 1개뿐이면 예전처럼 단일 배치도만 보여준다. 사용자가 오른쪽 배치도의
    // 드롭다운으로 직접 층을 고르면(manualSecondaryId) 자동 계산 대신 그 선택을 따른다.
    const secondaryFloor = useMemo(() => {
        if (!primaryFloor || floors.length < 2) return null;

        if (manualSecondaryId) {
            const manual = floors.find((f) => f.id === manualSecondaryId && f.id !== primaryFloor.id);
            if (manual) return manual;
        }

        const index = floors.findIndex((f) => f.id === primaryFloor.id);
        return floors[index + 1] || floors[index - 1] || null;
    }, [floors, primaryFloor, manualSecondaryId]);

    const selectedRoom = useMemo(() => {
        if (!activeRoom) return null;
        const f = floors.find((f) => f.id === activeRoom.floorId);
        return f?.rooms.find((r) => r.id === activeRoom.roomId) || null;
    }, [floors, activeRoom]);

    const displayPrimary = useMemo(() => applySearch(primaryFloor, keyword), [primaryFloor, keyword]);
    const displaySecondary = useMemo(() => applySearch(secondaryFloor, keyword), [secondaryFloor, keyword]);

    if (!primaryFloor) {
        return (
            <div className="floor-empty" style={{ margin: 40 }}>
                등록된 층이 없습니다. 병원관리 화면에서 층을 먼저 추가해주세요.
            </div>
        );
    }

    return (
        <>
            <MonitoringKpiPanel />

            {/* 예전에는 검색/층선택/필터(왼쪽에 둘 내용)와 테스트 이벤트/새로고침/확대(오른쪽에
                둘 내용)가 각각 다른 줄을 차지해 세로 공간을 두 줄이나 썼다 — 공간이 남는다는
                피드백에 따라 한 줄로 합쳐 왼쪽엔 검색/층선택/필터, 오른쪽엔 테스트 이벤트/
                새로고침/확대를 배치했다(TopToolbar의 toolbar-left에 전달). */}
            <TopToolbar>
                <SearchBar
                    className="toolbar-search"
                    placeholder="병실 / 환자 검색"
                    value={keyword}
                    onChange={setKeyword}
                />

                <FloorPicker
                    floors={floors}
                    leftFloorId={primaryFloor.id}
                    rightFloorId={secondaryFloor?.id}
                    onLeftChange={(id) => {
                        setSelectedFloorId(id);
                        // 층을 바꾸면 이전 층에서 선택했던 방 정보는 더 이상 유효하지 않으므로 비운다.
                        setActiveRoom(null);
                    }}
                    onRightChange={(id) => {
                        setManualSecondaryId(id);
                        setActiveRoom(null);
                    }}
                />

                <RoomFilter selected={filters} onToggle={toggleFilter} onClear={clearFilters} />
            </TopToolbar>

            <div className="dashboard">
                {displaySecondary ? (
                    <div className="floor-canvas-row">
                        <FloorCanvas
                            floor={displayPrimary}
                            statusFilter={filters}
                            onRoomClick={(room) => setActiveRoom({ floorId: primaryFloor.id, roomId: room.id })}
                        />

                        <FloorCanvas
                            floor={displaySecondary}
                            statusFilter={filters}
                            onRoomClick={(room) => setActiveRoom({ floorId: secondaryFloor.id, roomId: room.id })}
                        />
                    </div>
                ) : (
                    <FloorCanvas
                        floor={displayPrimary}
                        statusFilter={filters}
                        onRoomClick={(room) => setActiveRoom({ floorId: primaryFloor.id, roomId: room.id })}
                    />
                )}

                {/* 우측 세로 패널(환자정보/알람/이벤트로그)이었던 3개를 배치도 하단에
                    가로로 나란히 배치 — 화면 전체가 스크롤 없이 한 화면(뷰포트)에 고정되도록
                    한다 (2026-07-22 피드백). */}
                <div className="bottom-panels">
                    <PatientPanel floorId={activeRoom?.floorId || primaryFloor.id} room={selectedRoom} />

                    <AlarmPanel />

                    <EventTimeline />
                </div>
            </div>
        </>
    );
}

export default Dashboard;
