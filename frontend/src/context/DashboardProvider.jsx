import { useState } from "react";
import DashboardContext from "./DashboardContext";

// 참고: 이 Provider는 더 이상 실제 데이터 소스로 쓰이지 않습니다.
// 화면 간 데이터 공유(대시보드 ↔ 병원관리 ↔ 층 편집기 ↔ 신규 관리 페이지들)는
// store/useDashboardStore.js (zustand, localStorage persist)가 담당합니다.
// main.jsx의 Provider 트리에는 하위 호환을 위해 남겨두었지만, 어떤 컴포넌트도
// useDashboard()를 호출하지 않습니다.

function DashboardProvider({ children }) {

    const [hospital, setHospital] = useState(null);
    const [floors, setFloors] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [patients, setPatients] = useState([]);
    const [alarms, setAlarms] = useState([]);

    return (
        <DashboardContext.Provider
            value={{
                hospital,
                setHospital,
                floors,
                setFloors,
                rooms,
                setRooms,
                patients,
                setPatients,
                alarms,
                setAlarms,
            }}
        >
            {children}
        </DashboardContext.Provider>
    );
}

export default DashboardProvider;