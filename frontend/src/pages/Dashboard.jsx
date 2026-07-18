import { useMemo, useState } from "react";

import { useDashboardStore } from "../store/useDashboardStore";

import FloorSelector from "../components/floor/FloorSelector";
import FloorCanvas from "../components/floor/FloorCanvas";

import PatientPanel from "../components/patient/PatientPanel";
import AlarmPanel from "../components/alarm/AlarmPanel";

import EventTimeline from "../components/event/EventTimeline";

import MonitoringKpiPanel from "../components/dashboard/MonitoringKpiPanel";
import TopToolbar from "../components/dashboard/TopToolbar";
import SystemStatus from "../components/dashboard/SystemStatus";
import RoomFilter from "../components/dashboard/RoomFilter";

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

    const [filter, setFilter] = useState("all");
    const [keyword, setKeyword] = useState("");

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
        if (filter === "all") return searchedFloor;
        return {
            ...searchedFloor,
            rooms: searchedFloor.rooms.filter((room) => room.status.room === filter),
        };
    }, [searchedFloor, filter]);

    if (!floor) {
        return (
            <div className="floor-empty" style={{ margin: 40 }}>
                등록된 층이 없습니다. 병원관리 화면에서 층을 먼저 추가해주세요.
            </div>
        );
    }

    return (
        <>
            <div className="page-title">
                <div>
                    <h1>Monitoring</h1>
                    <p>병원 전체의 실시간 상태를 한눈에 관제합니다.</p>
                </div>
            </div>

            <SystemStatus />

            <MonitoringKpiPanel />

            <TopToolbar keyword={keyword} onKeywordChange={setKeyword} />

            <RoomFilter selected={filter} onChange={setFilter} />

            {/* 예전에는 층 선택 버튼이 세로 80px 칼럼을 차지해서 배치도 표현 영역이 좁았다.
                가로 배치로 바꿔 그 칼럼을 없애고, 확보된 폭만큼 배치도(.floor-canvas)가
                실제로 넓어지도록 그리드 자체를 2단(배치도 + 우측 패널)으로 재구성했다 (T51). */}
            <FloorSelector
                floors={floors}
                selectedFloor={floor}
                onChange={(value) => setSelectedFloorId(value.id)}
                variant="horizontal"
            />

            <div className="dashboard">
                <FloorCanvas
                    floor={filteredFloor}
                    onRoomClick={(room) => setSelectedRoomId(room.id)}
                />

                <div className="right-panel">
                    <PatientPanel floorId={floor.id} room={selectedRoom} />

                    <AlarmPanel />

                    <EventTimeline />
                </div>
            </div>
        </>
    );
}

export default Dashboard;
