import { Save } from "lucide-react";

function SaveHospitalButton() {

    const save = () => {

        alert("병원 정보 저장 (임시)");

    };

    return (

        <div style={{

            marginTop: 24,

            display: "flex",

            justifyContent: "flex-end",

        }}>

            <button

                className="toolbar-btn primary"

                onClick={save}

            >

                <Save size={18} />

                저장

            </button>

        </div>

    );

}

export default SaveHospitalButton;