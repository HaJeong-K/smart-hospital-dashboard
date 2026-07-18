import { useEffect, useState } from "react";
import {
    Wifi,
    WifiOff,
    PlayCircle,
    StopCircle,
    SlidersHorizontal,
    Building2,
    Users as UsersIcon,
    Bell,
    Database,
    UserPlus,
    Trash2,
    Volume2,
    VolumeX,
    Radar,
    PlugZap,
    CheckCircle2,
} from "lucide-react";

import useTheme from "../hooks/useTheme";
import { useDashboardStore } from "../store/useDashboardStore";

import HospitalInfoCard from "../components/hospital/HospitalInfoCard";
import LogoUploader from "../components/hospital/LogoUploader";
import FloorManager from "../components/hospital/FloorManager";
import BuildingManager from "../components/hospital/BuildingManager";
import SaveHospitalButton from "../components/hospital/SaveHospitalButton";

function ToggleRow({ label, desc, on, onToggle }) {
    return (
        <div className="toggle-row">
            <div>
                <div className="toggle-row__label">{label}</div>
                {desc && <div className="toggle-row__desc">{desc}</div>}
            </div>
            <button className={`switch ${on ? "on" : ""}`} onClick={onToggle}>
                <span className="switch__knob" />
            </button>
        </div>
    );
}

const TABS = [
    { key: "general", label: "일반", icon: SlidersHorizontal },
    { key: "hospital", label: "병원 · 층/병동 관리", icon: Building2 },
    { key: "users", label: "사용자 및 권한", icon: UsersIcon },
    { key: "notifications", label: "알림", icon: Bell },
    { key: "data", label: "데이터", icon: Database },
];

const ROLE_OPTIONS = ["관리자", "수간호사", "간호사", "요양보호사"];

// 설정 화면 — 테마/연동 시뮬레이션, 병원·층/병동 관리(구 Hospital Manager 통합),
// 사용자 및 권한 관리, 알림(소리/팝업) 설정, 레이더 센서 서버 연동을 탭으로 묶어 관리한다.
// 예전에는 병원/층 관리 화면("/hospital")이 사이드바 어디에도 연결되지 않아 접근할 수
// 없었는데, 최종 기능 정리안에서 "병원 정보 관리"·"층 및 병동 설정"이 설정의 핵심 기능으로
// 명시되어 있어 이 화면 안으로 통합했다.
// "데이터" 탭은 예전에 데모 데이터 초기화 버튼만 있었는데, 실제 병원 납품 시에는 필요
// 없는 기능이라 제거하고 실제 레이더 센서 게이트웨이와 연동하기 위한 서버 설정 +
// 구역별 기기 ID 매핑 화면으로 교체했다 (2026-07-18 피드백, T57).
function SettingsPage() {
    const { theme, toggleTheme } = useTheme();
    const connectionStatus = useDashboardStore((s) => s.connectionStatus);
    const toggleConnection = useDashboardStore((s) => s.toggleConnection);
    const triggerRandomAlarm = useDashboardStore((s) => s.triggerRandomAlarm);
    const hospitalName = useDashboardStore((s) => s.hospital.name);
    const hospital = useDashboardStore((s) => s.hospital);
    const setHospital = useDashboardStore((s) => s.setHospital);
    const floors = useDashboardStore((s) => s.hospital.floors);

    const sensorIntegration = useDashboardStore((s) => s.sensorIntegration);
    const updateSensorIntegration = useDashboardStore((s) => s.updateSensorIntegration);
    const updateZoneDeviceId = useDashboardStore((s) => s.updateZoneDeviceId);

    const users = useDashboardStore((s) => s.users);
    const addUser = useDashboardStore((s) => s.addUser);
    const updateUser = useDashboardStore((s) => s.updateUser);
    const removeUser = useDashboardStore((s) => s.removeUser);

    const notificationSettings = useDashboardStore((s) => s.notificationSettings);
    const updateNotificationSettings = useDashboardStore((s) => s.updateNotificationSettings);

    const [tab, setTab] = useState("general");
    const [autoSim, setAutoSim] = useState(false);
    const [newUser, setNewUser] = useState({ name: "", role: "간호사", email: "" });
    const [testStatus, setTestStatus] = useState(null); // null | "testing" | "success" | "fail"

    // 실제 하드웨어 없이도 시스템이 살아있는 것처럼 보이도록 주기적으로 임의 이벤트를 발생시킨다.
    // (60GHz 레이더 센서를 실제로 연결하지 않고 버추얼 인터페이스로 동작 — 2026-07-17 피드백)
    useEffect(() => {
        if (!autoSim) return;
        const types = ["fall", "breath", "inactivity", "sensor"];
        const timer = setInterval(() => {
            triggerRandomAlarm(types[Math.floor(Math.random() * types.length)]);
        }, 20000);
        return () => clearInterval(timer);
    }, [autoSim, triggerRandomAlarm]);

    // 아직 실제 레이더 서버에 연결하지는 않으므로(버추얼 인터페이스 단계), 입력값이
    // 채워져 있는지만 확인하는 수준의 연결 테스트다. 실제 하드웨어 연동 시 이 함수를
    // 실제 핸드셰이크 요청으로 교체하면 된다.
    const handleTestConnection = () => {
        setTestStatus("testing");
        setTimeout(() => {
            const filled = sensorIntegration.host.trim() && sensorIntegration.port.trim();
            setTestStatus(filled ? "success" : "fail");
        }, 700);
    };

    const handleAddUser = () => {
        if (!newUser.name.trim()) return;
        addUser(newUser);
        setNewUser({ name: "", role: "간호사", email: "" });
    };

    return (
        <div className="page-wrap">
            <div className="page-title">
                <div>
                    <h1>설정</h1>
                    <p>{hospitalName} · 시스템 및 운영 환경설정</p>
                </div>
            </div>

            <div className="chip-group settings-tabs">
                {TABS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        className={`chip ${tab === key ? "active" : ""}`}
                        onClick={() => setTab(key)}
                    >
                        <Icon size={14} /> {label}
                    </button>
                ))}
            </div>

            {tab === "general" && (
                <>
                    <div className="panel-section">
                        <h3>화면</h3>
                        <ToggleRow
                            label={theme === "dark" ? "다크 모드" : "라이트 모드"}
                            desc="야간 관제 환경에서는 다크 모드, 주간/일반 사무 환경에서는 라이트 모드를 권장합니다."
                            on={theme === "dark"}
                            onToggle={toggleTheme}
                        />
                    </div>

                    <div className="panel-section">
                        <h3>연동 / 시뮬레이션</h3>
                        <div className="toggle-row">
                            <div>
                                <div className="toggle-row__label">
                                    {connectionStatus === "connected" ? <Wifi size={15} /> : <WifiOff size={15} />}
                                    {" "}서버 연결 상태
                                </div>
                                <div className="toggle-row__desc">
                                    실제 백엔드(FastAPI) 연동 전까지 연결 상태를 수동으로 시뮬레이션합니다.
                                </div>
                            </div>
                            <button className={`switch ${connectionStatus === "connected" ? "on" : ""}`} onClick={toggleConnection}>
                                <span className="switch__knob" />
                            </button>
                        </div>

                        <div className="toggle-row">
                            <div>
                                <div className="toggle-row__label">
                                    {autoSim ? <PlayCircle size={15} /> : <StopCircle size={15} />}
                                    {" "}자동 이벤트 시뮬레이션
                                </div>
                                <div className="toggle-row__desc">
                                    20초마다 무작위 구역에 낙상/호흡이상/움직임없음/센서오류 이벤트를 발생시켜 관제 화면을 테스트합니다.
                                </div>
                            </div>
                            <button className={`switch ${autoSim ? "on" : ""}`} onClick={() => setAutoSim((v) => !v)}>
                                <span className="switch__knob" />
                            </button>
                        </div>
                    </div>
                </>
            )}

            {tab === "hospital" && (
                <>
                    <div className="hospital-grid">
                        <HospitalInfoCard hospital={hospital} setHospital={setHospital} />
                        <LogoUploader hospital={hospital} setHospital={setHospital} />
                    </div>

                    <FloorManager hospital={hospital} setHospital={setHospital} />
                    <BuildingManager hospital={hospital} setHospital={setHospital} />
                    <SaveHospitalButton hospital={hospital} />
                </>
            )}

            {tab === "users" && (
                <div className="panel-section">
                    <h3>사용자 및 권한 관리</h3>
                    <p className="settings-tab-desc">
                        실제 로그인/인증 연동 전까지는 담당자 목록과 역할(권한)만 기록하는 용도로 사용합니다.
                    </p>

                    <div className="user-add-row">
                        <input
                            placeholder="이름"
                            value={newUser.name}
                            onChange={(e) => setNewUser((u) => ({ ...u, name: e.target.value }))}
                        />
                        <select
                            value={newUser.role}
                            onChange={(e) => setNewUser((u) => ({ ...u, role: e.target.value }))}
                        >
                            {ROLE_OPTIONS.map((role) => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                        <input
                            placeholder="이메일 (선택)"
                            value={newUser.email}
                            onChange={(e) => setNewUser((u) => ({ ...u, email: e.target.value }))}
                        />
                        <button className="toolbar-btn primary" onClick={handleAddUser}>
                            <UserPlus size={14} /> 추가
                        </button>
                    </div>

                    <div className="user-list">
                        {users.length === 0 && <div className="room-empty">등록된 사용자가 없습니다.</div>}
                        {users.map((u) => (
                            <div className="user-row" key={u.id}>
                                <input
                                    className="user-row__name"
                                    value={u.name}
                                    onChange={(e) => updateUser(u.id, { name: e.target.value })}
                                />
                                <select
                                    value={u.role}
                                    onChange={(e) => updateUser(u.id, { role: e.target.value })}
                                >
                                    {ROLE_OPTIONS.map((role) => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                                <span className="user-row__email">{u.email || "-"}</span>
                                <button className="icon-button-sm" onClick={() => removeUser(u.id)} title="삭제">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {tab === "notifications" && (
                <div className="panel-section">
                    <h3>알림 설정</h3>
                    <ToggleRow
                        label={<><Bell size={15} /> 팝업 알림</>}
                        desc="새 알람 발생 시 화면 우측 하단에 토스트 팝업을 표시합니다."
                        on={notificationSettings.popup}
                        onToggle={() => updateNotificationSettings({ popup: !notificationSettings.popup })}
                    />
                    <ToggleRow
                        label={notificationSettings.sound ? <><Volume2 size={15} /> 소리 알림</> : <><VolumeX size={15} /> 소리 알림</>}
                        desc="새 알람 발생 시 알림음을 재생합니다."
                        on={notificationSettings.sound}
                        onToggle={() => updateNotificationSettings({ sound: !notificationSettings.sound })}
                    />
                    <div className="patient-actions" style={{ marginTop: 6 }}>
                        <button className="toolbar-btn" onClick={() => triggerRandomAlarm("fall")}>
                            테스트 알림 보내기
                        </button>
                    </div>
                </div>
            )}

            {tab === "data" && (
                <>
                    <div className="panel-section">
                        <h3><Radar size={16} /> 레이더 센서 서버 연동</h3>
                        <p className="settings-tab-desc">
                            실제 60GHz mmWave 레이더 센서 게이트웨이 서버 정보를 입력해두면, 장비 설치 후
                            바로 실시간 데이터 수신으로 전환할 수 있습니다.
                        </p>

                        <div className="sensor-integration-form">
                            <label>
                                <span>통신 방식</span>
                                <select
                                    value={sensorIntegration.protocol}
                                    onChange={(e) => updateSensorIntegration({ protocol: e.target.value })}
                                >
                                    <option value="mqtt">MQTT</option>
                                    <option value="websocket">WebSocket</option>
                                    <option value="rest">REST (폴링)</option>
                                </select>
                            </label>

                            <label>
                                <span>서버 주소</span>
                                <input
                                    placeholder="예: radar-gateway.hospital.local"
                                    value={sensorIntegration.host}
                                    onChange={(e) => updateSensorIntegration({ host: e.target.value })}
                                />
                            </label>

                            <label>
                                <span>포트</span>
                                <input
                                    placeholder="예: 8883"
                                    value={sensorIntegration.port}
                                    onChange={(e) => updateSensorIntegration({ port: e.target.value })}
                                />
                            </label>

                            <label>
                                <span>API 키 / 토큰</span>
                                <input
                                    placeholder="게이트웨이 인증 키 (선택)"
                                    value={sensorIntegration.apiKey}
                                    onChange={(e) => updateSensorIntegration({ apiKey: e.target.value })}
                                />
                            </label>
                        </div>

                        <ToggleRow
                            label="연결 끊김 시 자동 재연결"
                            desc="네트워크가 일시적으로 끊겼다가 복구되면 자동으로 재연결을 시도합니다."
                            on={sensorIntegration.autoReconnect}
                            onToggle={() => updateSensorIntegration({ autoReconnect: !sensorIntegration.autoReconnect })}
                        />

                        <div className="patient-actions" style={{ marginTop: 6, alignItems: "center" }}>
                            <button className="toolbar-btn primary" onClick={handleTestConnection} disabled={testStatus === "testing"}>
                                <PlugZap size={14} /> {testStatus === "testing" ? "연결 확인 중..." : "연결 테스트"}
                            </button>
                            {testStatus === "success" && (
                                <span className="badge-tag success"><CheckCircle2 size={12} /> 설정값 확인됨</span>
                            )}
                            {testStatus === "fail" && (
                                <span className="badge-tag danger"><WifiOff size={12} /> 서버 주소/포트를 입력하세요</span>
                            )}
                        </div>
                    </div>

                    <div className="panel-section">
                        <h3>구역별 센서 기기 매핑</h3>
                        <p className="settings-tab-desc">
                            각 구역(병상/화장실/공용공간 등)을 실제 센서 장비의 고유 ID(시리얼 번호 등)와
                            연결합니다. 기기 ID를 입력하면 "연동됨"으로 표시됩니다.
                        </p>

                        <div className="table-wrap">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>위치</th>
                                        <th>구역</th>
                                        <th>기기 ID</th>
                                        <th>상태</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {floors.flatMap((floor) =>
                                        floor.rooms.flatMap((room) =>
                                            (room.zones || []).map((zone) => (
                                                <tr key={zone.id}>
                                                    <td>{floor.name} {room.roomNo}{room.type === "patient" ? "호" : ""}</td>
                                                    <td>{zone.label}</td>
                                                    <td>
                                                        <input
                                                            className="device-id-input"
                                                            placeholder="예: RS-2400-001"
                                                            value={zone.deviceId || ""}
                                                            onChange={(e) => updateZoneDeviceId(floor.id, room.id, zone.id, e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        {zone.deviceId ? (
                                                            <span className="badge-tag success">연동됨</span>
                                                        ) : (
                                                            <span className="badge-tag neutral">미연동</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            )),
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default SettingsPage;
