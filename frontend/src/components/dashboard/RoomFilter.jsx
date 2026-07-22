import { useEffect, useRef, useState } from "react";
import { Filter, RotateCcw } from "lucide-react";

// 이모지 대신 범례(FloorLegend)와 동일한 단색 원(.legend)으로 상태를 표시해
// 화면 전체에서 상태 표기 방식을 하나로 통일한다.
const FILTERS = [
    { key: "normal", label: "정상" },
    { key: "inactive", label: "움직임 없음" },
    { key: "warning", label: "호흡 이상" },
    { key: "danger", label: "낙상" },
    { key: "sensor", label: "센서 오류" },
];

// 층 선택 줄 우측 끝에 놓이는 아이콘 버튼 — 클릭하면 상태별 체크박스 목록이 팝오버로
// 뜬다. 여러 상태를 동시에 선택(다중 선택)할 수 있고, 아무것도 선택하지 않으면(기본값)
// 필터링 없이 전체가 표시된다 (2026-07-22 피드백 — 필터를 층 선택 줄에 통합).
function RoomFilter({

    selected,

    onToggle,

    onClear,

}) {

    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const activeCount = selected.size;

    return (

        <div className="status-filter" ref={wrapperRef}>

            <button
                className={`status-filter-btn ${activeCount > 0 ? "active" : ""}`}
                onClick={() => setOpen((v) => !v)}
                title="상태별로 필터링"
            >
                <Filter size={16} />
                필터
                {activeCount > 0 && <span className="status-filter-count">{activeCount}</span>}
            </button>

            {open && (
                <div className="status-filter-popover">
                    <div className="status-filter-popover__header">
                        <span>상태 필터</span>
                        <button
                            className="status-filter-clear"
                            onClick={onClear}
                            disabled={activeCount === 0}
                        >
                            <RotateCcw size={12} /> 초기화
                        </button>
                    </div>

                    {FILTERS.map((item) => (
                        <label key={item.key} className="status-filter-option">
                            <input
                                type="checkbox"
                                checked={selected.has(item.key)}
                                onChange={() => onToggle(item.key)}
                            />
                            <span className={`legend ${item.key}`} />
                            {item.label}
                        </label>
                    ))}
                </div>
            )}

        </div>

    );

}

export default RoomFilter;
