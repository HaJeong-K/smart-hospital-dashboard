import { useEffect, useRef, useState } from "react";
import { Bell, ShieldAlert, HeartPulse, MoonStar, Radar, X } from "lucide-react";

import { useDashboardStore } from "../../store/useDashboardStore";
import { ALARM_TYPE_TO_STATUS } from "../../data/floorsData";

const TYPE_ICON = { fall: ShieldAlert, breath: HeartPulse, inactivity: MoonStar, sensor: Radar };
// 알람 유형 → 토스트 색상(정상/움직임없음/호흡이상/낙상/센서오류 색상 규칙과 동일하게 매핑)
const TYPE_CSS = { danger: "danger", warning: "warning", inactive: "inactive", sensor: "sensor" };
const TOAST_TTL = 6000;

// 외부 오디오 파일 없이 Web Audio API로 "사이렌이 여러 번 우는" 패턴의 알림음을 재생한다.
// 단발 비프음은 멀리 있는 사람이 놓치기 쉬워서, 주파수가 낮은음↔높은음을 오가며
// 3번 반복되는 사이렌 웨일(wail) 패턴으로 바꿔 더 눈에 띄게 만들었다.
// (브라우저가 사용자 상호작용 전 오디오 재생을 막는 경우 등은 조용히 무시)
function playSiren() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth"; // 사이렌 특유의 날카로운 음색
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;
        const cycles = 3; // "웨엥-웨엥-웨엥" 3회 반복
        const cycleLength = 0.55;
        const low = 520;
        const high = 1050;
        const totalDuration = cycles * cycleLength;

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.25, now + 0.05);
        gain.gain.setValueAtTime(0.25, now + totalDuration - 0.12);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + totalDuration);

        for (let i = 0; i < cycles; i++) {
            const t0 = now + i * cycleLength;
            osc.frequency.setValueAtTime(low, t0);
            osc.frequency.linearRampToValueAtTime(high, t0 + cycleLength / 2);
            osc.frequency.linearRampToValueAtTime(low, t0 + cycleLength);
        }

        osc.start(now);
        osc.stop(now + totalDuration + 0.05);
    } catch {
        // 재생 실패는 무시 (알림 자체 동작에는 영향 없음)
    }
}

// 새 알람이 store.alarms에 추가될 때마다 토스트를 띄우고 일정 시간 후 자동으로 사라진다.
// 설정(⚙ 알림) 탭의 "팝업 알림"/"소리 알림" on-off를 그대로 반영한다.
function NotificationToast() {
    const alarms = useDashboardStore((s) => s.alarms);
    const notificationSettings = useDashboardStore((s) => s.notificationSettings);
    const [toasts, setToasts] = useState([]);
    const seenIds = useRef(new Set());
    const isFirstRun = useRef(true);

    useEffect(() => {
        // 최초 마운트 시(새로고침 후 복원된 기존 알람)는 토스트를 띄우지 않는다.
        if (isFirstRun.current) {
            alarms.forEach((a) => seenIds.current.add(a.id));
            isFirstRun.current = false;
            return;
        }

        const fresh = alarms.filter((a) => !seenIds.current.has(a.id));
        if (fresh.length === 0) return;

        fresh.forEach((a) => seenIds.current.add(a.id));

        if (notificationSettings.sound) {
            playSiren();
        }

        if (!notificationSettings.popup) return;

        setToasts((prev) => [...fresh.map((a) => ({ ...a, toastId: `${a.id}-${Date.now()}` })), ...prev]);

        fresh.forEach((a) => {
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== a.id));
            }, TOAST_TTL);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [alarms]);

    const dismiss = (toastId) => setToasts((prev) => prev.filter((t) => t.toastId !== toastId));

    // 팝업 알림 자체를 끈 경우엔 아무것도 표시하지 않는다.
    if (!notificationSettings.popup) return null;

    if (toasts.length === 0) {
        return (
            <div className="notification-toast idle">
                <Bell size={18} />
                <span>새로운 알림이 없습니다.</span>
            </div>
        );
    }

    return (
        <div className="notification-toast-stack">
            {toasts.map((t) => {
                const Icon = TYPE_ICON[t.type] || Bell;
                const statusKey = ALARM_TYPE_TO_STATUS[t.type] || "warning";
                const css = TYPE_CSS[statusKey] || "warning";
                return (
                    <div key={t.toastId} className={`notification-toast ${css}`}>

                        <Icon size={18} />
                        <span>
                            {t.floorName} {t.roomNo}
                            {t.roomType === "patient" ? "호" : ""} {t.zoneLabel} — {t.typeLabel}
                        </span>
                        <button className="toast-close" onClick={() => dismiss(t.toastId)}>
                            <X size={14} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

export default NotificationToast;
