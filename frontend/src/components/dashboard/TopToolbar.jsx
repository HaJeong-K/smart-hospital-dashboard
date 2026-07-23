import { useState } from "react";

import {
    RefreshCw,
    ShieldAlert,
    HeartPulse,
    MoonStar,
    Radar,
    ChevronDown,
} from "lucide-react";

import FullscreenButton from "./FullscreenButton";
import { useDashboardStore } from "../../store/useDashboardStore";

// "시뮬레이션"이라는 표현을 빼고 "테스트 이벤트"로 이름을 바꿈 — 실제 병원에 납품된 뒤에도
// 신규 직원 교육이나 알림음/팝업 등 알림 파이프라인이 정상 동작하는지 점검할 때 실제 낙상을
// 기다리지 않고 바로 확인할 수 있도록 남겨둔 기능이다(소방 훈련의 화재경보 테스트와 같은 목적).
const TEST_EVENT_OPTIONS = [
    { type: "fall", label: "낙상 테스트", icon: ShieldAlert },
    { type: "breath", label: "호흡이상 테스트", icon: HeartPulse },
    { type: "inactivity", label: "움직임 없음 테스트", icon: MoonStar },
    { type: "sensor", label: "센서 오류 테스트", icon: Radar },
];

// children으로 넘어오는 내용(병실/환자 검색, 층 선택, 상태 필터)은 왼쪽에 배치한다 —
// 예전엔 이 셋이 층 선택 줄로 따로 빠져 두 줄을 차지했는데, 공간이 남는다는 피드백에
// 따라 한 줄에 왼쪽/오른쪽으로 나눠 담아 세로 공간을 절약한다.
function TopToolbar({ children }) {
    const [simOpen, setSimOpen] = useState(false);
    const triggerRandomAlarm = useDashboardStore((s) => s.triggerRandomAlarm);

    const refresh = () => {
        window.location.reload();
    };

    const simulate = (type) => {
        triggerRandomAlarm(type);
        setSimOpen(false);
    };

    return (
        <div className="top-toolbar">

            <div className="toolbar-left">
                {children}
            </div>

            <div className="toolbar-right">

                <div style={{ position: "relative" }}>
                    <button
                        className="toolbar-button"
                        onClick={() => setSimOpen((v) => !v)}
                        title="알림음/팝업 등 알림 파이프라인 점검용 테스트 이벤트 발생"
                    >
                        <ShieldAlert size={18} />
                        테스트 이벤트 발생
                        <ChevronDown size={14} />
                    </button>

                    {simOpen && (
                        <div className="toolbar-dropdown">
                            {TEST_EVENT_OPTIONS.map(({ type, label, icon: Icon }) => (
                                <button key={type} onClick={() => simulate(type)}>
                                    <Icon size={16} /> {label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    className="toolbar-button icon-only"
                    onClick={refresh}
                    title="새로고침"
                >
                    <RefreshCw size={18} />
                </button>

                <FullscreenButton />

            </div>

        </div>
    );
}

export default TopToolbar;
