import HospitalInfoCard from "../components/hospital/HospitalInfoCard";
import FloorManager from "../components/hospital/FloorManager";
import BuildingManager from "../components/hospital/BuildingManager";
import LogoUploader from "../components/hospital/LogoUploader";
import SaveHospitalButton from "../components/hospital/SaveHospitalButton";

import { useDashboardStore } from "../store/useDashboardStore";

function HospitalManager() {

    // 이전에는 이 페이지가 자체 useState로 병원 정보를 들고 있어서
    // 여기서 병실/층을 아무리 편집해도 대시보드(실시간 모니터링)에는 절대 반영되지 않았다.
    // 이제 공용 store를 그대로 사용하므로 모든 화면이 같은 데이터를 본다.
    const hospital = useDashboardStore((s) => s.hospital);
    const setHospital = useDashboardStore((s) => s.setHospital);

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
