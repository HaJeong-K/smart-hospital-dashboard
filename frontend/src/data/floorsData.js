// 병실/구역(zone)/환자 관련 공용 상수 & 헬퍼.
// hospital.config.js(초기 시드 데이터)와 store/컴포넌트가 공통으로 사용한다.
//
// 병실은 1인실일 수도, 다인실(여러 병상)일 수도 있다. 병실(room)은 침상(bed) 배열을 가지며,
// 각 침상은 별도의 센서 존(zone)으로 관리되고 환자(patient)가 배정되거나 공석일 수 있다.
// 화장실은 병실 전체가 공유하는 하나의 존으로 별도 관리한다.
// → "몇 호 몇 번 침상/화장실에서 낙상" 처럼 위치를 정확히 식별할 수 있도록 함.
// 공용공간/화장실/복도/대기실/처치실 등 병실 외 구역도 각각 하나의 zone으로 센서 커버리지를 갖는다.
// (간호사 스테이션은 운영상 불필요하여 구역 종류에서 제외함)
//
// 실제 60GHz mmWave 레이더가 서버로 전송하는 원본 이벤트 페이로드는 대략 아래와 같은 형태를
// 가정한다 (백엔드 연동 시 이 스키마를 alarms 배열로 매핑하면 됨, 프론트는 실제 하드웨어에
// 연결하지 않고 버추얼 인터페이스로 동작):
//   { deviceId, floorId, roomId, zoneId, eventType: 'fall'|'breath_abnormal'|'inactivity'|'sensor_error', confidence, ts }

// 계단/엘리베이터는 여기(방 유형)에 없다 — 방이 아니라 문(door)과 동일하게 순수 구조
// 심볼이라 floor.structures에 별도로 저장되고, Floor Editor 전용 도구로 바로 놓는다
// (utils/structureGeometry.js의 createStructure 참고, 2026-07-22 피드백).
export const ROOM_TYPES = {
    patient: { label: "병실" },
    toilet: { label: "공용화장실" },
    common: { label: "공용공간" },
    treatment: { label: "처치실" },
    corridor: { label: "복도" },
    waiting: { label: "대기실" },
};

// 병실 상태 색상 규칙 (요청 반영)
// 정상 🟢 / 움직임 없음 🔵 / 호흡 이상 🟠 / 낙상 🔴 / 센서 오류 ⚫
// priority가 높을수록 더 위급하게 취급되어 방/카드의 대표 상태로 노출된다.
export const STATUS_META = {
    normal: { label: "정상", emoji: "🟢", color: "var(--room-normal)", priority: 0 },
    inactive: { label: "움직임 없음", emoji: "🔵", color: "var(--room-inactive)", priority: 1 },
    sensor: { label: "센서 오류", emoji: "⚫", color: "var(--room-sensor)", priority: 2 },
    warning: { label: "호흡 이상", emoji: "🟠", color: "var(--room-warning)", priority: 3 },
    danger: { label: "낙상", emoji: "🔴", color: "var(--room-danger)", priority: 4 },
};

// 알람 종류 → 해당 종류가 발생했을 때 존(zone)에 적용할 상태 키
export const ALARM_TYPE_TO_STATUS = {
    fall: "danger",
    breath: "warning",
    inactivity: "inactive",
    sensor: "sensor",
};

export const ALARM_TYPE_LABEL = {
    fall: "낙상 감지",
    breath: "호흡 이상",
    inactivity: "움직임 없음",
    sensor: "센서 오류",
};

// 상황 해제 시 분류 — 실제 상황이었는지, 오탐이었는지 이력에 남긴다.
// ("센서 이상 확인"은 별도 처리 액션에서 제외됨 — 오탐 처리 시 해당 구역에 누적되는
// sensorErrorCount로 대체되었다. utils/stats.js의 getSensorErrorStats 참고.)
export const RESOLUTION_LABEL = {
    confirmed: "정상 해제",
    false_alarm: "오탐(거짓 알람)",
};

export function worstStatus(zones) {
    let worst = "normal";
    for (const zone of zones || []) {
        if ((STATUS_META[zone.status]?.priority ?? 0) > STATUS_META[worst].priority) worst = zone.status;
    }
    return worst;
}

let patientSeq = 0;
function makePatient(data) {
    patientSeq += 1;
    return {
        id: `patient-${patientSeq}`,
        name: data.name || "",
        age: data.age || 0,
        history: data.history || "", // 과거 병력
        currentSymptom: data.currentSymptom || "", // 현재 증상
        fallCount: data.fallCount || 0, // 누적 낙상 횟수
        breathCount: data.breathCount || 0, // 누적 호흡이상 횟수
    };
}

function makeBeds(roomId, patientsData = []) {
    return patientsData.map((data, index) => {
        const bedId = `${roomId}__bed${index + 1}`;
        return {
            id: bedId,
            label: `${index + 1}번 침대`,
            zoneId: bedId,
            patient: data ? makePatient(data) : null,
        };
    });
}

function autoSensors(zones) {
    return zones.map((zone) => ({ id: `${zone.id}__snr`, type: "MMWAVE" }));
}

// 다인실을 포함한 병실(patient) 생성. patientsData 배열 길이 = 병상 수 (null이면 공석)
function patientRoom(id, roomNo, polygon, patientsData) {
    const beds = makeBeds(id, patientsData);
    const zones = [
        ...beds.map((bed) => ({ id: bed.zoneId, label: bed.label, status: "normal", alarmType: null })),
        { id: `${id}__bath`, label: "화장실", status: "normal", alarmType: null },
    ];
    return {
        id,
        roomNo,
        type: "patient",
        polygon,
        beds,
        zones,
        sensors: autoSensors(zones),
        status: { room: "normal" },
    };
}

// 병실 외 공용 구역(화장실/복도/공용공간/대기실/처치실) 생성 — 단일 존
function sharedRoom(id, roomNo, type, polygon) {
    const zones = [{ id: `${id}__area`, label: ROOM_TYPES[type]?.label || "구역", status: "normal", alarmType: null }];
    return {
        id,
        roomNo,
        type,
        polygon,
        beds: [],
        zones,
        sensors: autoSensors(zones),
        status: { room: "normal" },
    };
}

// 신규 병실을 캔버스에서 그렸을 때 사용하는 기본 1인실 팩토리 (EditorCanvas에서 사용)
export function createDrawnPatientRoom(id, roomNo, polygon) {
    return patientRoom(id, roomNo, polygon, [null]);
}

// 층 편집기(Room Property)에서 방 유형/병상 수를 바꿀 때 zones/sensors를 재계산한다.
// 기존 침상의 환자 배정은 최대한 유지한다.
export function rebuildRoomStructure(room) {
    if (room.type === "patient") {
        const beds = room.beds && room.beds.length ? room.beds : [{ id: `${room.id}__bed1`, label: "1번 침대", zoneId: `${room.id}__bed1`, patient: null }];
        const zones = [
            ...beds.map((bed) => ({ id: bed.zoneId, label: bed.label, status: "normal", alarmType: null })),
            { id: `${room.id}__bath`, label: "화장실", status: "normal", alarmType: null },
        ];
        return { ...room, beds, zones, sensors: autoSensors(zones), status: { room: "normal" } };
    }
    const zones = [{ id: `${room.id}__area`, label: ROOM_TYPES[room.type]?.label || "구역", status: "normal", alarmType: null }];
    return { ...room, beds: [], zones, sensors: autoSensors(zones), status: { room: "normal" } };
}

// 병상 수 조절 (1개 미만으로는 줄일 수 없음). 기존 침상 순서/환자 배정은 유지된다.
export function setBedCount(room, count) {
    if (room.type !== "patient") return room;
    const target = Math.max(1, count);
    const current = room.beds || [];
    let beds;
    if (target > current.length) {
        beds = [...current];
        for (let i = current.length; i < target; i++) {
            const bedId = `${room.id}__bed${i + 1}`;
            beds.push({ id: bedId, label: `${i + 1}번 침대`, zoneId: bedId, patient: null });
        }
    } else {
        beds = current.slice(0, target);
    }
    return rebuildRoomStructure({ ...room, beds });
}

// 초기(시드) 층별 병실/구역 데이터 — 1인실과 다인실이 섞여 있고,
// 정렬/색상 규칙 데모를 위해 환자별 누적 낙상/호흡이상 횟수를 미리 채워둔다.
export function buildSeedRooms(floorId) {
    if (floorId === "1F") {
        return [
            sharedRoom("lobby-1f", "로비", "common", [[0.03, 0.06], [0.28, 0.06], [0.28, 0.22], [0.03, 0.22]]),
            sharedRoom("waiting-1f", "대기실", "waiting", [[0.30, 0.06], [0.48, 0.06], [0.48, 0.22], [0.30, 0.22]]),
            sharedRoom("101", "101", "treatment", [[0.50, 0.06], [0.68, 0.06], [0.68, 0.22], [0.50, 0.22]]),
            sharedRoom("102", "102", "treatment", [[0.70, 0.06], [0.88, 0.06], [0.88, 0.22], [0.70, 0.22]]),
            sharedRoom("toilet-1f", "공용화장실", "toilet", [[0.03, 0.28], [0.20, 0.28], [0.20, 0.40], [0.03, 0.40]]),
            sharedRoom("corridor-1f", "복도", "corridor", [[0.22, 0.28], [0.88, 0.28], [0.88, 0.36], [0.22, 0.36]]),
        ];
    }
    if (floorId === "2F") {
        return [
            patientRoom("201", "201", [[0.04, 0.06], [0.18, 0.06], [0.18, 0.20], [0.04, 0.20]], [
                { name: "이순자", age: 85, history: "고혈압, 경도 인지저하", currentSymptom: "장시간 미활동 관찰 필요", fallCount: 3, breathCount: 0 },
            ]),
            patientRoom("202", "202", [[0.20, 0.06], [0.34, 0.06], [0.34, 0.20], [0.20, 0.20]], [null]),
            patientRoom("203", "203", [[0.36, 0.06], [0.50, 0.06], [0.50, 0.20], [0.36, 0.20]], [null]),
            patientRoom("204", "204", [[0.52, 0.06], [0.66, 0.06], [0.66, 0.20], [0.52, 0.20]], [null]),
            // 4인실 데모
            patientRoom("205", "205", [[0.04, 0.24], [0.22, 0.24], [0.22, 0.44], [0.04, 0.44]], [
                { name: "조병철", age: 82, history: "당뇨", currentSymptom: "특이사항 없음", fallCount: 0, breathCount: 0 },
                null,
                { name: "신금례", age: 88, history: "만성폐쇄성폐질환(COPD)", currentSymptom: "산소포화도 저하 관찰중", fallCount: 0, breathCount: 2 },
                null,
            ]),
            patientRoom("206", "206", [[0.24, 0.24], [0.38, 0.24], [0.38, 0.38], [0.24, 0.38]], [null]),
            sharedRoom("common-2f", "공용공간", "common", [[0.40, 0.24], [0.58, 0.24], [0.58, 0.38], [0.40, 0.38]]),
            sharedRoom("toilet-2f", "공용화장실", "toilet", [[0.60, 0.24], [0.73, 0.24], [0.73, 0.38], [0.60, 0.38]]),
        ];
    }
    if (floorId === "3F") {
        return [
            patientRoom("301", "301", [[0.05, 0.06], [0.18, 0.06], [0.18, 0.18], [0.05, 0.18]], [
                { name: "김말순", age: 78, history: "고혈압, 경증 인지저하", currentSymptom: "야간 배회 주의 관찰", fallCount: 1, breathCount: 0 },
            ]),
            patientRoom("302", "302", [[0.20, 0.06], [0.33, 0.06], [0.33, 0.18], [0.20, 0.18]], [
                { name: "이정자", age: 80, history: "고혈압", currentSymptom: "특이사항 없음", fallCount: 0, breathCount: 0 },
            ]),
            patientRoom("303", "303", [[0.35, 0.06], [0.48, 0.06], [0.48, 0.18], [0.35, 0.18]], [
                { name: "박옥희", age: 84, history: "낙상 이력 다수, 보행 보조 필요", currentSymptom: "우측 고관절 통증 호소", fallCount: 6, breathCount: 2 },
            ]),
            // 3인실 데모
            patientRoom("304", "304", [[0.50, 0.06], [0.66, 0.06], [0.66, 0.20], [0.50, 0.20]], [
                { name: "최영수", age: 73, history: "만성 호흡기 질환", currentSymptom: "산소포화도 저하 관찰중", fallCount: 0, breathCount: 3 },
                { name: "정순옥", age: 76, history: "당뇨, 고지혈증", currentSymptom: "특이사항 없음", fallCount: 2, breathCount: 1 },
                null,
            ]),
            sharedRoom("toilet-3f", "공용화장실", "toilet", [[0.05, 0.24], [0.20, 0.24], [0.20, 0.36], [0.05, 0.36]]),
            sharedRoom("corridor-3f", "복도", "corridor", [[0.22, 0.24], [0.66, 0.24], [0.66, 0.32], [0.22, 0.32]]),
            // 8인실 다인실 병동 데모
            patientRoom("310", "310", [[0.68, 0.06], [0.94, 0.06], [0.94, 0.44], [0.68, 0.44]], [
                { name: "조성민", age: 79, history: "무릎 관절염", currentSymptom: "보행 시 통증", fallCount: 1, breathCount: 0 },
                { name: "오경숙", age: 84, history: "고혈압", currentSymptom: "특이사항 없음", fallCount: 0, breathCount: 0 },
                { name: "강태호", age: 75, history: "당뇨", currentSymptom: "특이사항 없음", fallCount: 0, breathCount: 0 },
                { name: "유말자", age: 81, history: "만성 기관지염", currentSymptom: "가래 증가", fallCount: 0, breathCount: 4 },
                { name: "한상철", age: 80, history: "고지혈증", currentSymptom: "특이사항 없음", fallCount: 0, breathCount: 0 },
                { name: "임귀동", age: 76, history: "경증 인지저하", currentSymptom: "야간 배회 주의", fallCount: 2, breathCount: 0 },
                null,
                null,
            ]),
        ];
    }
    return [];
}
