import { useMemo, useState } from "react";

import hospital from "../config/hospital.config";

import FloorSelector from "../components/floor/FloorSelector";
import FloorCanvas from "../components/floor/FloorCanvas";

import PatientPanel from "../components/patient/PatientPanel";
import AlarmPanel from "../components/alarm/AlarmPanel";

import EventTimeline from "../components/event/EventTimeline";

import KpiPanel from "../components/dashboard/KpiPanel";
import TopToolbar from "../components/dashboard/TopToolbar";
import SystemStatus from "../components/dashboard/SystemStatus";
import RoomFilter from "../components/dashboard/RoomFilter";

import NotificationToast from "../components/common/NotificationToast";

function Dashboard() {

    const [floor, setFloor] = useState(
        hospital.floors[2]
    );

    const [selectedRoom, setSelectedRoom] = useState(
        null
    );

    const [filter, setFilter] = useState("all");

    const filteredFloor = useMemo(() => {

        if (filter === "all") {

            return floor;

        }

        return {

            ...floor,

            rooms: floor.rooms.filter(

                room => room.status.room === filter

            ),

        };

    }, [floor, filter]);

    return (

        <>

            <SystemStatus />

            <KpiPanel />

            <TopToolbar />

            <RoomFilter

                selected={filter}

                onChange={setFilter}

            />

            <div className="dashboard">

                <FloorSelector

                    floors={hospital.floors}

                    selectedFloor={floor}

                    onChange={(value) => {

                        setFloor(value);

                        setSelectedRoom(null);

                    }}

                />

                <FloorCanvas

                    floor={filteredFloor}

                    onRoomClick={setSelectedRoom}

                />

                <div className="right-panel">

                    <PatientPanel

                        room={selectedRoom}

                    />

                    <AlarmPanel />

                    <EventTimeline />

                </div>

            </div>

            <NotificationToast />

        </>

    );

}

export default Dashboard;