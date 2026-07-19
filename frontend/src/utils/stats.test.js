import { describe, it, expect } from "vitest";
import { getFacilityStats, topRiskPatients } from "./stats";

describe("getFacilityStats", () => {
    it("층이 없으면 모든 수치가 0이다", () => {
        const stats = getFacilityStats([]);
        expect(stats.totalRooms).toBe(0);
        expect(stats.totalPatientRooms).toBe(0);
        expect(stats.sensorTotal).toBe(0);
        expect(stats.counts.danger).toBe(0);
    });

    it("room의 여러 zone 중 가장 심각한 상태(worstStatus)로 room을 집계한다", () => {
        const floors = [
            {
                id: "1F",
                rooms: [
                    {
                        type: "patient",
                        beds: [{ patient: { name: "홍길동" } }],
                        sensors: [{ id: "s1" }, { id: "s2" }],
                        zones: [{ status: "normal" }, { status: "danger" }],
                    },
                ],
            },
        ];

        const stats = getFacilityStats(floors);

        expect(stats.totalRooms).toBe(1);
        expect(stats.totalPatientRooms).toBe(1);
        expect(stats.totalBeds).toBe(1);
        expect(stats.totalPatients).toBe(1);
        expect(stats.sensorTotal).toBe(2);
        expect(stats.counts.danger).toBe(1);
        expect(stats.counts.normal).toBe(0);
    });

    it("공용 구역(patient 아님)은 병실/병상 카운트에 들어가지 않는다", () => {
        const floors = [
            {
                id: "1F",
                rooms: [
                    {
                        type: "corridor",
                        beds: [],
                        sensors: [{ id: "s1" }],
                        zones: [{ status: "normal" }],
                    },
                ],
            },
        ];

        const stats = getFacilityStats(floors);

        expect(stats.totalRooms).toBe(1);
        expect(stats.totalPatientRooms).toBe(0);
        expect(stats.totalBeds).toBe(0);
        expect(stats.counts.normal).toBe(1);
    });
});

describe("topRiskPatients", () => {
    const floors = [
        {
            id: "3F",
            name: "3F",
            rooms: [
                {
                    id: "301",
                    roomNo: "301",
                    type: "patient",
                    beds: [
                        { id: "301__bed1", patient: { name: "낙상환자", fallCount: 1, breathCount: 0 } },
                    ],
                },
                {
                    id: "302",
                    roomNo: "302",
                    type: "patient",
                    beds: [
                        { id: "302__bed1", patient: { name: "호흡이상환자", fallCount: 0, breathCount: 5 } },
                        { id: "302__bed2", patient: null },
                    ],
                },
                {
                    id: "303",
                    roomNo: "303",
                    type: "patient",
                    beds: [
                        { id: "303__bed1", patient: { name: "정상환자", fallCount: 0, breathCount: 0 } },
                    ],
                },
            ],
        },
    ];

    it("점수(낙상*2 + 호흡이상)가 높은 환자 순으로 정렬한다", () => {
        // 낙상환자 점수 = 1*2 + 0 = 2, 호흡이상환자 점수 = 0*2 + 5 = 5
        const result = topRiskPatients(floors, 5);

        expect(result.map((p) => p.patient.name)).toEqual(["호흡이상환자", "낙상환자"]);
    });

    it("누적 낙상/호흡이상이 0인 환자와 공석은 제외한다", () => {
        const result = topRiskPatients(floors, 5);

        expect(result.some((p) => p.patient.name === "정상환자")).toBe(false);
        expect(result.length).toBe(2);
    });

    it("limit만큼만 반환한다", () => {
        const result = topRiskPatients(floors, 1);
        expect(result.length).toBe(1);
        expect(result[0].patient.name).toBe("호흡이상환자");
    });
});
