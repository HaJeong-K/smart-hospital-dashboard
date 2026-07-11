import {
    LayoutDashboard,
    Activity,
    BedDouble,
    Users,
    TriangleAlert,
    ChartColumn,
    Settings,
} from "lucide-react";

const menus = [
    {
        title: "대시보드",
        icon: LayoutDashboard,
        active: true,
    },
    {
        title: "모니터링",
        icon: Activity,
    },
    {
        title: "호실별 관리",
        icon: BedDouble,
    },
    {
        title: "환자 관리",
        icon: Users,
    },
    {
        title: "알람",
        icon: TriangleAlert,
    },
    {
        title: "통계",
        icon: ChartColumn,
    },
    {
        title: "설정",
        icon: Settings,
    },
];

function Sidebar() {
    return (
        <aside className="sidebar">

            <nav className="sidebar-menu">

                {menus.map((menu) => {

                    const Icon = menu.icon;

                    return (
                        <button
                            key={menu.title}
                            className={`sidebar-item ${
                                menu.active ? "active" : ""
                            }`}
                        >

                            <Icon size={20} />

                            <span>{menu.title}</span>

                        </button>
                    );
                })}

            </nav>

        </aside>
    );
}

export default Sidebar;