import { useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
    Plus,
    Trash2,
    Upload,
    Building2,
    Radar,
    BedDouble,
    SquarePen,
    Image,
    ChevronRight,
} from "lucide-react";

import { useDashboardStore } from "../../store/useDashboardStore";

function FloorManager({

    hospital,

    setHospital,

}) {

    const navigate = useNavigate();
    const removeFloorFromStore = useDashboardStore((s) => s.removeFloor);

    const fileRefs = useRef({});

    const addFloor = () => {

        const next = hospital.floors.length + 1;

        const newFloor = {

            id: `floor-${Date.now()}`,

            name: `${next}F`,

            floorMap: { type: "image", src: null, width: 1000, height: 700 },

            rooms: [],

            sensors: [],

            beds: 0,

        };

        setHospital(prev => ({

            ...prev,

            floors: [

                ...prev.floors,

                newFloor,

            ],

        }));

    };

    const removeFloor = (id) => {

        if (!window.confirm("층을 삭제하시겠습니까? 해당 층의 활성 알람도 함께 정리됩니다.")) return;

        removeFloorFromStore(id);

    };

    const renameFloor = (id, value) => {

        setHospital(prev => ({

            ...prev,

            floors: prev.floors.map(floor =>

                floor.id === id

                    ? {

                        ...floor,

                        name: value,

                    }

                    : floor

            ),

        }));

    };

    const uploadFloor = (id, file) => {

        if (!file) return;

        const src = URL.createObjectURL(file);

        setHospital(prev => ({

            ...prev,

            floors: prev.floors.map(floor =>

                floor.id === id

                    ? {

                        ...floor,

                        floorMap: { ...(floor.floorMap || { type: "image", width: 1000, height: 700 }), src },

                    }

                    : floor

            ),

        }));

    };

    const openEditor = (floor) => {

        navigate(

            `/editor/${floor.id}`,

            {

                state: {

                    floor,

                },

            }

        );

    };

    return (

        <div className="hospital-card">

            <div className="hospital-card-header">

                <div className="header-title">

                    <Building2 size={22}/>

                    <h2>

                        층 관리

                    </h2>

                </div>

                <button

                    className="toolbar-btn"

                    onClick={addFloor}

                >

                    <Plus size={18}/>

                    층 추가

                </button>

            </div>

            {

                hospital.floors.length===0 && (

                    <div className="floor-empty">

                        등록된 층이 없습니다.

                    </div>

                )

            }

            <div className="floor-list">

                {

                    hospital.floors.map(floor=>(

                        <div

                            className="floor-card"

                            key={floor.id}

                        >

                            <div className="floor-thumbnail-wrapper">

                                {

                                    floor.floorMap?.src ? (

                                        <img

                                            src={floor.floorMap.src}

                                            className="floor-thumbnail"

                                            alt="floor"

                                        />

                                    ) : (

                                        <div className="floor-thumbnail empty">

                                            <Image

                                                size={34}

                                            />

                                        </div>

                                    )

                                }

                            </div>

                            <div className="floor-content">

                                <div className="floor-top">

                                    <input

                                        className="floor-name"

                                        value={floor.name}

                                        onChange={(e)=>

                                            renameFloor(

                                                floor.id,

                                                e.target.value

                                            )

                                        }

                                    />

                                </div>

                                <div className="floor-info">

                                    <span>

                                        <BedDouble size={15}/>

                                        {floor.rooms.length}

                                        &nbsp;Rooms

                                    </span>

                                    <span>

                                        <Radar size={15}/>

                                        {floor.sensors.length}

                                        &nbsp;Sensors

                                    </span>

                                    <span>

                                        <ChevronRight size={15}/>

                                        {floor.beds}

                                        &nbsp;Beds

                                    </span>

                                </div>
                                                                <div className="floor-actions">

                                    <button
                                        className="toolbar-btn"
                                        onClick={() =>
                                            fileRefs.current[floor.id]?.click()
                                        }
                                    >
                                        <Upload size={16} />
                                        평면도
                                    </button>

                                    <button
                                        className="toolbar-btn primary"
                                        onClick={() => openEditor(floor)}
                                    >
                                        <SquarePen size={16} />
                                        Floor Editor
                                    </button>

                                    <button
                                        className="toolbar-btn danger"
                                        onClick={() => removeFloor(floor.id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                    <input
                                        hidden
                                        type="file"
                                        accept="image/*"
                                        ref={(el) => {
                                            fileRefs.current[floor.id] = el;
                                        }}
                                        onChange={(e) =>
                                            uploadFloor(
                                                floor.id,
                                                e.target.files[0]
                                            )
                                        }
                                    />

                                </div>

                            </div>

                        </div>

                    ))

                }

            </div>

            <div className="floor-summary">

                <div className="summary-card">

                    <span>총 층수</span>

                    <strong>

                        {hospital.floors.length}

                    </strong>

                </div>

                <div className="summary-card">

                    <span>총 병실</span>

                    <strong>

                        {

                            hospital.floors.reduce(

                                (sum, floor) =>

                                    sum + floor.rooms.length,

                                0

                            )

                        }

                    </strong>

                </div>

                <div className="summary-card">

                    <span>총 센서</span>

                    <strong>

                        {

                            hospital.floors.reduce(

                                (sum, floor) =>

                                    sum + floor.sensors.length,

                                0

                            )

                        }

                    </strong>

                </div>

                <div className="summary-card">

                    <span>총 병상</span>

                    <strong>

                        {

                            hospital.floors.reduce(

                                (sum, floor) =>

                                    sum + floor.beds,

                                0

                            )

                        }

                    </strong>

                </div>

            </div>

        </div>

    );

}

export default FloorManager;