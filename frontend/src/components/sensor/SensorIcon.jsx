import { Radar } from "lucide-react";

function SensorIcon({ room }) {

    const centerX =
        room.polygon.reduce((a,b)=>a+b[0],0)
        / room.polygon.length;

    const centerY =
        room.polygon.reduce((a,b)=>a+b[1],0)
        / room.polygon.length;

    return (

        <foreignObject

            x={centerX*1000-12}

            y={centerY*700+25}

            width="24"

            height="24"

        >

            <div className="sensor-icon">

                <Radar size={18}/>

            </div>

        </foreignObject>

    );

}

export default SensorIcon;