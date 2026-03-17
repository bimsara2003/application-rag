import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ticketApi, notificationApi } from "../../services/api";
import AdminSidebar from "../../components/AdminSidebar";

const statusColors = {
    open: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
    in_progress: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
    resolved: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
    closed: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    escalated: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30",
};

const priorityColors = {
    low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    medium: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    high: "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
    urgent: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

const dotColor = {
    open: "bg-blue-500", in_progress: "bg-amber-500", resolved: "bg-emerald-500",
    closed: "bg-slate-400", escalated: "bg-rose-500",
};

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    // Notification state
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifLoading, setNotifLoading] = useState(false);
    const notifRef = useRef(null);

    useEffect(() => {
        ticketApi.list()
            .then(setTickets)
            .catch(err => console.error("Failed to load tickets:", err))
            .finally(() => setLoading(false));
    }, []);

    // Poll unread count
    useEffect(() => {
        const fetchCount = () => {
            notificationApi.unreadCount()
                .then(data => setUnreadCount(data.count || 0))
                .catch(() => { });
        };
        fetchCount();
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }, []);

    // Outside click to close dropdown
    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleBellClick = async () => {
        const next = !notifOpen;
        setNotifOpen(next);
        if (next) {
            setNotifLoading(true);
            try { setNotifications(await notificationApi.list()); } catch { }
            finally { setNotifLoading(false); }
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationApi.markAllRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch { }
    };

    const handleNotifClick = async (notif) => {
        if (!notif.is_read) {
            try {
                await notificationApi.markRead(notif.id);
                setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch { }
        }
        if (notif.reference_type === "ticket" && notif.reference_id) {
            navigate(`/admin/ticket/${notif.reference_id}`);
        }
        setNotifOpen(false);
    };

    const getNotifIcon = (type) => {
        const map = {
            ticket_resolved: { icon: "check_circle", color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" },
            ticket_assigned: { icon: "person_add", color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10" },
            ticket_update: { icon: "sync_alt", color: "text-amber-500 bg-amber-50 dark:bg-amber-500/10" },
            system: { icon: "settings", color: "text-slate-500 bg-slate-100 dark:bg-slate-800" },
            announcement: { icon: "campaign", color: "text-purple-500 bg-purple-50 dark:bg-purple-500/10" },
        };
        return map[type] || { icon: "notifications", color: "text-slate-500 bg-slate-100 dark:bg-slate-800" };
    };

    const timeAgo = (dateStr) => {
        const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
        if (diff < 60) return "just now";
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    const totalTickets = tickets.length;
    const pendingTickets = tickets.filter(t => ["open", "in_progress", "escalated"].includes(t.status)).length;
    const resolvedTickets = tickets.filter(t => ["resolved", "closed"].includes(t.status)).length;
    const resolvedPct = totalTickets === 0 ? 0 : Math.round((resolvedTickets / totalTickets) * 100);

    const filteredTickets = filter === "all" ? tickets : tickets.filter(t => t.status === filter);

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">

            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-y-auto">

                {/* Top Bar */}
                <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
                    <div className="flex items-center gap-3 w-1/3">
                        <div className="relative w-full">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                            <input
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none text-slate-900 dark:text-white placeholder-slate-400 transition-colors"
                                placeholder="Search tickets..." type="text"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Notification Bell */}
                        <div className="relative" ref={notifRef}>
                            <button onClick={handleBellClick} className="relative p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Notifications">
                                <span className="material-symbols-outlined text-xl">notifications</span>
                                {unreadCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm border-2 border-white dark:border-slate-900">
                                        {unreadCount > 9 ? "9+" : unreadCount}
                                    </span>
                                )}
                            </button>

                            {notifOpen && (
                                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
                                            {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
                                        </div>
                                        {unreadCount > 0 && (
                                            <button onClick={handleMarkAllRead} className="text-xs text-primary font-semibold hover:underline">Mark all read</button>
                                        )}
                                    </div>
                                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                                        {notifLoading ? (
                                            <div className="p-6 text-center"><span className="material-symbols-outlined animate-spin text-2xl text-slate-400">progress_activity</span></div>
                                        ) : notifications.length === 0 ? (
                                            <div className="p-6 text-center">
                                                <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 text-3xl">notifications_off</span>
                                                <p className="text-sm text-slate-400 mt-2">No notifications yet</p>
                                            </div>
                                        ) : notifications.map(notif => {
                                            const { icon, color } = getNotifIcon(notif.type);
                                            return (
                                                <button key={notif.id} onClick={() => handleNotifClick(notif)}
                                                    className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${!notif.is_read ? "bg-primary/5" : ""}`}>
                                                    <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                                                        <span className="material-symbols-outlined text-[18px]">{icon}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className={`text-sm leading-tight truncate ${!notif.is_read ? "font-bold text-slate-900 dark:text-white" : "font-medium text-slate-700 dark:text-slate-300"}`}>{notif.title}</p>
                                                            {!notif.is_read && <div className="w-2 h-2 rounded-full bg-primary shrink-0"></div>}
                                                        </div>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{notif.message}</p>
                                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{timeAgo(notif.created_at)}</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>

                        {/* Profile */}
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-slate-900 dark:text-white capitalize">{user?.full_name || "Admin"}</p>
                                <p className="text-[10px] text-primary font-medium uppercase">{user?.role || "Staff"}</p>
                            </div>
                            <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "A"}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">

                    {/* Welcome */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                Welcome back, {user?.full_name?.split(" ")[0] || "Admin"} 👋
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                                Here's an overview of support tickets and system activity.
                            </p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="h-11 w-11 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined">confirmation_number</span>
                                </div>
                                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Total</span>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-3">{totalTickets}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">All tickets</p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="h-11 w-11 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500">
                                    <span className="material-symbols-outlined">pending_actions</span>
                                </div>
                                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase">Pending</span>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-3">{pendingTickets}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Awaiting resolution</p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                    <span className="material-symbols-outlined">task_alt</span>
                                </div>
                                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Resolved</span>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-3">{resolvedTickets}</h3>
                            <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${resolvedPct}%` }}></div>
                            </div>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 font-semibold">{resolvedPct}% resolution rate</p>
                        </div>
                    </div>

                    {/* Tickets Table */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-[20px]">list_alt</span>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">All Tickets</h3>
                                <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">{filteredTickets.length}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                {["all", "open", "in_progress", "resolved", "closed", "escalated"].map(s => (
                                    <button key={s} onClick={() => setFilter(s)}
                                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold capitalize transition-colors border ${filter === s
                                            ? "bg-primary text-white border-primary"
                                            : "bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                            }`}>
                                        {s === "all" ? "All" : s.replace("_", " ")}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Student</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Subject</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Department</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-16 text-center">
                                                <span className="material-symbols-outlined text-primary text-3xl animate-spin">progress_activity</span>
                                                <p className="text-sm text-slate-400 mt-2">Loading tickets...</p>
                                            </td>
                                        </tr>
                                    ) : filteredTickets.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-16 text-center">
                                                <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 text-4xl">inbox</span>
                                                <p className="text-sm text-slate-400 mt-2">No tickets found</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredTickets.slice(0, 50).map(ticket => (
                                            <tr key={ticket.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-white font-bold text-xs flex items-center justify-center">
                                                            {ticket.student?.full_name ? ticket.student.full_name.charAt(0).toUpperCase() : "S"}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                                                {ticket.student?.full_name || "Unknown"}
                                                            </p>
                                                            <p className="text-[10px] text-primary font-mono font-semibold mt-0.5">
                                                                {ticket.student?.registration_number || "—"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[250px]">{ticket.subject}</p>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{new Date(ticket.created_at).toLocaleDateString()}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 capitalize">{ticket.department}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide ${statusColors[ticket.status] || statusColors.open}`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${dotColor[ticket.status] || "bg-slate-400"}`}></div>
                                                        {ticket.status.replace("_", " ")}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${priorityColors[ticket.priority] || priorityColors.medium}`}>
                                                        {ticket.priority}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link to={`/admin/ticket/${ticket.id}`}
                                                        className="inline-flex items-center gap-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all">
                                                        View
                                                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                Showing {Math.min(filteredTickets.length, 50)} of {filteredTickets.length} tickets
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
