import {
    Hospital,
    Bell,
    UserRound,
    CalendarDays,
    Clock3,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ThemeToggle from "./ThemeToggle";
import SidebarCollapse from "../Sidebar/SidebarCollapse";
import { useDashboardStore } from "../../../store/useDashboardStore";

function Header({ collapsed, setCollapsed }) {
    const [time, setTime] = useState(new Date());
    const navigate = useNavigate();
    const alarmCount = useDashboardStore((s) => s.alarms.length);
    const hospitalName = useDashboardStore((s) => s.hospital.name);

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <header className="header">

            <div className="header-left">

                <SidebarCollapse collapsed={collapsed} setCollapsed={setCollapsed} />

                <div className="logo-circle">

                    <Hospital size={28} />

                </div>

                <div>

                    <h2>시니어 위험 감지 대시보드</h2>

                    <span>
                        {hospitalName} · 60GHz mmWave 모니터링 시스템
                    </span>

                </div>

            </div>

            <div className="header-right">

                <div className="header-time">

                    <CalendarDays size={17} />

                    {time.toLocaleDateString("ko-KR")}

                </div>

                <div className="header-time">

                    <Clock3 size={17} />

                    {time.toLocaleTimeString("ko-KR")}

                </div>

                <ThemeToggle />

                <button
                    className="icon-button"
                    onClick={() => navigate("/alarms")}
                    title="알람 관리"
                    style={{ position: "relative" }}
                >

                    <Bell size={20} />
                    {alarmCount > 0 && <span className="header-alarm-badge">{alarmCount}</span>}

                </button>

                <button
                    className="icon-button"
                    onClick={() => navigate("/settings")}
                    title="설정"
                >

                    <UserRound size={20} />

                </button>

            </div>

        </header>
    );
}

export default Header;
