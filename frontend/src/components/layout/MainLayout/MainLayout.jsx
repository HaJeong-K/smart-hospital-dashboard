import { useState } from "react";
import { Outlet } from "react-router-dom";

import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import NotificationToast from "../../common/NotificationToast";

// 알림(새로운 알림이 없습니다 / 알람 토스트)은 특정 탭(대시보드)에만 있던 것을 여기로 옮겨,
// 어떤 탭에 있든 화면 우측 하단에 항상 고정으로 표시되도록 한다 (2026-07-17 피드백 반영).
function MainLayout() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="app">

            <Header collapsed={collapsed} setCollapsed={setCollapsed} />

            <div className="main-wrapper">

                <Sidebar collapsed={collapsed} />

                <main className="content">

                    <Outlet />

                </main>

            </div>

            <NotificationToast />

        </div>
    );
}

export default MainLayout;
