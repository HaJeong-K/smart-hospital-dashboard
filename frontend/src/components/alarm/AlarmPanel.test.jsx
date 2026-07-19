import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AlarmPanel from "./AlarmPanel";
import { useDashboardStore } from "../../store/useDashboardStore";

beforeEach(() => {
    useDashboardStore.getState().resetDemoData();
});

describe("AlarmPanel", () => {
    it("활성 알람이 없으면 빈 상태 문구를 보여준다", () => {
        render(<AlarmPanel />);
        expect(screen.getByText("활성 알람이 없습니다.")).toBeInTheDocument();
    });

    it("발생한 알람을 목록에 표시한다", () => {
        useDashboardStore.getState().triggerAlarm("3F", "301", "301__bed1", "fall");

        render(<AlarmPanel />);

        expect(screen.getByText("1")).toBeInTheDocument(); // alarm-count
        expect(screen.getByText(/301호/)).toBeInTheDocument();
        expect(screen.getByText(/낙상감지|낙상 감지/)).toBeInTheDocument();
    });

    it("정상 해제 버튼을 누르면 알람이 목록에서 사라진다", async () => {
        useDashboardStore.getState().triggerAlarm("3F", "301", "301__bed1", "fall");
        const user = userEvent.setup();

        render(<AlarmPanel />);
        await user.click(screen.getByText("정상 해제"));

        expect(useDashboardStore.getState().alarms.length).toBe(0);
        expect(screen.getByText("활성 알람이 없습니다.")).toBeInTheDocument();
    });
});
