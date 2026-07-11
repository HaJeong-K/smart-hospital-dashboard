import { useState } from "react";

import hospital from "../config/hospital.config";

import FloorSelector from "../components/floor/FloorSelector";
import FloorCanvas from "../components/floor/FloorCanvas";

import PatientPanel from "../components/patient/PatientPanel";
import AlarmPanel from "../components/alarm/AlarmPanel";

import KpiPanel from "../components/dashboard/KpiPanel";

function Dashboard(){

    const [floor,setFloor]=useState(

        hospital.floors[2]

    );

    const [selectedRoom,setSelectedRoom]=useState(null);

    return(

        <>

            <KpiPanel/>

            <div className="dashboard">

                <FloorSelector

                    floors={hospital.floors}

                    selectedFloor={floor}

                    onChange={(value)=>{

                        setFloor(value);

                        setSelectedRoom(null);

                    }}

                />

                <FloorCanvas

                    floor={floor}

                    onRoomClick={setSelectedRoom}

                />

                <div className="right-panel">

                    <PatientPanel

                        room={selectedRoom}

                    />

                    <AlarmPanel/>

                </div>

            </div>

        </>

    );

}

export default Dashboard;