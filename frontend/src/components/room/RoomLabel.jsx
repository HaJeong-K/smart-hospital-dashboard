function RoomLabel({ room }) {

    const centerX =
        room.polygon.reduce((a,b)=>a+b[0],0)
        / room.polygon.length;

    const centerY =
        room.polygon.reduce((a,b)=>a+b[1],0)
        / room.polygon.length;

    return (

        <text

            x={centerX*1000}

            y={centerY*700}

            textAnchor="middle"

            dominantBaseline="middle"

            fill="white"

            fontSize="18"

            fontWeight="700"

        >

            {room.roomNo}

        </text>

    );

}

export default RoomLabel;