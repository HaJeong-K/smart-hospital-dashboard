import { Routes, Route } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout/MainLayout";

import Dashboard from "../pages/Dashboard";
import HospitalManager from "../pages/HospitalManager";
import FloorEditor from "../pages/FloorEditor";

function AppRouter() {

    return (

        <Routes>

            <Route element={<MainLayout />}>

                <Route
                    path="/"
                    element={<Dashboard />}
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