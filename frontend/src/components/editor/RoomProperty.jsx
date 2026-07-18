import {
    BedDouble,
    Radar,
    TriangleAlert,
    Plus,
    Minus,
} from "lucide-react";

import { ROOM_TYPES, STATUS_META, rebuildRoomStructure, setBedCount } from "../../data/floorsData";

function RoomProperty({

    room,

    setRooms,

}) {

    const updateRoom = (callback) => {

        if (!room) return;

        setRooms(prev =>

            prev.map(item =>

                item.id === room.id

                    ? callback(item)

                    : item

            )

        );

    };

    if (!room) {

        return (

            <div className="room-property empty">

                <BedDouble size={52} />

                <h3>병실을 선택하세요.</h3>

            </div>

        );

    }

    const isPatientRoom = room.type === "patient";

    return (

        <div className="room-property">

            <h2>
                Room Property
            </h2>

            <div className="property-grid">

                <label>

                    <BedDouble size={16}/>

                    호실 번호

                    <input

                        value={room.roomNo}

                        onChange={(e)=>

                            updateRoom(item=>({

                                ...item,

                                roomNo:e.target.value,

                            }))

                        }

                    />

                </label>

                <label>
                    구역 유형

                    <select
                        value={room.type}
                        onChange={(e) => updateRoom((item) => rebuildRoomStructure({ ...item, type: e.target.value }))}
                    >
                        {Object.entries(ROOM_TYPES).map(([key, meta]) => (
                            <option key={key} value={key}>{meta.label}</option>
                        ))}
                    </select>
                </label>

                {isPatientRoom && (
                    <label>
                        병상 수 (다인실 지원)
                        <div className="bed-stepper">
                            <button
                                type="button"
                                className="icon-button-sm"
                                onClick={() => updateRoom((item) => setBedCount(item, (item.beds?.length || 1) - 1))}
                            >
                                <Minus size={14} />
                            </button>
                            <span>{room.beds?.length || 1}인실</span>
                            <button
                                type="button"
                                className="icon-button-sm"
                                onClick={() => updateRoom((item) => setBedCount(item, (item.beds?.length || 1) + 1))}
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                        <span className="form-hint">환자 배정/이름 입력은 "호실별 관리" 또는 "환자 관리" 화면에서 합니다.</span>
                    </label>
                )}

                <label>

                    <Radar size={16}/>

                    센서 개수 (구역당 1개 자동 배정)

                    <input value={`${room.sensors?.length || 0}개`} readOnly />

                </label>

                <label>

                    <TriangleAlert size={16}/>

                    대표 상태 (수동 지정, 저장 시 유지됨)

                    <select

                        value={room.status?.room || "normal"}

                        onChange={(e)=>

                            updateRoom(item=>({

                                ...item,

                                status:{

                                    ...item.status,

                                    room:e.target.value,

                                }

                            }))

                        }

                    >

                        {Object.entries(STATUS_META).map(([key, meta]) => (
                            <option key={key} value={key}>{meta.label}</option>
                        ))}

                    </select>

                </label>

            </div>

        </div>

    );

}

export default RoomProperty;
