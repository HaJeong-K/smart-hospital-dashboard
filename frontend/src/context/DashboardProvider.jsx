import { useState } from "react";
import DashboardContext from "./DashboardContext";

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