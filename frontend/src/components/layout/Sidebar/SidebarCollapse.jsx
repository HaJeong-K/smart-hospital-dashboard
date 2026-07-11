import {

    PanelLeftClose,

    PanelLeftOpen,

} from "lucide-react";

function SidebarCollapse({

    collapsed,

    setCollapsed,

}){

    return(

        <button

            className="icon-button"

            onClick={()=>

                setCollapsed(

                    !collapsed

                )

            }

        >

            {

                collapsed

                ?

                <PanelLeftOpen size={18}/>

                :

                <PanelLeftClose size={18}/>

            }

        </button>

    );

}

export default SidebarCollapse;