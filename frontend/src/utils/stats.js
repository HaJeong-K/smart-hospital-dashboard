import { worstStatus, ALARM_TYPE_TO_STATUS, ROOM_TYPES } from "../data/floorsData";

// hospital.floors 전체를 순회하며 {floor, room} 평탄화 배열로
export function flattenRooms(floors) {
    const out = [];
    for (const floor of floors) {
        for (const room of floor.rooms) {
            out.push({ floor, room });
        }
    }
    return out;
}

// 배정된 환자만 평탄화 — {floorId, floorName, roomId, roomNo, bed, patient}
export function flattenPatients(floors) {
    const out = [];
    for (const floor of floors) {
        for (const room of floor.rooms) {
            if (room.type !== "patient") continue;
            for (const bed of room.beds || []) {
                if (bed.patient) {
                    out.push({
                        floorId: floor.id,
                        floorName: floor.name,
                        roomId: room.id,
                        roomNo: room.roomNo,
                        bed,
                        patient: bed.patient,
                    });
                }
            }
        }
    }
    return out;
}

// 낙상 + 호흡이상 누적 횟수가 높은 환자 순으로 정렬 (고위험 환자 상위 노출)
export function topRiskPatients(floors, limit = 10) {
    return flattenPatients(floors)
        .filter((p) => (p.patient.fallCount || 0) + (p.patient.breathCount || 0) > 0)
        .sort((a, b) => {
            const scoreA = (a.patient.fallCount || 0) * 2 + (a.patient.breathCount || 0);
            const scoreB = (b.patient.fallCount || 0) * 2 + (b.patient.breathCount || 0);
            return scoreB - scoreA;
        })
        .slice(0, limit);
}

export function getFacilityStats(floors) {
    const all = flattenRooms(floors);
    const patientRooms = all.filter(({ room }) => room.type === "patient");
    const counts = { normal: 0, inactive: 0, sensor: 0, warning: 0, danger: 0 };
    let sensorTotal = 0;
    let totalBeds = 0;
    let occupiedBeds = 0;
    for (const { room } of all) {
        const status = worstStatus(room.zones);
        counts[status] += 1;
        sensorTotal += room.sensors?.length || 0;
        if (room.type === "patient") {
            totalBeds += room.beds?.length || 0;
            occupiedBeds += room.beds?.filter((b) => b.patient).length || 0;
        }
    }
    return {
        totalRooms: all.length,
        totalPatientRooms: patientRooms.length,
        totalBeds,
        totalPatients: occupiedBeds,
        counts,
        sensorTotal,
        activeAlarmRoomCount: counts.inactive + counts.sensor + counts.warning + counts.danger,
    };
}

// room/bed id 문자열 기반 결정적(의사난수) 값 — 실제 센서 연동 전까지 화면 표시용 임시 활력징후
function hashSeed(str) {
    let h = 0;
    for (let i = 0; i < String(str).length; i++) {
        h = (h << 5) - h + String(str).charCodeAt(i);
        h |= 0;
    }
    return Math.abs(h);
}

export function mockVitals(bedId, status) {
    const seed = hashSeed(bedId);
    const baseHr = 66 + (seed % 20);
    const baseRr = 14 + (seed % 6);
    const isAlert = status === "warning" || status === "danger";
    return {
        heartRate: isAlert ? baseHr + 26 : baseHr,
        respRate: isAlert ? baseRr + 7 : baseRr,
        activity: status === "inactive" ? "움직임 없음" : isAlert ? "급격한 변화 감지" : seed % 3 === 0 ? "낮음" : "정상",
    };
}

function isSameDay(iso, reference) {
    const d = new Date(iso);
    return (
        d.getFullYear() === reference.getFullYear() &&
        d.getMonth() === reference.getMonth() &&
        d.getDate() === reference.getDate()
    );
}

// "모니터링" 탭 전용 집계 — 대시보드(층별 배치도)와는 별개로, 시스템 전체의
// 관제 지표(평균 호흡수/관제 중 환자 수/센서 연결률/오늘 위험 발생 건수/Critical 이벤트 비율)를 계산한다.
export function getMonitoringStats(floors, eventLog, connectionStatus) {
    let monitoredPatients = 0;
    let respSum = 0;
    let totalZones = 0;
    let sensorErrorZones = 0;

    for (const floor of floors) {
        for (const room of floor.rooms) {
            const zones = room.zones || [];
            totalZones += zones.length;
            sensorErrorZones += zones.filter((z) => z.status === "sensor").length;

            if (room.type !== "patient") continue;
            for (const bed of room.beds || []) {
                if (!bed.patient) continue;
                monitoredPatients += 1;
                const zone = zones.find((z) => z.id === bed.zoneId);
                respSum += mockVitals(bed.id, zone?.status || "normal").respRate;
            }
        }
    }

    const avgRespRate = monitoredPatients > 0 ? respSum / monitoredPatients : 0;

    // 센서 연결률: 서버 연결이 끊기면 전체 센서가 오프라인으로 간주되고,
    // 연결된 상태에서는 "센서 오류(sensor)" 상태인 존을 제외한 비율로 계산한다.
    const sensorConnectionRate =
        totalZones === 0
            ? 0
            : connectionStatus === "connected"
              ? ((totalZones - sensorErrorZones) / totalZones) * 100
              : 0;

    // "오늘 위험 발생 건수"는 오늘 발생한 전체 이벤트(낙상/호흡이상/움직임없음/센서오류) 건수,
    // "Critical 이벤트 수"는 그 중 가장 심각한 등급(낙상=danger)만 별도로 센 부분집합이다.
    const now = new Date();
    const todayOccurred = eventLog.filter((e) => e.action === "occurred" && isSameDay(e.time, now));
    const todayAlertCount = todayOccurred.length;
    const todayCriticalCount = todayOccurred.filter((e) => ALARM_TYPE_TO_STATUS[e.type] === "danger").length;
    const criticalEventRatio = todayAlertCount > 0 ? (todayCriticalCount / todayAlertCount) * 100 : 0;

    return {
        avgRespRate,
        monitoredPatients,
        sensorConnectionRate,
        todayAlertCount,
        todayCriticalCount,
        criticalEventRatio,
    };
}

function bucketKeyAndLabel(date, period) {
    if (period === "week") {
        const d = new Date(date);
        const dow = (d.getDay() + 6) % 7; // 월요일=0
        d.setDate(d.getDate() - dow);
        return {
            key: d.toISOString().slice(0, 10),
            label: `${d.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })}주`,
        };
    }
    if (period === "month") {
        return {
            key: `${date.getFullYear()}-${date.getMonth()}`,
            label: date.toLocaleDateString("ko-KR", { year: "2-digit", month: "short" }),
        };
    }
    return {
        key: date.toISOString().slice(0, 10),
        label: date.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" }),
    };
}

// 일/주/월 단위 위험(알람) 발생 추이 — eventLog의 "occurred" 액션을 기간 버킷으로 집계한다.
export function getEventTrend(eventLog, period = "day", count = 7) {
    const now = new Date();
    const buckets = [];
    for (let i = count - 1; i >= 0; i--) {
        const d = new Date(now);
        if (period === "day") d.setDate(d.getDate() - i);
        else if (period === "week") d.setDate(d.getDate() - i * 7);
        else d.setMonth(d.getMonth() - i);
        buckets.push(bucketKeyAndLabel(d, period));
    }

    const counts = new Map(buckets.map((b) => [b.key, 0]));
    for (const e of eventLog) {
        if (e.action !== "occurred") continue;
        const { key } = bucketKeyAndLabel(new Date(e.time), period);
        if (counts.has(key)) counts.set(key, counts.get(key) + 1);
    }

    return buckets.map((b) => ({ label: b.label, value: counts.get(b.key) || 0 }));
}

// 호실 단위로 이벤트를 묶어 많이 발생한 순으로 정렬하는 공용 집계 로직 —
// getRoomFrequency(전체 유형 합산)과 getRoomFrequencyByType(유형별로 따로) 둘 다 이걸 쓴다.
function aggregateRoomFrequency(events, limit) {
    const map = new Map();
    for (const e of events) {
        const key = `${e.floorId}::${e.roomId}`;
        if (!map.has(key)) {
            map.set(key, {
                key,
                floorName: e.floorName,
                roomNo: e.roomNo,
                roomType: e.roomType,
                count: 0,
            });
        }
        map.get(key).count += 1;
    }
    return [...map.values()].sort((a, b) => b.count - a.count).slice(0, limit);
}

// 호실별 위험 발생 빈도(전체 유형 합산) — eventLog의 "occurred" 이벤트를 호실 단위로 묶어 많이 발생한 순으로 정렬한다.
export function getRoomFrequency(eventLog, limit = 8) {
    return aggregateRoomFrequency(eventLog.filter((e) => e.action === "occurred"), limit);
}

// 특정 이벤트 유형(낙상=fall, 호흡이상=breath 등)만 따로 골라 호실별 발생 빈도를 집계한다.
// "낙상은 유독 어디서 많이 발생하나", "호흡이상은 유독 어디서 많이 발생하나"를
// 따로 확인하기 위함 — getRoomFrequency(전체 합산)만으로는 유형별 원인 파악이 어렵다.
export function getRoomFrequencyByType(eventLog, type, limit = 8) {
    return aggregateRoomFrequency(
        eventLog.filter((e) => e.action === "occurred" && e.type === type),
        limit,
    );
}

// 하루를 4개 시간대(심야 0-6시/오전 6-12시/오후 12-18시/저녁 18-24시)로 나눠 각 시간대에
// 낙상/호흡이상/전체 이벤트가 몇 건 발생했는지 집계한다 — "야간에 특히 낙상이 몰린다" 같은
// 패턴을 하루 중 시각 기준으로 보여준다(일/주/월 추이는 "언제 날짜"인지만 보여줘서 겹치지 않음).
const TIME_SLOTS = [
    { key: "dawn", label: "심야 (0-6시)", from: 0, to: 6 },
    { key: "morning", label: "오전 (6-12시)", from: 6, to: 12 },
    { key: "afternoon", label: "오후 (12-18시)", from: 12, to: 18 },
    { key: "evening", label: "저녁 (18-24시)", from: 18, to: 24 },
];

export function getTimeOfDayStats(eventLog) {
    const buckets = TIME_SLOTS.map((slot) => ({ ...slot, total: 0, fall: 0, breath: 0 }));
    for (const e of eventLog) {
        if (e.action !== "occurred") continue;
        const hour = new Date(e.time).getHours();
        const bucket = buckets.find((b) => hour >= b.from && hour < b.to);
        if (!bucket) continue;
        bucket.total += 1;
        if (e.type === "fall") bucket.fall += 1;
        if (e.type === "breath") bucket.breath += 1;
    }
    return buckets;
}

// 구역 유형(병실/공용화장실/복도/공용공간/처치실/대기실)별 이벤트 발생 건수 —
// "화장실에서 낙상이 압도적으로 많다" 같은 패턴은 개별 호실 순위보다 유형별 집계에서
// 더 잘 드러난다.
export function getZoneTypeStats(eventLog) {
    const counts = new Map();
    for (const e of eventLog) {
        if (e.action !== "occurred") continue;
        const type = e.roomType || "patient";
        counts.set(type, (counts.get(type) || 0) + 1);
    }
    return [...counts.entries()]
        .map(([type, count]) => ({ type, label: ROOM_TYPES[type]?.label || type, count }))
        .sort((a, b) => b.count - a.count);
}

// 평균 호흡수 변화 추이 — 실제 활력징후 시계열 로그가 아직 없으므로(60GHz 레이더 미연결,
// 버추얼 인터페이스 단계), 현재 평균 호흡수를 기준으로 날짜별 시드 기반 참고용 추이를 만든다.
// 실제 센서 이력이 연동되면 이 함수만 실제 시계열 조회로 교체하면 된다.
export function getRespirationTrend(floors, days = 7) {
    const patients = flattenPatients(floors);
    if (patients.length === 0) return [];

    const base = patients.reduce((sum, p) => sum + mockVitals(p.bed.id, "normal").respRate, 0) / patients.length;

    const out = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const seed = hashSeed(d.toISOString().slice(0, 10));
        const wiggle = (seed % 5) - 2; // -2 ~ +2 회/분 사이 흔들림
        out.push({
            label: d.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" }),
            value: Math.round((base + wiggle) * 10) / 10,
        });
    }
    return out;
}

// 오탐(false_alarm) 처리 시 해당 구역(zone)에 누적되는 "센서 오류 의심 횟수"를 집계한다.
// 특정 구역에서 오탐이 반복된다는 것은 그 레이더 센서 장비 자체의 오작동 가능성이 높다는
// 뜻이므로, 알람을 개별적으로 몇 번 "오탐 처리"했는지와는 별개로 구역 단위 누적치를 보여줘
// 유지보수 우선순위를 판단할 수 있게 한다.
export function getSensorErrorStats(floors, limit = 8) {
    let total = 0;
    const rows = [];
    for (const floor of floors) {
        for (const room of floor.rooms) {
            for (const zone of room.zones || []) {
                const count = zone.sensorErrorCount || 0;
                if (count <= 0) continue;
                total += count;
                rows.push({
                    key: zone.id,
                    floorName: floor.name,
                    roomNo: room.roomNo,
                    roomType: room.type,
                    zoneLabel: zone.label,
                    count,
                });
            }
        }
    }
    rows.sort((a, b) => b.count - a.count);
    return { total, rows: rows.slice(0, limit) };
}

export function formatTime(iso) {
    return new Date(iso).toLocaleTimeString("ko-KR", { hour12: false });
}

export function formatDateTime(iso) {
    return new Date(iso).toLocaleString("ko-KR", { hour12: false });
}
