// 통계 화면 전용 — 외부 차트 라이브러리 없이 순수 CSS만으로 그리는 세로 막대 추이 그래프.
// data: [{ label, value }]
function TrendBarChart({ data, unit = "", color = "var(--primary)" }) {
    if (!data || data.length === 0) {
        return <div className="room-empty">표시할 데이터가 없습니다.</div>;
    }

    const max = Math.max(1, ...data.map((d) => d.value));

    return (
        <div className="trend-chart">
            {data.map((d, index) => {
                const pct = Math.max(3, Math.round((d.value / max) * 100));
                return (
                    <div className="trend-chart__col" key={index}>
                        <span className="trend-chart__value">{d.value}{unit}</span>
                        <div className="trend-chart__bar-wrap">
                            <div className="trend-chart__bar" style={{ height: `${pct}%`, background: color }} />
                        </div>
                        <span className="trend-chart__label">{d.label}</span>
                    </div>
                );
            })}
        </div>
    );
}

export default TrendBarChart;
