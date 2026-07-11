import {
    BedDouble,
    User,
    Radar,
    TriangleAlert,
    FileText,
} from "lucide-react";

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

    return (

        <div className="room-property">

            <h2>

                Room Property

            </h2>

            <div className="property-grid">

                <label>

                    <BedDouble size={16}/>

                    병실번호

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

                    <User size={16}/>

                    환자명

                    <input

                        value={room.patient?.name || ""}

                        onChange={(e)=>

                            updateRoom(item=>({

                                ...item,

                                patient:{

                                    ...item.patient,

                                    name:e.target.value,

                                }

                            }))

                        }

                    />

                </label>

                <label>

                    나이

                    <input

                        type="number"

                        value={room.patient?.age || ""}

                        onChange={(e)=>

                            updateRoom(item=>({

                                ...item,

                                patient:{

                                    ...item.patient,

                                    age:Number(e.target.value),

                                }

                            }))

                        }

                    />

                </label>

                <label>

                    <Radar size={16}/>

                    Radar ID

                    <input

                        value={room.sensors?.[0]?.id || ""}

                        onChange={(e)=>

                            updateRoom(item=>({

                                ...item,

                                sensors:[

                                    {

                                        id:e.target.value,

                                        type:"MMWAVE",

                                    }

                                ]

                            }))

                        }

                    />

                </label>

                <label>

                    <TriangleAlert size={16}/>

                    상태

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

                        <option value="normal">

                            정상

                        </option>

                        <option value="warning">

                            주의

                        </option>

                        <option value="danger">

                            위험

                        </option>

                    </select>

                </label>

                <label>

                    <FileText size={16}/>

                    메모

                    <textarea

                        rows={5}

                        value={room.note || ""}

                        onChange={(e)=>

                            updateRoom(item=>({

                                ...item,

                                note:e.target.value,

                            }))

                        }

                    />

                </label>

            </div>

        </div>

    );

}

export default RoomProperty;