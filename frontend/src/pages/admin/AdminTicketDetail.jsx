import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ticketApi, notificationApi } from "../../services/api";

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_STYLES = {
    open: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
    in_progress: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
    resolved: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
    closed: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    escalated: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30",
};

const PRIORITY_STYLES = {
    low: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
    medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
    high: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/30",
    urgent: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30",
};

const DOT_COLOR = {
    open: "bg-blue-500",
    in_progress: "bg-amber-500",
    resolved: "bg-emerald-500",
    closed: "bg-slate-400",
    escalated: "bg-rose-500",
};

function Avatar({ name, role }) {
    const initials = name ? name.charAt(0).toUpperCase() : "?";
    const isStaff = role && role !== "student";
    return (
        <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 text-white ${isStaff ? "bg-primary" : "bg-slate-500 dark:bg-slate-600"}`}>
            {initials}
        </div>
    );
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function AdminTicketDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const bottomRef = useRef(null);

    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Sidebar form state
    const [statusForm, setStatusForm] = useState({ status: "", priority: "", assigned_to: "", admin_note: "", resolution: "" });
    const [savingStatus, setSavingStatus] = useState(false);
    const [statusSaved, setStatusSaved] = useState(false);

    // Comment composer state
    const [commentText, setCommentText] = useState("");
    const [isInternal, setIsInternal] = useState(false);
    const [postingComment, setPostingComment] = useState(false);

    // Notification state
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifList, setNotifList] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifLoading, setNotifLoading] = useState(false);
    const notifRef = useRef(null);

    useEffect(() => {
        loadTicket();
    }, [id]);

    // Poll unread count
    useEffect(() => {
        const fetchCount = () => {
            notificationApi.unreadCount().then(d => setUnreadCount(d.count || 0)).catch(() => { });
        };
        fetchCount();
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close notif dropdown on outside click
    useEffect(() => {
        const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleBellClick = async () => {
        const next = !notifOpen;
        setNotifOpen(next);
        if (next) {
            setNotifLoading(true);
            try { setNotifList(await notificationApi.list()); } catch { }
            finally { setNotifLoading(false); }
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationApi.markAllRead();
            setNotifList(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch { }
    };

    const handleNotifClick = async (notif) => {
        if (!notif.is_read) {
            try {
                await notificationApi.markRead(notif.id);
                setNotifList(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
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

    const loadTicket = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await ticketApi.getById(id);
            setTicket(data);
            setStatusForm({
                status: data.status,
                priority: data.priority,
                assigned_to: data.assigned_to || "",
                admin_note: data.admin_note || "",
                resolution: data.resolution || "",
            });
        } catch (err) {
            setError(err.message || "Failed to load ticket.");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusSave = async (e) => {
        e?.preventDefault();
        setSavingStatus(true);
        setError(null);
        try {
            const data = await ticketApi.updateStatus(id, statusForm);
            setTicket(data);
            setStatusSaved(true);
            setTimeout(() => setStatusSaved(false), 2500);
        } catch (err) {
            setError(err.message || "Failed to update ticket.");
        } finally {
            setSavingStatus(false);
        }
    };

    const handlePostComment = async (e) => {
        e?.preventDefault();
        if (!commentText.trim()) return;
        setPostingComment(true);
        setError(null);
        try {
            const newComment = await ticketApi.postComment(id, { content: commentText.trim(), is_internal: isInternal });
            setTicket(prev => ({ ...prev, comments: [...(prev.comments || []), newComment] }));
            setCommentText("");
            setIsInternal(false);
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        } catch (err) {
            setError(err.message || "Failed to post comment.");
        } finally {
            setPostingComment(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-slate-50 dark:bg-slate-950 items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-5xl animate-spin">progress_activity</span>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Loading ticket...</p>
                </div>
            </div>
        );
    }

    if (error && !ticket) {
        return (
            <div className="flex h-screen bg-slate-50 dark:bg-slate-950 items-center justify-center text-center px-4">
                <div className="space-y-4 max-w-sm">
                    <div className="h-16 w-16 bg-red-100 dark:bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto">
                        <span className="material-symbols-outlined text-3xl">error</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Failed to load ticket</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{error}</p>
                    <Link to="/admin/dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                        <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const publicComments = (ticket.comments || []).filter(c => !c.is_internal);
    const allComments = ticket.comments || [];

    return (
        <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-display">

            {/* Top Bar */}
            <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3 z-30 sticky top-0 shadow-sm">
                <div className="flex items-center gap-4">
                    <Link to="/admin/dashboard" className="flex items-center gap-2 text-primary group">
                        <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">school</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">CAMPUS Desk</span>
                    </Link>
                    <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
                    <Link to="/admin/dashboard" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-medium transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span> All Tickets
                    </Link>
                    <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-[16px]">chevron_right</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-xs">{ticket.subject}</span>
                </div>
                <div className="flex items-center gap-3">
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
                                    {unreadCount > 0 && <button onClick={handleMarkAllRead} className="text-xs text-primary font-semibold hover:underline">Mark all read</button>}
                                </div>
                                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                                    {notifLoading ? (
                                        <div className="p-6 text-center"><span className="material-symbols-outlined animate-spin text-2xl text-slate-400">progress_activity</span></div>
                                    ) : notifList.length === 0 ? (
                                        <div className="p-6 text-center">
                                            <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 text-3xl">notifications_off</span>
                                            <p className="text-sm text-slate-400 mt-2">No notifications yet</p>
                                        </div>
                                    ) : notifList.map(notif => {
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
                    <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate("/admin/dashboard")}>
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "A"}
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:block capitalize">{user?.full_name}</span>
                    </div>
                </div>
            </header>

            {/* Main 3-Column Layout */}
            <main className="flex flex-1 overflow-hidden">

                {/* ── Col 1: Mini Sidebar ─────────────────────────────── */}
                <nav className="w-14 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col items-center py-4 gap-3 hidden md:flex">
                    <button onClick={() => navigate('/admin/dashboard')} className="p-2.5 rounded-xl text-primary bg-primary/10 relative group" title="Back to Inbox">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-r-full"></div>
                        <span className="material-symbols-outlined text-[20px]">inbox</span>
                    </button>
                    <button className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Contacts">
                        <span className="material-symbols-outlined text-[20px]">person</span>
                    </button>
                    <button className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Analytics">
                        <span className="material-symbols-outlined text-[20px]">analytics</span>
                    </button>
                    <button onClick={logout} className="p-2.5 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors mt-auto" title="Logout">
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                    </button>
                </nav>

                {/* ── Col 2: Conversation Thread ──────────────────────── */}
                <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-slate-800 overflow-hidden">

                    {/* Ticket subject header */}
                    <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-start gap-4">
                            <div className="flex-1 min-w-0">
                                <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate">{ticket.subject}</h1>
                                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                    <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">#{ticket.id.substring(0, 8)}</span>
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLES[ticket.status] || STATUS_STYLES.open}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${DOT_COLOR[ticket.status] || "bg-slate-400"}`}></div>
                                        {ticket.status.replace("_", " ")}
                                    </span>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide ${PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.medium}`}>
                                        {ticket.priority}
                                    </span>
                                    <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                                        {new Date(ticket.created_at).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Comment Thread */}
                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-200 dark:border-red-500/20 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">error</span>
                                {error}
                            </div>
                        )}

                        {/* Original Message — always first */}
                        <div className="flex gap-3">
                            <Avatar name={ticket.student?.full_name} role="student" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{ticket.student?.full_name || "Student"}</span>
                                    <span className="text-[11px] text-slate-400 dark:text-slate-500">{new Date(ticket.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full font-medium border border-slate-200 dark:border-slate-700">Original Request</span>
                                </div>
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-sm p-4 shadow-sm">
                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{ticket.message}</p>
                                </div>
                            </div>
                        </div>

                        {/* Timeline Divider */}
                        <div className="relative flex items-center">
                            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
                            <span className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950">Discussion Thread</span>
                            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
                        </div>

                        {/* Comment Thread */}
                        {allComments.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                                <span className="material-symbols-outlined text-3xl block mb-2">chat_bubble_outline</span>
                                <p className="text-sm font-medium">No replies yet. Add the first response below.</p>
                            </div>
                        ) : (
                            allComments.map((comment) => {
                                const isStaff = comment.author_role && comment.author_role !== "student";
                                const isInternalNote = comment.is_internal;
                                return (
                                    <div key={comment.id} className={`flex gap-3 ${isStaff ? "flex-row-reverse" : ""}`}>
                                        <Avatar name={comment.author_name} role={comment.author_role} />
                                        <div className={`flex-1 min-w-0 max-w-[80%] ${isStaff ? "items-end" : "items-start"} flex flex-col`}>
                                            <div className={`flex items-center gap-2 mb-1.5 ${isStaff ? "flex-row-reverse" : ""}`}>
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{comment.author_name || "User"}</span>
                                                <span className="text-[11px] text-slate-400 dark:text-slate-500">{new Date(comment.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                                {isInternalNote && (
                                                    <span className="text-[10px] bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold border border-amber-200 dark:border-amber-500/20 flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[12px]">visibility_off</span> Internal
                                                    </span>
                                                )}
                                                {isStaff && !isInternalNote && (
                                                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold border border-primary/20 capitalize">{comment.author_role}</span>
                                                )}
                                            </div>
                                            <div className={`p-4 rounded-2xl border text-sm leading-relaxed whitespace-pre-wrap shadow-sm w-full ${isInternalNote
                                                ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-500/20 text-amber-900 dark:text-amber-100"
                                                : isStaff
                                                    ? "bg-primary text-white border-transparent rounded-tr-sm"
                                                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-sm"
                                                }`}>
                                                {comment.content}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}

                        {/* Resolution Banner */}
                        {ticket.resolution && (
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[18px]">verified</span>
                                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Official Resolution</span>
                                    {ticket.resolved_at && <span className="text-[11px] text-emerald-600/70 dark:text-emerald-400/60 ml-auto">{new Date(ticket.resolved_at).toLocaleString()}</span>}
                                </div>
                                <p className="text-sm text-emerald-900 dark:text-emerald-100 leading-relaxed">{ticket.resolution}</p>
                            </div>
                        )}

                        <div ref={bottomRef}></div>
                    </div>

                    {/* Comment Composer */}
                    <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                        <form onSubmit={handlePostComment}>
                            <div className={`rounded-xl border transition-colors overflow-hidden ${isInternal ? "border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-900/10" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"}`}>
                                <textarea
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePostComment(e); }}
                                    className="w-full p-4 text-sm bg-transparent border-none outline-none resize-none placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white font-medium min-h-[90px]"
                                    placeholder={isInternal ? "Leave an internal note (staff only)..." : "Reply to the student..."}
                                    rows={3}
                                ></textarea>
                                <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 dark:border-slate-800">
                                    <label className="flex items-center gap-2 cursor-pointer select-none group">
                                        <div className={`relative w-9 h-5 rounded-full transition-colors ${isInternal ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-600"}`} onClick={() => setIsInternal(!isInternal)}>
                                            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isInternal ? "translate-x-4" : ""}`}></div>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[15px] text-amber-500">visibility_off</span>
                                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Internal Note</span>
                                        </div>
                                    </label>
                                    <button type="submit" disabled={postingComment || !commentText.trim()}
                                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm disabled:opacity-50 active:scale-95">
                                        <span className="material-symbols-outlined text-[16px]">{postingComment ? "progress_activity" : "send"}</span>
                                        {postingComment ? "Sending..." : "Send Reply"}
                                    </button>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 ml-1">Press <kbd className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px] border border-slate-200 dark:border-slate-700">Ctrl+Enter</kbd> to send quickly</p>
                        </form>
                    </div>
                </div>

                {/* ── Col 3: Right Context Sidebar ────────────────────── */}
                <aside className="w-72 xl:w-80 overflow-y-auto bg-white dark:bg-slate-900 hidden lg:block border-l border-slate-200 dark:border-slate-800">
                    <div className="p-5 space-y-6">

                        {/* Status Update Form */}
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span> Ticket Actions
                            </h3>
                            {statusSaved && (
                                <div className="mb-3 flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                                    <span className="material-symbols-outlined text-[16px]">check_circle</span> Changes saved!
                                </div>
                            )}
                            <form onSubmit={handleStatusSave} className="space-y-3">
                                {/* Status */}
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Status</label>
                                    <div className="relative">
                                        <select value={statusForm.status} onChange={e => setStatusForm(p => ({ ...p, status: e.target.value }))}
                                            className="w-full appearance-none pl-3 pr-8 py-2.5 text-sm font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-slate-900 dark:text-white">
                                            <option value="open">Open</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="closed">Closed</option>
                                            <option value="escalated">Escalated</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
                                    </div>
                                </div>

                                {/* Priority Grid */}
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Priority</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {["low", "medium", "high", "urgent"].map(p => (
                                            <button key={p} type="button" onClick={() => setStatusForm(f => ({ ...f, priority: p }))}
                                                className={`py-2 rounded-lg text-[11px] font-bold tracking-wide border transition-all capitalize ${statusForm.priority === p ? PRIORITY_STYLES[p] : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Assigned To */}
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Assigned To (Staff ID)</label>
                                    <input type="text" value={statusForm.assigned_to} onChange={e => setStatusForm(p => ({ ...p, assigned_to: e.target.value }))}
                                        placeholder="Paste staff UUID..."
                                        className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors" />
                                </div>

                                {/* Resolution */}
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Resolution Summary</label>
                                    <textarea value={statusForm.resolution} onChange={e => setStatusForm(p => ({ ...p, resolution: e.target.value }))}
                                        rows={3} placeholder="Short resolution text visible to student..."
                                        className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors resize-none" />
                                </div>

                                {/* Admin Note */}
                                <div>
                                    <label className="block text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[13px]">visibility_off</span> Admin Note (Internal Only)
                                    </label>
                                    <textarea value={statusForm.admin_note} onChange={e => setStatusForm(p => ({ ...p, admin_note: e.target.value }))}
                                        rows={2} placeholder="Private note for staff..."
                                        className="w-full px-3 py-2.5 text-sm bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/20 rounded-xl outline-none focus:border-amber-400 text-slate-900 dark:text-amber-100 placeholder-amber-400/60 transition-colors resize-none" />
                                </div>

                                <button type="submit" disabled={savingStatus}
                                    className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-[16px]">{savingStatus ? "progress_activity" : "save"}</span>
                                    {savingStatus ? "Saving..." : "Save Changes"}
                                </button>
                            </form>
                        </div>

                        <div className="border-t border-slate-200 dark:border-slate-800"></div>

                        {/* Student Profile */}
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[16px]">person</span> Student Profile
                            </h3>
                            <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-white font-bold flex items-center justify-center text-sm">
                                        {ticket.student?.full_name ? ticket.student.full_name.charAt(0).toUpperCase() : "S"}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{ticket.student?.full_name || "Unknown"}</p>
                                        <p className="text-[11px] text-primary font-mono font-bold mt-0.5">{ticket.student?.registration_number || "N/A"}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 dark:text-slate-400 font-medium">Faculty</span>
                                        <span className="font-semibold text-slate-900 dark:text-white capitalize">{ticket.student?.faculty || "—"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 dark:text-slate-400 font-medium">Campus</span>
                                        <span className="font-semibold text-slate-900 dark:text-white capitalize">{ticket.student?.campus || "—"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 dark:text-slate-400 font-medium">Department</span>
                                        <span className="font-semibold text-slate-900 dark:text-white capitalize">{ticket.department}</span>
                                    </div>
                                    {ticket.student?.phone && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 dark:text-slate-400 font-medium">Phone</span>
                                            <span className="font-semibold text-slate-900 dark:text-white">{ticket.student.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Thread summary */}
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[16px]">forum</span> Thread Info
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-3 text-center border border-slate-200 dark:border-slate-800">
                                    <p className="text-2xl font-black text-slate-900 dark:text-white">{publicComments.length}</p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Public Replies</p>
                                </div>
                                <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-3 text-center border border-amber-200 dark:border-amber-500/20">
                                    <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{allComments.length - publicComments.length}</p>
                                    <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium mt-0.5">Internal Notes</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
}
