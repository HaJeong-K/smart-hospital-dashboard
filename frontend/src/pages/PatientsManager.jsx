import { useEffect, useMemo, useState } from "react";

import { useDashboardStore } from "../store/useDashboardStore";

import FloorSelector from "../components/floor/FloorSelector";
import PatientFloorCanvas from "../components/patient/PatientFloorCanvas";
import PatientDetailModal from "../components/patient/PatientDetailModal";

// 환자 관리 화면 — 대시보드의 층별 배치도를 "확대"해서 보여주고,
// 다인실(최대 8인실)도 모든 환자 이름이 침상 위치 순서대로 세로로 나열되도록 한다.
// 병실을 클릭하면 그 병실에 배정된 모든 환자의 전체 이력(누적 낙상/호흡이상,
// 과거 병력, 현재 증상)을 한번에 보여준다.
// "호실별 관리"(RoomsManager)와는 별개의 화면으로 분리되어 있다.
function PatientsManager() {
    const floors = useDashboardStore((s) => s.hospital.floors);
    const selectedFloorId = useDashboardStore((s) => s.selectedFloorId);
    const setSelectedFloorId = useDashboardStore((s) => s.setSelectedFloorId);
    const pendingPatientDetail = useDashboardStore((s) => s.pendingPatientDetail);
    const clearPendingPatientDetail = useDashboardStore((s) => s.clearPendingPatientDetail);

    const [detailRoom, setDetailRoom] = useState(null);

    const floor = useMemo(
        () => floors.find((f) => f.id === selectedFloorId) || floors[0] || null,
        [floors, selectedFloorId],
    );

    // Monitoring의 환자 정보 패널에서 확대 아이콘을 눌러 넘어온 경우, 그 호실의 상세
    // 모달을 자동으로 연다. 1회성 요청이므로 열자마자 store에서 바로 비운다.
    useEffect(() => {
        if (!pendingPatientDetail) return;
        const targetFloor = floors.find((f) => f.id === pendingPatientDetail.floorId);
        const targetRoom = targetFloor?.rooms.find((r) => r.id === pendingPatientDetail.roomId);
        if (targetRoom) setDetailRoom(targetRoom);
        clearPendingPatientDetail();
    }, [pendingPatientDetail, floors, clearPendingPatientDetail]);

    if (!floor) {
        return (
            <div className="floor-empty" style={{ margin: 40 }}>
                등록된 층이 없습니다. 병원관리 화면에서 층을 먼저 추가해주세요.
            </div>
        );
    }

    return (
        <div className="page-wrap patients-page">
            <div className="page-title">
                <div>
                    <h1>환자 관리</h1>
                    <p>병실을 클릭하면 배정된 모든 환자의 전체 이력을 확인할 수 있습니다.</p>
                </div>
            </div>

            <FloorSelector
                floors={floors}
                selectedFloor={floor}
                onChange={(value) => setSelectedFloorId(value.id)}
                variant="horizontal"
            />

            <div className="patients-page-canvas">
                <PatientFloorCanvas floor={floor} onRoomClick={(room) => setDetailRoom(room)} />
            </div>

            {detailRoom && (
                <PatientDetailModal
                    room={floor.rooms.find((r) => r.id === detailRoom.id) || detailRoom}
                    floor={floor}
                    onClose={() => setDetailRoom(null)}
                />
            )}
        </div>
    );
}

export default PatientsManager;
