import { useRef, useState } from "react";

import {
    RefreshCw,
    Download,
    CalendarDays,
    ShieldAlert,
    HeartPulse,
    MoonStar,
    Radar,
    ChevronDown,
} from "lucide-react";

import SearchBar from "../layout/Header/SearchBar";
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

function toISODate(d) {
    const offset = d.getTimezoneOffset();
    return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function TopToolbar({ keyword = "", onKeywordChange = () => {} }) {
    const [simOpen, setSimOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(() => toISODate(new Date()));
    const dateInputRef = useRef(null);
    const floors = useDashboardStore((s) => s.hospital.floors);
    const triggerRandomAlarm = useDashboardStore((s) => s.triggerRandomAlarm);

    const displayDate = new Date(`${selectedDate}T00:00:00`).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "short",
    });

    const refresh = () => {
        window.location.reload();
    };

    // 현재 시설 전체 병실/구역/환자 현황을 CSV로 내보낸다 (통계 보고서 다운로드)
    const downloadReport = () => {
        const rows = [["층", "호실/구역", "유형", "병상", "환자명", "상태", "누적낙상", "누적호흡이상"]];
        for (const floor of floors) {
            for (const room of floor.rooms) {
                if (room.type === "patient" && room.beds.length > 0) {
                    for (const bed of room.beds) {
                        rows.push([
                            floor.name,
                            room.roomNo,
                            room.type,
                            bed.label,
                            bed.patient?.name || "공석",
                            room.status.room,
                            bed.patient?.fallCount || 0,
                            bed.patient?.breathCount || 0,
                        ]);
                    }
                } else {
                    rows.push([floor.name, room.roomNo, room.type, "-", "-", room.status.room, "-", "-"]);
                }
            }
        }
        const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
        const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `현황리포트_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const simulate = (type) => {
        triggerRandomAlarm(type);
        setSimOpen(false);
    };

    return (
        <div className="top-toolbar">

            <div className="toolbar-left">
                <SearchBar
                    className="toolbar-search"
                    placeholder="병실 / 환자 검색"
                    value={keyword}
                    onChange={onKeywordChange}
                />
            </div>

            <div className="toolbar-right">

                {/* 예전에는 오늘 날짜만 표시하는 정적 텍스트였음 — 클릭하면 실제 브라우저 달력이
                    떠서 연/월/일을 직접 선택할 수 있도록 숨겨진 date input을 함께 두고,
                    showPicker()로 열어준다(미지원 브라우저에서는 포커스로 대체). */}
                <div
                    className="today-box"
                    title="날짜 선택"
                    onClick={() => {
                        const el = dateInputRef.current;
                        if (!el) return;
                        if (typeof el.showPicker === "function") el.showPicker();
                        else el.focus();
                    }}
                >

                    <CalendarDays size={18} />

                    <span>{displayDate}</span>

                    <input
                        ref={dateInputRef}
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />

                </div>

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
                    className="toolbar-button"
                    onClick={refresh}
                >
                    <RefreshCw size={18} />

                    새로고침
                </button>

                <FullscreenButton />

                <button
                    className="toolbar-button danger"
                    onClick={downloadReport}
                >
                    <Download size={18} />

                    Report
                </button>

            </div>

        </div>
    );
}

export default TopToolbar;
