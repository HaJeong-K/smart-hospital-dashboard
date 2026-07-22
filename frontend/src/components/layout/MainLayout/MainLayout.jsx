import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import NotificationToast from "../../common/NotificationToast";

// 알림(새로운 알림이 없습니다 / 알람 토스트)은 특정 탭(대시보드)에만 있던 것을 여기로 옮겨,
// 어떤 탭에 있든 화면 우측 하단에 항상 고정으로 표시되도록 한다 (2026-07-17 피드백 반영).
function MainLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const { pathname } = useLocation();
    // Monitoring(관제) 화면만 스크롤 없는 고정 레이아웃으로 동작해야 하므로, 다른 화면(환자관리/
    // 통계 등, 페이지 전체 스크롤이 필요한 화면)에는 영향을 주지 않도록 라우트 단위로만 적용한다.
    const isMonitoring = pathname === "/";

    return (
        <div className="app">

            <Header collapsed={collapsed} setCollapsed={setCollapsed} />

            <div className="main-wrapper">

                <Sidebar collapsed={collapsed} />

                <main className={`content${isMonitoring ? " content--fixed" : ""}`}>

                    <Outlet />

                </main>

            </div>

            <NotificationToast />

        </div>
    );
}

export default MainLayout;
