import { useState } from "react";

import {
    Search,
    RefreshCw,
    Maximize2,
    Download,
    CalendarDays,
} from "lucide-react";

function TopToolbar() {
    const [keyword, setKeyword] = useState("");

    const refresh = () => {
        window.location.reload();
    };

    const fullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    return (
        <div className="top-toolbar">

            <div className="toolbar-left">

                <div className="toolbar-search">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="병실 / 환자 검색"
                        value={keyword}
                        onChange={(e) =>
                            setKeyword(e.target.value)
                        }
                    />

                </div>

            </div>

            <div className="toolbar-right">

                <div className="today-box">

                    <CalendarDays size={18} />

                    <span>
                        {new Date().toLocaleDateString("ko-KR")}
                    </span>

                </div>

                <button
                    className="toolbar-button"
                    onClick={refresh}
                >
                    <RefreshCw size={18} />

                    새로고침
                </button>

                <button
                    className="toolbar-button"
                    onClick={fullscreen}
                >
                    <Maximize2 size={18} />

                    전체화면
                </button>

                <button
                    className="toolbar-button danger"
                >
                    <Download size={18} />

                    Report
                </button>

            </div>

        </div>
    );
}

export default TopToolbar;