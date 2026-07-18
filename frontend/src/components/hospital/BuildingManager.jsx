import { Building2, Plus, Trash2 } from "lucide-react";

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

    const renameBuilding = (id, name) => {

        setHospital(prev => ({

            ...prev,

            buildings: (prev.buildings || []).map(b =>
                b.id === id ? { ...b, name } : b
            ),

        }));

    };

    const removeBuilding = (id) => {

        if (!window.confirm("병동을 삭제하시겠습니까?")) return;

        setHospital(prev => ({

            ...prev,

            buildings: (prev.buildings || []).filter(b => b.id !== id),

        }));

    };

    return (

        <div className="hospital-card">

            <div className="hospital-card-header">

                <div className="header-title">
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
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px" }}
                    >

                        <input
                            value={building.name}
                            onChange={(e) => renameBuilding(building.id, e.target.value)}
                            style={{
                                border: "none",
                                background: "transparent",
                                color: "var(--text)",
                                fontWeight: 700,
                                fontSize: 15,
                            }}
                        />

                        <button
                            className="icon-button"
                            onClick={() => removeBuilding(building.id)}
                        >
                            <Trash2 size={16} />
                        </button>

                    </div>

                ))

            }

        </div>

    );

}

export default BuildingManager;