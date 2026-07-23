import { useMemo, useState } from "react";
import { Search, History } from "lucide-react";

import { useDashboardStore } from "../store/useDashboardStore";
import { formatDateTime } from "../utils/stats";
import { RESOLUTION_LABEL } from "../data/floorsData";

const RESOLUTION_BADGE = { confirmed: "success", false_alarm: "neutral" };

// 과거 이력 화면 — 과거 특정 시점의 이벤트 이력을 날짜로 조회하는 전용 화면.
// Monitoring(관제)은 "현재 시점"만 보여주는 것이 목적이라 날짜 선택 패널을 그쪽에서
// 완전히 빼고, "과거를 조회"하는 용도는 여기 별도 메뉴로 분리했다(알람 관리는
// 활성 알람의 실시간 확인/처리가 핵심이라 사후 조회 용도와 목적이 달라 분리함).
function LogAnalysis() {
    const eventLog = useDashboardStore((s) => s.eventLog);

    const [historyFilter, setHistoryFilter] = useState("all");
    const [historyKeyword, setHistoryKeyword] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const filteredLog = useMemo(() => {
        let list = eventLog;

        if (historyFilter === "occurred") list = list.filter((e) => e.action === "occurred");
        else if (historyFilter !== "all") list = list.filter((e) => e.action === "resolved" && e.resolution === historyFilter);

        if (dateFrom) {
            const fromTime = new Date(`${dateFrom}T00:00:00`).getTime();
            list = list.filter((e) => new Date(e.time).getTime() >= fromTime);
        }
        if (dateTo) {
            const toTime = new Date(`${dateTo}T23:59:59`).getTime();
            list = list.filter((e) => new Date(e.time).getTime() <= toTime);
        }

        const q = historyKeyword.trim().toLowerCase();
        if (!q) return list;
        return list.filter((e) => {
            const haystack = `${e.floorName} ${e.roomNo} ${e.zoneLabel} ${e.patientName || ""} ${e.typeLabel}`.toLowerCase();
            return haystack.includes(q);
        });
    }, [eventLog, historyFilter, historyKeyword, dateFrom, dateTo]);

    const clearDateRange = () => {
        setDateFrom("");
        setDateTo("");
    };

    return (
        <div className="page-wrap">
            <div className="page-title">
                <div>
                    <h1>과거 이력</h1>
                    <p>날짜를 지정해 과거 발생/처리 이력을 조회합니다.</p>
                </div>
            </div>

            <div className="panel-section">
                <div className="page-title" style={{ marginBottom: 12 }}>
                    <h3 style={{ margin: 0 }}><History size={16} /> 이벤트 이력</h3>
                    <div className="chip-group">
                        {[
                            ["all", "전체"],
                            ["occurred", "발생"],
                            ["confirmed", "정상 해제"],
                            ["false_alarm", "오탐"],
                        ].map(([key, label]) => (
                            <button
                                key={key}
                                className={`chip ${historyFilter === key ? "active" : ""}`}
                                onClick={() => setHistoryFilter(key)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="log-filter-row">
                    <div className="date-range-field">
                        <span>기간</span>
                        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                        <span>~</span>
                        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                        {(dateFrom || dateTo) && (
                            <button className="chip" onClick={clearDateRange}>기간 초기화</button>
                        )}
                    </div>

                    <div className="search-bar toolbar-search" style={{ width: 320 }}>
                        <Search size={16} />
                        <input
                            placeholder="호실 / 구역 / 환자명 검색"
                            value={historyKeyword}
                            onChange={(e) => setHistoryKeyword(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>시각</th>
                                <th>위치</th>
                                <th>내용</th>
                                <th>구분</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLog.length === 0 && (
                                <tr><td colSpan={4} className="room-empty">이력이 없습니다.</td></tr>
                            )}
                            {filteredLog.slice(0, 150).map((e) => (
                                <tr key={`${e.id}-${e.action}`}>
                                    <td>{formatDateTime(e.time)}</td>
                                    <td>{e.floorName} {e.roomNo} · {e.zoneLabel}</td>
                                    <td>{e.typeLabel}{e.patientName ? ` · ${e.patientName}` : ""}</td>
                                    <td>
                                        {e.action === "occurred" ? (
                                            <span className="badge-tag danger">발생</span>
                                        ) : (
                                            <span className={`badge-tag ${RESOLUTION_BADGE[e.resolution] || "success"}`}>
                                                {RESOLUTION_LABEL[e.resolution]}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default LogAnalysis;
