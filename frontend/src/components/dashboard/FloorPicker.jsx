import { useEffect, useRef, useState } from "react";
import { Columns2 } from "lucide-react";

// 상태 필터(RoomFilter) 옆에 놓이는 아이콘 버튼 — 클릭하면 왼쪽/오른쪽 배치도에
// 띄울 층을 각각 고를 수 있는 팝오버가 뜬다(같은 층 목록에서 둘 다 자유롭게 선택 가능).
// 층이 1개뿐이면 배치도 자체가 1개만 그려지므로(Dashboard.jsx) 오른쪽 선택 필드는 숨긴다.
function FloorPicker({

    floors,

    leftFloorId,

    rightFloorId,

    onLeftChange,

    onRightChange,

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

    return (

        <div className="status-filter" ref={wrapperRef}>

            <button
                className="status-filter-btn"
                onClick={() => setOpen((v) => !v)}
                title="왼쪽/오른쪽 배치도에 표시할 층 선택"
            >
                <Columns2 size={16} />
                층 선택
            </button>

            {open && (
                <div className="status-filter-popover floor-picker-popover">

                    <div className="status-filter-popover__header">
                        <span>배치도 층 선택</span>
                    </div>

                    <label className="floor-picker-field">
                        <span>왼쪽</span>
                        <select
                            value={leftFloorId || ""}
                            onChange={(e) => onLeftChange(e.target.value)}
                        >
                            {floors.map((f) => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>
                    </label>

                    {floors.length > 1 && (
                        <label className="floor-picker-field">
                            <span>오른쪽</span>
                            <select
                                value={rightFloorId || ""}
                                onChange={(e) => onRightChange(e.target.value)}
                            >
                                {floors.map((f) => (
                                    <option key={f.id} value={f.id}>{f.name}</option>
                                ))}
                            </select>
                        </label>
                    )}

                </div>
            )}

        </div>

    );

}

export default FloorPicker;
