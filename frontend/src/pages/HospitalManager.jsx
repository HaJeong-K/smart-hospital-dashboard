import { useState } from "react";

import HospitalInfoCard from "../components/hospital/HospitalInfoCard";
import FloorManager from "../components/hospital/FloorManager";
import BuildingManager from "../components/hospital/BuildingManager";
import LogoUploader from "../components/hospital/LogoUploader";
import SaveHospitalButton from "../components/hospital/SaveHospitalButton";

function HospitalManager() {

    const [hospital, setHospital] = useState({

        name: "",

        address: "",

        phone: "",

        logo: null,

        floors: [],

        buildings: [],

    });

    return (

        <div className="hospital-manager">

            <div className="page-title">

                <div>

                    <h1>

                        Hospital Manager

                    </h1>

                    <p>

                        병원 기본정보 및 층 관리

                    </p>

                </div>

            </div>

            <div className="hospital-grid">

                <HospitalInfoCard

                    hospital={hospital}

                    setHospital={setHospital}

                />

                <LogoUploader

                    hospital={hospital}

                    setHospital={setHospital}

                />

            </div>

            <FloorManager

                hospital={hospital}

                setHospital={setHospital}

            />

            <BuildingManager

                hospital={hospital}

                setHospital={setHospital}

            />

            <SaveHospitalButton

                hospital={hospital}

            />

        </div>

    );

}

export default HospitalManager;