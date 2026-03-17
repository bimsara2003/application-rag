import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
    { to: "/admin/dashboard", icon: "dashboard", label: "Dashboard" },
    { to: "#", icon: "confirmation_number", label: "All Tickets" },
    { to: "/admin/knowledge-base", icon: "menu_book", label: "Knowledge Base" },
    { to: "/admin/users", icon: "group", label: "Users" },
];

export default function AdminSidebar() {
    const { logout } = useAuth();
    const location = useLocation();

    return (
        <aside className="w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
            <div className="p-5 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
                <div className="bg-primary p-1.5 rounded-lg">
                    <span className="material-symbols-outlined text-white text-2xl">school</span>
                </div>
                <div>
                    <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-none">CAMPUS Desk</h1>
                    <p className="text-[10px] text-primary font-semibold uppercase tracking-wider mt-0.5">Admin Panel</p>
                </div>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map(item => {
                    const isActive = location.pathname === item.to;
                    return (
                        <Link key={item.label} to={item.to}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive
                                ? "bg-primary/10 text-primary font-semibold"
                                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                }`}>
                            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-3 border-t border-slate-100 dark:border-slate-800">
                <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 text-sm font-medium transition-colors">
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    Sign out
                </button>
            </div>
        </aside>
    );
}
