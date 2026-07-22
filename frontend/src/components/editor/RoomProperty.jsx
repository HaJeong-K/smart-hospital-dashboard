import {
    BedDouble,
    Radar,
    TriangleAlert,
    Plus,
    Minus,
} from "lucide-react";

import { ROOM_TYPES, STATUS_META, rebuildRoomStructure, setBedCount } from "../../data/floorsData";
import MiniMapPreview from "./MiniMapPreview";

function RoomProperty({

    room,

    setRooms,

    rooms,

    background,

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

    const isPatientRoom = room?.type === "patient";

    return (

        <div className="room-property">

            {!room ? (

                <div className="room-property-empty">
                    <BedDouble size={52} />
                    <h3>병실을 선택하세요.</h3>
                </div>

            ) : (

                <>

                    <h2>
                        Room Property
                    </h2>

                    <div className="property-grid">

                        <label>

                            <BedDouble size={16}/>

                            호실 번호 (Enter로 줄바꿈)

                            <textarea

                                className="room-name-textarea"

                                rows={2}

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

                </>

            )}

            {/* 전체 구성도 미리보기 — 방을 선택했는지 여부와 무관하게 항상 패널 맨 아래에
                표시한다(스크롤하면 가장 마지막에 보임). 원래 캔버스 위에 겹쳐 있던 것을
                여기로 옮겼다 (2026-07-22 피드백). 지금 선택된 방은 초록색으로 강조한다. */}
            <MiniMapPreview background={background} rooms={rooms || []} selectedId={room?.id} />

        </div>

    );

}

export default RoomProperty;
