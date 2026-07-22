import { useMemo, useState } from "react";

import { useDashboardStore } from "../store/useDashboardStore";

import FloorSelector from "../components/floor/FloorSelector";
import FloorCanvas from "../components/floor/FloorCanvas";

import PatientPanel from "../components/patient/PatientPanel";
import AlarmPanel from "../components/alarm/AlarmPanel";

import EventTimeline from "../components/event/EventTimeline";

import MonitoringKpiPanel from "../components/dashboard/MonitoringKpiPanel";
import TopToolbar from "../components/dashboard/TopToolbar";
import RoomFilter from "../components/dashboard/RoomFilter";
import SearchBar from "../components/layout/Header/SearchBar";

// "Monitoring" 화면 — 병원 전체 실시간 관제(핵심 기능 정리 기준).
// 예전에는 사이드바의 "대시보드"와 "모니터링"이 둘 다 이 화면을 가리켜 사실상 중복이었고,
// 이후 "모니터링" 전용 KPI 화면을 별도로 만들었다가, 최종 정리안에서는 별도 "대시보드" 메뉴 없이
// KPI + 층별 실시간 상태 + 이벤트 로그 + 환자 상세 + 실시간 알림이 전부 "Monitoring" 하나로
// 합쳐지는 것이 맞다고 확인되어, 이 화면(구 Dashboard.jsx)이 그 통합 화면 역할을 한다.
function Dashboard() {
    const floors = useDashboardStore((s) => s.hospital.floors);
    const selectedFloorId = useDashboardStore((s) => s.selectedFloorId);
    const setSelectedFloorId = useDashboardStore((s) => s.setSelectedFloorId);
    const selectedRoomId = useDashboardStore((s) => s.selectedRoomId);
    const setSelectedRoomId = useDashboardStore((s) => s.setSelectedRoomId);

    // 상태 필터 — 다중 선택(체크박스). 빈 Set이면 필터링 없이 전체 표시.
    const [filters, setFilters] = useState(() => new Set());
    const [keyword, setKeyword] = useState("");

    const toggleFilter = (key) => {
        setFilters((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const clearFilters = () => setFilters(new Set());

    const floor = useMemo(
        () => floors.find((f) => f.id === selectedFloorId) || floors[0] || null,
        [floors, selectedFloorId],
    );

    const selectedRoom = useMemo(
        () => floor?.rooms.find((r) => r.id === selectedRoomId) || null,
        [floor, selectedRoomId],
    );

    const searchedFloor = useMemo(() => {
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
    }, [floor, keyword]);

    const filteredFloor = useMemo(() => {
        if (!searchedFloor) return searchedFloor;
        if (filters.size === 0) return searchedFloor;
        return {
            ...searchedFloor,
            rooms: searchedFloor.rooms.filter((room) => filters.has(room.status.room)),
        };
    }, [searchedFloor, filters]);

    if (!floor) {
        return (
            <div className="floor-empty" style={{ margin: 40 }}>
                등록된 층이 없습니다. 병원관리 화면에서 층을 먼저 추가해주세요.
            </div>
        );
    }

    return (
        <>
            <MonitoringKpiPanel />

            <TopToolbar />

            {/* 예전에는 층 선택 버튼이 세로 80px 칼럼을 차지해서 배치도 표현 영역이 좁았다.
                가로 배치로 바꿔 그 칼럼을 없애고, 확보된 폭만큼 배치도(.floor-canvas)가
                실제로 넓어지도록 그리드 자체를 2단(배치도 + 우측 패널)으로 재구성했다 (T51).
                상태 필터는 더 이상 전체 줄을 차지하는 버튼 목록이 아니라, 층 선택과 같은 줄
                우측 끝의 아이콘 버튼(클릭 시 체크박스 팝오버)으로 옮겼고, 병실/환자 검색창도
                별도 툴바 줄이 아니라 그 필터 바로 옆으로 함께 옮겼다 (2026-07-22 피드백). */}
            <div className="floor-filter-row">
                <FloorSelector
                    floors={floors}
                    selectedFloor={floor}
                    onChange={(value) => setSelectedFloorId(value.id)}
                    variant="horizontal"
                />

                <div className="floor-filter-row__right">
                    <SearchBar
                        className="toolbar-search"
                        placeholder="병실 / 환자 검색"
                        value={keyword}
                        onChange={setKeyword}
                    />

                    <RoomFilter selected={filters} onToggle={toggleFilter} onClear={clearFilters} />
                </div>
            </div>

            <div className="dashboard">
                <FloorCanvas
                    floor={filteredFloor}
                    onRoomClick={(room) => setSelectedRoomId(room.id)}
                />

                {/* 우측 세로 패널(환자정보/알람/이벤트로그)이었던 3개를 배치도 하단에
                    가로로 나란히 배치 — 화면 전체가 스크롤 없이 한 화면(뷰포트)에 고정되도록
                    한다 (2026-07-22 피드백). */}
                <div className="bottom-panels">
                    <PatientPanel floorId={floor.id} room={selectedRoom} />

                    <AlarmPanel />

                    <EventTimeline />
                </div>
            </div>
        </>
    );
}

export default Dashboard;
