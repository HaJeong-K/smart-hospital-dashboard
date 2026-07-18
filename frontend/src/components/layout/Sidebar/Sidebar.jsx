import { NavLink } from "react-router-dom";

import {
    Activity,
    BedDouble,
    Users,
    TriangleAlert,
    ChartColumn,
    Settings,
} from "lucide-react";

// 최종 메뉴 구조(6개) — 이전에는 "대시보드"와 "모니터링"이 둘 다 "/"를 가리켜
// 사실상 같은 화면이 중복 노출되던 문제가 있었다. 최종 정리안에는 별도 "대시보드"
// 메뉴가 없고, "모니터링" 하나가 KPI + 층별 실시간 상태 + 이벤트 로그 + 환자 상세 +
// 실시간 알림을 모두 포함하는 통합 관제 화면 역할을 한다.
const menus = [
    { title: "모니터링", icon: Activity, to: "/" },
    { title: "호실별 관리", icon: BedDouble, to: "/rooms" },
    { title: "환자 관리", icon: Users, to: "/patients" },
    { title: "알람 관리", icon: TriangleAlert, to: "/alarms" },
    { title: "통계", icon: ChartColumn, to: "/stats" },
    { title: "설정", icon: Settings, to: "/settings" },
];

function Sidebar({ collapsed }) {
    return (
        <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>

            <nav className="sidebar-menu">

                {menus.map((menu) => {

                    const Icon = menu.icon;

                    return (
                        <NavLink
                            key={menu.title}
                            to={menu.to}
                            end={menu.to === "/"}
                            className={({ isActive }) =>
                                `sidebar-item ${isActive ? "active" : ""}`
                            }
                            title={collapsed ? menu.title : undefined}
                        >

                            <Icon size={20} />

                            <span>{menu.title}</span>

                        </NavLink>
                    );
                })}

            </nav>

        </aside>
    );
}

export default Sidebar;
