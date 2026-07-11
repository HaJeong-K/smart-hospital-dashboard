import { Outlet } from "react-router-dom";

import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";

function MainLayout() {
    return (
        <div className="app">

            <Header />

            <div className="main-wrapper">

                <Sidebar />

                <main className="content">

                    <Outlet />

                </main>

            </div>

        </div>
    );
}

export default MainLayout;