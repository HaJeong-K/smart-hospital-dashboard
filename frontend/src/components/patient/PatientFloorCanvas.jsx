import FloorImage from "../floor/FloorImage";
import FloorHeader from "../dashboard/FloorHeader";
import PatientRoomPolygon from "./PatientRoomPolygon";

// preserveAspectRatio="xMidYMid meet" + object-fit:contain(layout.css): 균일 스케일로
// 늘어짐도, 잘림도 없이 박스 안에 딱 맞게 표시한다 — FloorCanvas.jsx와 동일하게 맞춘다.
// Dashboard의 FloorCanvas보다 "확대된" 버전 — 환자 관리 화면 전용.
// 각 병실 안에 환자 이름을 모두 나열하고, 방을 클릭하면 상위(PatientsManager)에서
// 전체 병상의 이력(누적 낙상/호흡이상, 과거 병력, 현재 증상)을 모달로 보여준다.
// 예전에는 방 폴리곤 색상(상태색) 위에 별도의 빨간 점멸 레이더 아이콘(SensorOverlay)까지
// 겹쳐 표시되어 "색상 표시가 두 개"로 보이는 문제가 있었다 — 방 상태색은 폴리곤 하나로만
// 표현하고, 라벨 앞에는 테두리 없는 작은 점 하나로만 상태를 보조 설명한다 (T42).
function PatientFloorCanvas({ floor, onRoomClick }) {
    return (
        <div className="floor-canvas patient-floor-canvas">
            <FloorHeader floor={floor} />

            <svg className="floor-svg" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid meet">
                <FloorImage floor={floor} />

                {floor.rooms.map((room) => (
                    <PatientRoomPolygon key={room.id} room={room} onClick={() => onRoomClick(room)} />
                ))}
            </svg>
        </div>
    );
}

export default PatientFloorCanvas;
