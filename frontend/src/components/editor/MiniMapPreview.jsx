// 전체 구성도(방 배치) 미리보기 — 원래는 캔버스 우측 하단에 작은 박스로 겹쳐 떠 있었는데,
// 배치도를 가리고 위치도 고정 크기(160x112)라 잘 안 보인다는 피드백으로 Room Property
// 패널 맨 아래(스크롤 영역 안)로 옮겼다. 가로는 패널 폭에 꽉 채우고, 세로는 실제 평면도
// 비율(1000:700)을 그대로 유지한 채 자동으로 계산된다 (2026-07-22 피드백).
// selectedId: 지금 Room Property에 표시 중인 방의 id — 이 미리보기 안에서도 어떤 방을
// 보고 있는지 바로 알 수 있도록 그 방만 초록색으로 강조한다 (2026-07-22 피드백).
function MiniMapPreview({ background, rooms, selectedId }) {
    return (
        <div className="minimap-preview">
            <div className="minimap-preview__label">전체 구성도 미리보기</div>
            <svg className="minimap-preview__svg" viewBox="0 0 1000 700">
                {background && (
                    <image href={background} width="1000" height="700" />
                )}
                {rooms.map((room) => {
                    const active = room.id === selectedId;
                    return (
                        <polygon
                            key={room.id}
                            points={room.polygon
                                .map(([x, y]) => `${x * 1000},${y * 700}`)
                                .join(" ")}
                            fill={active ? "rgba(34,197,94,.45)" : "rgba(59,130,246,.3)"}
                            stroke={active ? "#22c55e" : "#2563eb"}
                            strokeWidth={active ? 3 : 2}
                        />
                    );
                })}
            </svg>
        </div>
    );
}

export default MiniMapPreview;
