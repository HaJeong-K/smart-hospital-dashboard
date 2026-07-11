import {

    CircleCheckBig,

    TriangleAlert,

    ShieldAlert,

} from "lucide-react";

function RoomStatus({ status }) {

    if(status==="normal"){

        return <CircleCheckBig size={18}/>

    }

    if(status==="warning"){

        return <TriangleAlert size={18}/>

    }

    return <ShieldAlert size={18}/>

}

export default RoomStatus;