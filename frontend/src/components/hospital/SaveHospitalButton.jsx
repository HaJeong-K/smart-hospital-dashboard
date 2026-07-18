import { useState } from "react";
import { Save, CheckCircle2 } from "lucide-react";

import { useDashboardStore } from "../../store/useDashboardStore";

// store는 모든 변경 사항을 즉시 localStorage에 persist하므로(자동 저장),
// 이 버튼은 "지금 시점 스냅샷을 확정 저장했다"는 사용자 피드백을 주는 역할을 한다.
function SaveHospitalButton({ hospital }) {
    const setHospital = useDashboardStore((s) => s.setHospital);
    const [saved, setSaved] = useState(false);

    const save = () => {
        setHospital((prev) => ({ ...prev, updatedAt: new Date().toISOString() }));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div style={{
            marginTop: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
        }}>
            <span style={{ color: "var(--text-secondary)", fontSize: 12.5 }}>
                {hospital.updatedAt
                    ? `마지막 저장: ${new Date(hospital.updatedAt).toLocaleString("ko-KR")}`
                    : "변경 사항은 자동으로 저장됩니다."}
            </span>

            <button
                className="toolbar-btn primary"
                onClick={save}
            >
                {saved ? <CheckCircle2 size={18} /> : <Save size={18} />}
                {saved ? "저장됨" : "저장"}
            </button>
        </div>
    );
}

export default SaveHospitalButton;
