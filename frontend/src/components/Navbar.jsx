import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { notificationApi } from "../services/api";

export default function Navbar() {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loadingNotifs, setLoadingNotifs] = useState(false);
    const dropdownRef = useRef(null);

    // Fetch unread count on mount, and poll every 30s
    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchCount = () => {
            notificationApi.unreadCount()
                .then(data => setUnreadCount(data.count || 0))
                .catch(() => { });
        };

        fetchCount();
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }, [isAuthenticated]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleBellClick = async () => {
        const nextState = !open;
        setOpen(nextState);
        if (nextState) {
            setLoadingNotifs(true);
            try {
                const list = await notificationApi.list();
                setNotifications(list);
            } catch { /* silent */ }
            finally { setLoadingNotifs(false); }
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationApi.markAllRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch { /* silent */ }
    };

    const handleNotificationClick = async (notif) => {
        // Mark as read
        if (!notif.is_read) {
            try {
                await notificationApi.markRead(notif.id);
                setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch { /* silent */ }
        }

        // Navigate to the referenced ticket if available
        if (notif.reference_type === "ticket" && notif.reference_id) {
            const isStaff = user?.role && user.role !== "student";
            navigate(isStaff ? `/admin/ticket/${notif.reference_id}` : `/ticket/${notif.reference_id}`);
        }
        setOpen(false);
    };

    const getNotifIcon = (type) => {
        switch (type) {
            case "ticket_resolved": return { icon: "check_circle", color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" };
            case "ticket_assigned": return { icon: "person_add", color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10" };
            case "ticket_update": return { icon: "sync_alt", color: "text-amber-500 bg-amber-50 dark:bg-amber-500/10" };
            case "system": return { icon: "settings", color: "text-slate-500 bg-slate-100 dark:bg-slate-800" };
            case "announcement": return { icon: "campaign", color: "text-purple-500 bg-purple-50 dark:bg-purple-500/10" };
            default: return { icon: "notifications", color: "text-slate-500 bg-slate-100 dark:bg-slate-800" };
        }
    };

    const timeAgo = (dateStr) => {
        const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
        if (diff < 60) return "just now";
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="bg-primary p-1.5 rounded-lg">
                                <span className="material-symbols-outlined text-white">school</span>
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white hidden sm:inline">
                                SLIIT Support Desk
                            </span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4 sm:space-x-6">
                        <Link
                            className="text-sm font-medium hover:text-primary transition-colors"
                            to="/"
                        >
                            Help Center
                        </Link>
                        {isAuthenticated && (
                            <Link
                                to="/knowledge-base"
                                className="text-sm font-medium hover:text-primary transition-colors"
                            >
                                Knowledge Base
                            </Link>
                        )}
                        <Link
                            to="/student-support"
                            className="bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg active:scale-95"
                        >
                            Contact Support
                        </Link>

                        {isAuthenticated && (
                            <>
                                {/* Notification Bell */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={handleBellClick}
                                        className="relative p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        title="Notifications"
                                    >
                                        <span className="material-symbols-outlined text-xl">notifications</span>
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm border-2 border-white dark:border-slate-900">
                                                {unreadCount > 9 ? "9+" : unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {/* Dropdown Panel */}
                                    {open && (
                                        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden z-50">
                                            {/* Header */}
                                            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
                                                    {unreadCount > 0 && (
                                                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                                                    )}
                                                </div>
                                                {unreadCount > 0 && (
                                                    <button onClick={handleMarkAllRead} className="text-xs text-primary font-semibold hover:underline">
                                                        Mark all read
                                                    </button>
                                                )}
                                            </div>

                                            {/* List */}
                                            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                                                {loadingNotifs ? (
                                                    <div className="p-6 text-center text-slate-400">
                                                        <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
                                                    </div>
                                                ) : notifications.length === 0 ? (
                                                    <div className="p-6 text-center">
                                                        <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 text-3xl">notifications_off</span>
                                                        <p className="text-sm text-slate-400 mt-2">No notifications yet</p>
                                                    </div>
                                                ) : (
                                                    notifications.map((notif) => {
                                                        const { icon, color } = getNotifIcon(notif.type);
                                                        return (
                                                            <button
                                                                key={notif.id}
                                                                onClick={() => handleNotificationClick(notif)}
                                                                className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${!notif.is_read ? "bg-primary/5 dark:bg-primary/5" : ""}`}
                                                            >
                                                                <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                                                                    <span className="material-symbols-outlined text-[18px]">{icon}</span>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <p className={`text-sm leading-tight truncate ${!notif.is_read ? "font-bold text-slate-900 dark:text-white" : "font-medium text-slate-700 dark:text-slate-300"}`}>
                                                                            {notif.title}
                                                                        </p>
                                                                        {!notif.is_read && (
                                                                            <div className="w-2 h-2 rounded-full bg-primary shrink-0"></div>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{notif.message}</p>
                                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{timeAgo(notif.created_at)}</p>
                                                                </div>
                                                            </button>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Link
                                    to="/profile"
                                    className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                                    title="My Profile"
                                >
                                    <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-sm">
                                        {user?.full_name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="hidden sm:inline">{user?.full_name?.split(" ")[0]}</span>
                                </Link>
                            </>
                        )}

                        {!isAuthenticated && (
                            <Link
                                to="/login"
                                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                            >
                                Log in
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
