import { Building2, Plus } from "lucide-react";

function BuildingManager({ hospital, setHospital }) {

    const addBuilding = () => {

        const next = (hospital.buildings?.length || 0) + 1;

        setHospital(prev => ({

            ...prev,

            buildings: [

                ...(prev.buildings || []),

                {
                    id: Date.now(),
                    name: `병동 ${next}`,
                },

            ],

        }));

    };

    return (

        <div className="hospital-card">

            <div className="hospital-card-header">

                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                }}>

                    <Building2 size={22} />

                    <h2>병동 관리</h2>

                </div>

                <button
                    className="toolbar-btn"
                    onClick={addBuilding}
                >
                    <Plus size={18} />
                    병동 추가
                </button>

            </div>

            {

                (!hospital.buildings ||
                    hospital.buildings.length === 0) && (

                    <div className="floor-empty">

                        등록된 병동이 없습니다.

                    </div>

                )

            }

            {

                hospital.buildings?.map(building => (

                    <div
                        key={building.id}
                        className="floor-card"
                    >

                        <strong>

                            {building.name}

                        </strong>

                    </div>

                ))

            }

        </div>

    );

}

export default BuildingManager;