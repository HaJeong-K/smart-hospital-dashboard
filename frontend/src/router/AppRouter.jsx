import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout/MainLayout";
import Dashboard from "../pages/Dashboard";

function AppRouter() {
    return (
        <Routes>

            <Route element={<MainLayout />}>

                <Route
                    path="/"
                    element={<Dashboard />}
                />

            </Route>

            <Route
                path="*"
                element={<Navigate to="/" replace />}
            />

        </Routes>
    );
}

export default AppRouter;