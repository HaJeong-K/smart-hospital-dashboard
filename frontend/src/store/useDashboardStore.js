import { create } from "zustand";
import { persist } from "zustand/middleware";
import hospitalConfig from "../config/hospital.config";
import { worstStatus, ALARM_TYPE_LABEL, ALARM_TYPE_TO_STATUS } from "../data/floorsData";

function uid(prefix = "id") {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const MAX_LOG = 300;

function countBeds(rooms) {
    return rooms.reduce((sum, r) => sum + (r.beds?.length || 0), 0);
}

function cloneHospital(hospital) {
    return {
        ...hospital,
        buildings: hospital.buildings?.map((b) => ({ ...b })) || [],
        floors: hospital.floors.map((floor) => ({
            ...floor,
            floorMap: floor.floorMap ? { ...floor.floorMap } : floor.floorMap,
            sensors: floor.sensors ? [...floor.sensors] : [],
            walls: floor.walls ? floor.walls.map((w) => ({ ...w, points: w.points.map((p) => [...p]) })) : [],
            doors: floor.doors ? floor.doors.map((d) => ({ ...d })) : [],
            structures: floor.structures ? floor.structures.map((s) => ({ ...s, polygon: s.polygon.map((p) => [...p]) })) : [],
            rooms: floor.rooms.map((room) => ({
                ...room,
                beds: room.beds ? room.beds.map((bed) => ({ ...bed, patient: bed.patient ? { ...bed.patient } : null })) : [],
                sensors: room.sensors ? room.sensors.map((s) => ({ ...s })) : [],
                zones: room.zones ? room.zones.map((z) => ({ ...z })) : [],
                status: { ...room.status },
            })),
        })),
    };
}

function findRoom(hospital, floorId, roomId) {
    const floor = hospital.floors.find((f) => f.id === floorId);
    if (!floor) return null;
    const room = floor.rooms.find((r) => r.id === roomId);
    if (!room) return null;
    return { floor, room };
}

function findBedByZone(room, zoneId) {
    return room.beds?.find((b) => b.zoneId === zoneId) || null;
}

// 초기 시드 데이터: config/hospital.config.js 의 hospital 메타 + floors 를
// 스토어가 다루는 평평한(단일) hospital 오브젝트로 병합한다.
function buildInitialHospital() {
    return {
        id: hospitalConfig.hospital.id,
        name: hospitalConfig.hospital.name,
        address: "",
        phone: "",
        email: "",
        manager: "",
        beds: countBeds(hospitalConfig.floors.flatMap((f) => f.rooms)),
        logo: null,
        buildings: [],
        floors: hospitalConfig.floors.map((floor) => ({
            id: floor.id,
            name: floor.name,
            floorMap: floor.floorMap,
            rooms: floor.rooms,
            sensors: floor.rooms.flatMap((r) => r.sensors || []),
            walls: floor.walls || [],
            doors: floor.doors || [],
            structures: floor.structures || [],
            beds: countBeds(floor.rooms),
        })),
    };
}

// 초기 mock 사용자 목록 — 실제 인증/백엔드 연동 전까지 프론트 단독으로 권한 개념만 시연한다.
function buildInitialUsers() {
    return [
        { id: "user-1", name: "김하정", role: "관리자", email: "beankonic@gmail.com" },
        { id: "user-2", name: "박수간", role: "수간호사", email: "" },
        { id: "user-3", name: "이당직", role: "간호사", email: "" },
    ];
}

export const useDashboardStore = create(
    persist(
        (set, get) => ({
            hospital: buildInitialHospital(),
            selectedFloorId: "3F",
            connectionStatus: "connected",
            alarms: [], // 활성(미해제) 알람
            eventLog: [], // 발생/해제 이력 (알람 관리 화면용)
            users: buildInitialUsers(), // 사용자 및 권한 관리 (mock)
            notificationSettings: { popup: true, sound: true }, // 알림 팝업/소리 on-off

            // 실제 60GHz mmWave 레이더 센서 서버와 연동하기 위한 연결 설정 (설정 > 데이터 탭).
            // 아직 실제 하드웨어에는 연결하지 않지만(버추얼 인터페이스 단계), 병원 IT 담당자가
            // 미리 서버 주소/프로토콜/인증키를 입력해두고 실제 장비 설치 시 바로 사용할 수 있도록 함.
            sensorIntegration: {
                protocol: "mqtt", // mqtt | websocket | rest
                host: "",
                port: "",
                apiKey: "",
                autoReconnect: true,
            },

            // ---- 병원/층 관리 (HospitalInfoCard/LogoUploader/FloorManager/BuildingManager 가 그대로 사용) ----
            setHospital: (updater) => {
                set((s) => ({
                    hospital: typeof updater === "function" ? updater(s.hospital) : { ...s.hospital, ...updater },
                }));
            },

            setSelectedFloorId: (floorId) => set({ selectedFloorId: floorId }),

            toggleConnection: () =>
                set((s) => ({ connectionStatus: s.connectionStatus === "connected" ? "disconnected" : "connected" })),

            // FloorEditor에서 "저장"을 누르면 편집 중이던 rooms/배경/벽/문을 스토어에 커밋한다.
            // 이게 없으면 층 편집기에서 그린 병실이 대시보드/병실목록에 절대 반영되지 않는다 (기존 버그).
            saveFloorRooms: (floorId, rooms, floorMapPatch, walls, doors, structures) => {
                set((s) => {
                    const hospital = cloneHospital(s.hospital);
                    const floor = hospital.floors.find((f) => f.id === floorId);
                    if (!floor) return {};
                    floor.rooms = rooms.map((room) => ({
                        ...room,
                        beds: room.beds || [],
                        status: { room: room.status?.room || worstStatus(room.zones || []) },
                    }));
                    floor.sensors = floor.rooms.flatMap((r) => r.sensors || []);
                    floor.beds = countBeds(floor.rooms);
                    if (walls) floor.walls = walls;
                    if (doors) floor.doors = doors;
                    if (structures) floor.structures = structures;
                    if (floorMapPatch) floor.floorMap = { ...floor.floorMap, ...floorMapPatch };
                    return { hospital };
                });
            },

            addFloor: (name) => {
                const id = uid("floor");
                set((s) => ({
                    hospital: {
                        ...s.hospital,
                        floors: [
                            ...s.hospital.floors,
                            {
                                id,
                                name: name || `${s.hospital.floors.length + 1}F`,
                                floorMap: { type: "image", src: null, width: 1000, height: 700 },
                                rooms: [],
                                sensors: [],
                                walls: [],
                                doors: [],
                                structures: [],
                                beds: 0,
                            },
                        ],
                    },
                }));
                return id;
            },

            // 층 삭제 시 해당 층의 방과 연결된 활성 알람/이력도 함께 정리한다.
            removeFloor: (floorId) => {
                set((s) => ({
                    hospital: { ...s.hospital, floors: s.hospital.floors.filter((f) => f.id !== floorId) },
                    alarms: s.alarms.filter((a) => a.floorId !== floorId),
                    selectedFloorId: s.selectedFloorId === floorId ? (s.hospital.floors[0]?.id || null) : s.selectedFloorId,
                }));
            },

            // ---- 침상(bed)별 환자 정보 (F6, 1인실/다인실 공통) ----
            // patch가 null이면 퇴실(공석) 처리, 아니면 기존 환자 정보에 병합(신규면 새로 생성)
            updateBedPatient: (floorId, roomId, bedId, patch) => {
                set((s) => {
                    const hospital = cloneHospital(s.hospital);
                    const found = findRoom(hospital, floorId, roomId);
                    if (!found) return {};
                    const bed = found.room.beds.find((b) => b.id === bedId);
                    if (!bed) return {};

                    if (patch === null) {
                        bed.patient = null;
                        return { hospital };
                    }

                    bed.patient = bed.patient
                        ? { ...bed.patient, ...patch }
                        : {
                              id: uid("patient"),
                              name: "",
                              age: 0,
                              history: "",
                              currentSymptom: "",
                              fallCount: 0,
                              breathCount: 0,
                              ...patch,
                          };
                    return { hospital };
                });
            },

            // ---- 알람/이벤트 (F7~F10 + 위치상세/정상해제·오탐·센서이상 분류) ----
            triggerAlarm: (floorId, roomId, zoneId, type) => {
                const hospital = get().hospital;
                const found = findRoom(hospital, floorId, roomId);
                if (!found) return;
                const zone = found.room.zones.find((z) => z.id === zoneId);
                if (!zone) return;

                const status = ALARM_TYPE_TO_STATUS[type] || "warning";
                const bed = findBedByZone(found.room, zoneId);

                const entry = {
                    id: uid("alarm"),
                    floorId,
                    floorName: found.floor.name,
                    roomId,
                    roomNo: found.room.roomNo,
                    roomType: found.room.type,
                    zoneId,
                    zoneLabel: zone.label,
                    type,
                    typeLabel: ALARM_TYPE_LABEL[type] || type,
                    time: new Date().toISOString(),
                    patientName: bed?.patient?.name || null,
                    acked: false, // 확인(ACK) 여부 — 처리 완료(해제)와는 별개 개념
                };

                set((s) => {
                    const h = cloneHospital(s.hospital);
                    const f = findRoom(h, floorId, roomId);
                    const z = f.room.zones.find((zz) => zz.id === zoneId);
                    z.status = status;
                    z.alarmType = type;
                    f.room.status.room = worstStatus(f.room.zones);

                    // 낙상/호흡이상은 해당 침상에 배정된 환자의 누적 횟수를 증가시킨다
                    // (화장실 등 공용 존은 특정 환자에게 귀속시킬 수 없으므로 카운트하지 않음)
                    if (type === "fall" || type === "breath") {
                        const zBed = findBedByZone(f.room, zoneId);
                        if (zBed?.patient) {
                            if (type === "fall") zBed.patient.fallCount = (zBed.patient.fallCount || 0) + 1;
                            if (type === "breath") zBed.patient.breathCount = (zBed.patient.breathCount || 0) + 1;
                        }
                    }

                    return {
                        hospital: h,
                        alarms: [entry, ...s.alarms],
                        eventLog: [{ ...entry, action: "occurred", resolution: null }, ...s.eventLog].slice(0, MAX_LOG),
                    };
                });
            },

            // Mock 이벤트 시뮬레이터 (F9) — 병실뿐 아니라 화장실/복도/공용공간/대기실 등
            // 모든 구역(zone)을 대상으로 무작위 발생시킨다 (센서 커버리지 확장 반영)
            // type: 'fall' | 'breath' | 'inactivity' | 'sensor'
            triggerRandomAlarm: (type) => {
                const hospital = get().hospital;
                const candidates = [];
                for (const floor of hospital.floors) {
                    for (const room of floor.rooms) {
                        for (const zone of room.zones) {
                            if (zone.status === "normal") {
                                candidates.push({ floorId: floor.id, roomId: room.id, zoneId: zone.id });
                            }
                        }
                    }
                }
                if (candidates.length === 0) return;
                const pick = candidates[Math.floor(Math.random() * candidates.length)];
                get().triggerAlarm(pick.floorId, pick.roomId, pick.zoneId, type);
            },

            // resolution: 'confirmed'(정상 해제) | 'false_alarm'(오탐) — 2단계로 단순화됨.
            // "센서 이상 확인"은 더 이상 별도의 처리 액션이 아니지만, 오탐은 실제로 레이더
            // 센서 자체의 오작동/오검지일 가능성이 높으므로, 오탐으로 처리될 때마다 해당
            // 구역(zone)의 "누적 오탐(센서 오류 의심) 횟수"를 함께 적립해 둔다. 특정 존에서
            // 이 수치가 유독 높다면 그 센서 장비를 점검해야 한다는 신호로 활용할 수 있다.
            resolveAlarm: (alarmId, resolution = "confirmed") => {
                set((s) => {
                    const alarm = s.alarms.find((a) => a.id === alarmId);
                    if (!alarm) return {};
                    const hospital = cloneHospital(s.hospital);
                    const found = findRoom(hospital, alarm.floorId, alarm.roomId);
                    if (found) {
                        const zone = found.room.zones.find((z) => z.id === alarm.zoneId);
                        if (zone) {
                            zone.status = "normal";
                            zone.alarmType = null;
                            if (resolution === "false_alarm") {
                                zone.sensorErrorCount = (zone.sensorErrorCount || 0) + 1;
                            }
                        }
                        found.room.status.room = worstStatus(found.room.zones);
                    }
                    return {
                        hospital,
                        alarms: s.alarms.filter((a) => a.id !== alarmId),
                        eventLog: [{ ...alarm, action: "resolved", resolution }, ...s.eventLog].slice(0, MAX_LOG),
                    };
                });
            },

            resolveAllForRoom: (floorId, roomId, resolution = "confirmed") => {
                const targets = get().alarms.filter((a) => a.floorId === floorId && a.roomId === roomId);
                targets.forEach((a) => get().resolveAlarm(a.id, resolution));
            },

            // 알람 "확인(ACK)" — 처리 완료(정상해제/오탐/센서이상)와는 별개로,
            // 담당자가 알람을 인지했다는 표시만 남긴다. (알람 관리 요구사항: 실시간 알람 목록 + ACK)
            ackAlarm: (alarmId) => {
                set((s) => ({
                    alarms: s.alarms.map((a) => (a.id === alarmId ? { ...a, acked: true } : a)),
                }));
            },

            // ---- 환자 병실/병상 이동 (환자 관리: 호실 배정) ----
            // 대상 병상이 이미 다른 환자로 차 있으면 이동하지 않는다.
            movePatient: (fromFloorId, fromRoomId, fromBedId, toFloorId, toRoomId, toBedId) => {
                set((s) => {
                    const hospital = cloneHospital(s.hospital);
                    const from = findRoom(hospital, fromFloorId, fromRoomId);
                    const to = findRoom(hospital, toFloorId, toRoomId);
                    if (!from || !to) return {};

                    const fromBed = from.room.beds.find((b) => b.id === fromBedId);
                    const toBed = to.room.beds.find((b) => b.id === toBedId);
                    if (!fromBed || !toBed || !fromBed.patient || toBed.patient) return {};

                    toBed.patient = fromBed.patient;
                    fromBed.patient = null;

                    return { hospital };
                });
            },

            // ---- 사용자 및 권한 관리 (설정: mock CRUD, 실제 인증 연동 전) ----
            addUser: (user) => {
                set((s) => ({
                    users: [...s.users, { id: uid("user"), name: user.name || "", role: user.role || "간호사", email: user.email || "" }],
                }));
            },

            updateUser: (userId, patch) => {
                set((s) => ({
                    users: s.users.map((u) => (u.id === userId ? { ...u, ...patch } : u)),
                }));
            },

            removeUser: (userId) => {
                set((s) => ({ users: s.users.filter((u) => u.id !== userId) }));
            },

            // ---- 알림(소리/팝업) 설정 ----
            updateNotificationSettings: (patch) => {
                set((s) => ({ notificationSettings: { ...s.notificationSettings, ...patch } }));
            },

            // ---- 레이더 센서 연동 설정 (설정 > 데이터) ----
            updateSensorIntegration: (patch) => {
                set((s) => ({ sensorIntegration: { ...s.sensorIntegration, ...patch } }));
            },

            // 구역(zone)을 실제 물리 센서 장비의 고유 ID(시리얼/MAC 등)와 매핑한다.
            // deviceId가 비어 있으면 "미연동", 채워져 있으면 "연동됨"으로 표시된다.
            updateZoneDeviceId: (floorId, roomId, zoneId, deviceId) => {
                set((s) => {
                    const hospital = cloneHospital(s.hospital);
                    const found = findRoom(hospital, floorId, roomId);
                    if (!found) return {};
                    const zone = found.room.zones.find((z) => z.id === zoneId);
                    if (!zone) return {};
                    zone.deviceId = deviceId;
                    return { hospital };
                });
            },

            resetDemoData: () => {
                set({
                    hospital: buildInitialHospital(),
                    selectedFloorId: "3F",
                    connectionStatus: "connected",
                    alarms: [],
                    eventLog: [],
                    users: buildInitialUsers(),
                    notificationSettings: { popup: true, sound: true },
                    sensorIntegration: { protocol: "mqtt", host: "", port: "", apiKey: "", autoReconnect: true },
                });
            },
        }),
        {
            name: "shcd-dashboard-v2",
            partialize: (s) => ({
                hospital: s.hospital,
                selectedFloorId: s.selectedFloorId,
                alarms: s.alarms,
                eventLog: s.eventLog,
                users: s.users,
                notificationSettings: s.notificationSettings,
                sensorIntegration: s.sensorIntegration,
            }),
        },
    ),
);
