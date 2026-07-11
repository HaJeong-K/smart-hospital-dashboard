import { Bell } from "lucide-react";

function NotificationToast() {
    return (
        <div className="notification-toast">
            <Bell size={18} />
            <span>새로운 알림이 없습니다.</span>
        </div>
    );
}

export default NotificationToast;