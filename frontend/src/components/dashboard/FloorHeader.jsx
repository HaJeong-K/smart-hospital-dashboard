import {

    Building2,

    MapPinned,

} from "lucide-react";

import FloorLegend from "./FloorLegend";

function FloorHeader({

    floor,

}){

    return(

        <div className="floor-header">

            <div>

                <h2>

                    <Building2 size={22}/>

                    {floor.name}

                </h2>

                <span>

                    <MapPinned size={15}/>

                    스마트요양병원

                </span>

            </div>

            <FloorLegend/>

        </div>

    );

}

export default FloorHeader;