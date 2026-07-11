function RoomTooltip({ room, x, y }) {
    if (!room) return null;

    return (
        <foreignObject
            x={x + 15}
            y={y - 70}
            width="180"
            height="70"
        >
            <div className="room-tooltip">

                <strong>{room.roomNo}호</strong>

                <div>{room.patient.name}</div>

                <small>

                    {room.status.room.toUpperCase()}

                </small>

            </div>
        </foreignObject>
    );
}

export default RoomTooltip;