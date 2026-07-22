import {

    MapPinned,

} from "lucide-react";

import FloorLegend from "./FloorLegend";

// 예전에는 "2F"(큰 글씨, 줄1)와 "스마트요양병원"(작은 글씨, 줄2)이 두 줄로 나뉘어 있었는데,
// 한 줄에 "스마트요양병원 · 2F" 형태로 합치고 글꼴 크기도 통일했다 (2026-07-22 피드백).
function FloorHeader({

    floor,

}){

    return(

        <div className="floor-header">

            <h2>

                <MapPinned size={15}/>

                스마트요양병원 · {floor.name}

            </h2>

            <FloorLegend/>

        </div>

    );

}

export default FloorHeader;