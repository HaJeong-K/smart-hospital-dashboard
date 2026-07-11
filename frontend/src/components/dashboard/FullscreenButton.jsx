import {

    Maximize2,

    Minimize2,

} from "lucide-react";

import {

    useState,

} from "react";

function FullscreenButton(){

    const [full,setFull]=useState(false);

    const toggle=()=>{

        if(!document.fullscreenElement){

            document.documentElement.requestFullscreen();

            setFull(true);

        }

        else{

            document.exitFullscreen();

            setFull(false);

        }

    }

    return(

        <button

            className="icon-button"

            onClick={toggle}

        >

            {

                full

                ?

                <Minimize2 size={18}/>

                :

                <Maximize2 size={18}/>

            }

        </button>

    );

}

export default FullscreenButton;