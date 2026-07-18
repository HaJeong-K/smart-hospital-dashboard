import { Routes, Route } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout/MainLayout";

import Dashboard from "../pages/Dashboard";
import HospitalManager from "../pages/HospitalManager";
import FloorEditor from "../pages/FloorEditor";
import RoomsManager from "../pages/RoomsManager";
import PatientsManager from "../pages/PatientsManager";
import AlarmsManager from "../pages/AlarmsManager";
import StatsReport from "../pages/StatsReport";
import SettingsPage from "../pages/SettingsPage";

function AppRouter() {

    return (

        <Routes>

            <Route element={<MainLayout />}>

                <Route
                    path="/"
                    element={<Dashboard />}
                />

                <Route
                    path="/rooms"
                    element={<RoomsManager />}
                />

                <Route
                    path="/patients"
                    element={<PatientsManager />}
                />

                <Route
                    path="/alarms"
                    element={<AlarmsManager />}
                />

                <Route
                    path="/stats"
                    element={<StatsReport />}
                />

                <Route
                    path="/settings"
                    element={<SettingsPage />}
                />

                <Route
                    path="/hospital"
                    element={<HospitalManager />}
                />

                <Route
                    path="/editor/:floorId"
                    element={<FloorEditor />}
                />

            </Route>

        </Routes>

    );

}

export default AppRouter;
