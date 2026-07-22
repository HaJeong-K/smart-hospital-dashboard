import { ROOM_TYPES, STATUS_META } from "../../data/floorsData";

const DEFAULT_VIEW = { x: 0, y: 0, w: 1000, h: 700 };
const BOX_W = 236;
const EDGE_MARGIN = 4;

// 호실 위에 마우스를 올렸을 때 뜨는 상세 팝업.
// 항상 호버한 방의 정중앙(centerX, centerY)에 표시한다 — 가로/세로 모두 방 중심에
// 맞추고, 현재 화면에 보이는 영역(viewBox — 방이 일부에만 몰려 있는 층은 그 영역만큼
// 확대되어 있음, FloorCanvas 참고) 밖으로 넘치는 경우에만 안쪽으로 클램프한다.
// 높이는 실제 표시할 내용(줄 수)만큼만 그려서 필요한 만큼의 영역만 차지한다.
function RoomTooltip({ room, x, y, viewBox = DEFAULT_VIEW }) {
    if (!room) return null;

    const isPatientRoom = room.type === "patient";
    const occupied = isPatientRoom ? room.beds.filter((b) => b.patient).length : 0;
    const zoneLines = room.zones?.filter((z) => z.status !== "normal") || [];
    const lineCount = Math.max(zoneLines.length, 1);

    // 헤더(제목+부제) 높이 + 패딩을 넉넉히 확보하고, 줄마다 실제 렌더링 높이(약 25px)를 반영해
    // 필요한 만큼의 높이만 사용한다.
    const height = Math.min(96 + lineCount * 25, viewBox.h - EDGE_MARGIN * 2);

    // 방의 중심(x, y)에 팝업 중심이 오도록 배치하되, 현재 보이는 영역 밖으로 나가지 않도록 클램프한다.
    const boxX = Math.max(viewBox.x + EDGE_MARGIN, Math.min(x - BOX_W / 2, viewBox.x + viewBox.w - BOX_W - EDGE_MARGIN));
    const boxY = Math.max(viewBox.y + EDGE_MARGIN, Math.min(y - height / 2, viewBox.y + viewBox.h - height - EDGE_MARGIN));

    return (
        <foreignObject
            x={boxX}
            y={boxY}
            width={BOX_W}
            height={height}
        >
            <div className="room-tooltip">

                <strong>
                    {room.roomNo}
                    {!isPatientRoom && ROOM_TYPES[room.type]?.label && ROOM_TYPES[room.type].label !== room.roomNo
                        ? ` · ${ROOM_TYPES[room.type].label}`
                        : ""}
                </strong>

                <div>
                    {isPatientRoom
                        ? `${room.beds.length}인실 · 입실 ${occupied}/${room.beds.length}`
                        : "공용 구역"}
                </div>

                {zoneLines.length > 0 ? (
                    zoneLines.map((z) => (
                        <small key={z.id}>
                            <span className={`legend ${z.status}`} /> {z.label} · {STATUS_META[z.status]?.label}
                        </small>
                    ))
                ) : (
                    <small>
                        <span className={`legend ${room.status.room}`} /> {STATUS_META[room.status.room]?.label}
                    </small>
                )}

            </div>
        </foreignObject>
    );
}

export default RoomTooltip;
