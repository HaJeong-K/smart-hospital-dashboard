import { describe, it, expect, beforeEach } from "vitest";
import { useDashboardStore } from "./useDashboardStore";

// 시드 데이터(3F/301)에 실제로 배정된 환자 1명을 기준으로 결정적(non-random) 테스트를 구성한다.
// (data/floorsData.js: buildSeedRooms("3F") 참고 — "301"은 1인실, 환자 1명 배정됨)

beforeEach(() => {
    useDashboardStore.getState().resetDemoData();
});

describe("triggerRandomAlarm", () => {
    it("활성 알람과 이벤트 로그를 하나씩 추가한다", () => {
        useDashboardStore.getState().triggerRandomAlarm("fall");

        const state = useDashboardStore.getState();
        expect(state.alarms.length).toBe(1);
        expect(state.eventLog.length).toBe(1);
        expect(state.eventLog[0].action).toBe("occurred");
        expect(state.eventLog[0].type).toBe("fall");
        expect(state.alarms[0].acked).toBe(false);
    });
});

describe("triggerAlarm", () => {
    it("낙상 알람 발생 시 해당 병상 환자의 누적 낙상 횟수가 1 증가한다", () => {
        const before = useDashboardStore
            .getState()
            .hospital.floors.find((f) => f.id === "3F")
            .rooms.find((r) => r.id === "301").beds[0].patient.fallCount;

        useDashboardStore.getState().triggerAlarm("3F", "301", "301__bed1", "fall");

        const after = useDashboardStore
            .getState()
            .hospital.floors.find((f) => f.id === "3F")
            .rooms.find((r) => r.id === "301").beds[0].patient.fallCount;

        expect(after).toBe(before + 1);
    });

    it("room.status.room이 발생한 알람의 심각도로 갱신된다", () => {
        useDashboardStore.getState().triggerAlarm("3F", "301", "301__bed1", "fall");

        const room = useDashboardStore
            .getState()
            .hospital.floors.find((f) => f.id === "3F")
            .rooms.find((r) => r.id === "301");

        expect(room.status.room).toBe("danger");
    });
});

describe("ackAlarm", () => {
    it("확인 처리해도 활성 알람 목록에서는 사라지지 않고 acked만 true가 된다", () => {
        useDashboardStore.getState().triggerRandomAlarm("fall");
        const alarmId = useDashboardStore.getState().alarms[0].id;

        useDashboardStore.getState().ackAlarm(alarmId);

        const state = useDashboardStore.getState();
        expect(state.alarms.length).toBe(1);
        expect(state.alarms[0].acked).toBe(true);
    });
});

describe("resolveAlarm", () => {
    it("정상 해제 시 알람 목록에서 제거되고 zone 상태가 normal로 돌아간다", () => {
        useDashboardStore.getState().triggerAlarm("3F", "301", "301__bed1", "fall");
        const alarmId = useDashboardStore.getState().alarms[0].id;

        useDashboardStore.getState().resolveAlarm(alarmId, "confirmed");

        const state = useDashboardStore.getState();
        expect(state.alarms.length).toBe(0);
        expect(state.eventLog[0].action).toBe("resolved");
        expect(state.eventLog[0].resolution).toBe("confirmed");

        const room = state.hospital.floors.find((f) => f.id === "3F").rooms.find((r) => r.id === "301");
        expect(room.status.room).toBe("normal");
    });

    it("오탐 처리 시 해당 zone의 sensorErrorCount가 누적된다", () => {
        useDashboardStore.getState().triggerAlarm("3F", "301", "301__bed1", "fall");
        const alarmId = useDashboardStore.getState().alarms[0].id;

        useDashboardStore.getState().resolveAlarm(alarmId, "false_alarm");

        const room = useDashboardStore
            .getState()
            .hospital.floors.find((f) => f.id === "3F")
            .rooms.find((r) => r.id === "301");
        const zone = room.zones.find((z) => z.id === "301__bed1");

        expect(zone.sensorErrorCount).toBe(1);
        expect(zone.status).toBe("normal");
    });
});

describe("movePatient", () => {
    it("환자를 공석 병상으로 이동시키고 원래 병상은 공석이 된다", () => {
        // 3F/304는 3인실이고 세 번째 침상(304__bed3)이 시드 데이터상 공석이다.
        const store = useDashboardStore.getState();
        const sourceBed = store.hospital.floors.find((f) => f.id === "3F").rooms.find((r) => r.id === "301").beds[0];
        const patientName = sourceBed.patient.name;

        store.movePatient("3F", "301", sourceBed.id, "3F", "304", "304__bed3");

        const state = useDashboardStore.getState();
        const sourceRoom = state.hospital.floors.find((f) => f.id === "3F").rooms.find((r) => r.id === "301");
        const targetRoom = state.hospital.floors.find((f) => f.id === "3F").rooms.find((r) => r.id === "304");

        expect(sourceRoom.beds[0].patient).toBeNull();
        expect(targetRoom.beds[2].patient.name).toBe(patientName);
    });

    it("대상 병상이 이미 차 있으면 이동하지 않는다", () => {
        const store = useDashboardStore.getState();
        // 301(공석 아님) -> 302(이미 환자가 있는 1인실 bed1)로 이동 시도
        store.movePatient("3F", "301", "301__bed1", "3F", "302", "302__bed1");

        const state = useDashboardStore.getState();
        const sourceRoom = state.hospital.floors.find((f) => f.id === "3F").rooms.find((r) => r.id === "301");
        // 이동이 거부되었으므로 원래 환자가 그대로 남아있어야 한다
        expect(sourceRoom.beds[0].patient).not.toBeNull();
    });
});
