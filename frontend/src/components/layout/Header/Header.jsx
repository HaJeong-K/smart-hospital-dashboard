import {
    Hospital,
    Bell,
    UserRound,
    CalendarDays,
    Clock3,
} from "lucide-react";

import { useEffect, useState } from "react";

import ThemeToggle from "./ThemeToggle";

function Header() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <header className="header">

            <div className="header-left">

                <div className="logo-circle">

                    <Hospital size={28} />

                </div>

                <div>

                    <h2>시니어 위험 감지 대시보드</h2>

                    <span>
                        60GHz mmWave 모니터링 시스템
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

                <button className="icon-button">

                    <Bell size={20} />

                </button>

                <button className="icon-button">

                    <UserRound size={20} />

                </button>

            </div>

        </header>
    );
}

export default Header;