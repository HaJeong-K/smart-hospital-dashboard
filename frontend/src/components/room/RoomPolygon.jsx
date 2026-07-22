import { useState } from "react";

import RoomLabel from "./RoomLabel";
import RoomTooltip from "./RoomTooltip";

function RoomPolygon({

    room,

    onClick,

    viewBox,

}) {

    const [hover,setHover]=useState(false);

    const points = room.polygon
        .map(([x,y])=>`${x*1000},${y*700}`)
        .join(" ");

    const colors={

        normal:"var(--room-normal)",

        inactive:"var(--room-inactive)",

        sensor:"var(--room-sensor)",

        warning:"var(--room-warning)",

        danger:"var(--room-danger)",

    };

    const centerX=
        room.polygon.reduce((a,b)=>a+b[0],0)
        /room.polygon.length;

    const centerY=
        room.polygon.reduce((a,b)=>a+b[1],0)
        /room.polygon.length;

    return(

        <g

            className={`room ${room.status.room}`}

            onMouseEnter={()=>setHover(true)}

            onMouseLeave={()=>setHover(false)}

            onClick={onClick}

            style={{

                cursor:"pointer",

            }}

        >

            <polygon

                points={points}

                fill={colors[room.status.room]}

                stroke="var(--room-border)"

                strokeWidth={hover?5:2}

                opacity={hover?1:0.85}

            />

            <RoomLabel room={room}/>

            {

                hover&&(

                    <RoomTooltip

                        room={room}

                        x={centerX*1000}

                        y={centerY*700}

                        viewBox={viewBox}

                    />

                )

            }

        </g>

    );

}

export default RoomPolygon;
