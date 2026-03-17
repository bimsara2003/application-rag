import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ticketApi } from "../services/api";
import Navbar from "../components/Navbar";

const STATUS_STYLES = {
    open: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    in_progress: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    resolved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    closed: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    escalated: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

export default function StudentTicketDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const bottomRef = useRef(null);

    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [commentText, setCommentText] = useState("");
    const [posting, setPosting] = useState(false);

    useEffect(() => {
        loadTicket();
    }, [id]);

    const loadTicket = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await ticketApi.getById(id);
            setTicket(data);
        } catch (err) {
            setError(err.message || "Failed to load ticket.");
        } finally {
            setLoading(false);
        }
    };

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        setPosting(true);
        setError(null);
        try {
            const newComment = await ticketApi.postComment(id, { content: commentText.trim(), is_internal: false });
            setTicket(prev => ({ ...prev, comments: [...(prev.comments || []), newComment] }));
            setCommentText("");
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        } catch (err) {
            setError(err.message || "Failed to send reply.");
        } finally {
            setPosting(false);
        }
    };

    // Filter out internal notes — students should never see them
    const visibleComments = (ticket?.comments || []).filter(c => !c.is_internal);

    if (loading) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark">
                <Navbar />
                <div className="flex items-center justify-center py-20">
                    <span className="material-symbols-outlined text-primary text-5xl animate-spin">progress_activity</span>
                </div>
            </div>
        );
    }

    if (error && !ticket) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark">
                <Navbar />
                <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                    <div className="h-16 w-16 bg-red-100 dark:bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto">
                        <span className="material-symbols-outlined text-3xl">error</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-4">Unable to load ticket</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">{error}</p>
                    <Link to="/dashboard" className="mt-6 inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline">
                        <span className="material-symbols-outlined text-sm">arrow_back</span> Back to My Tickets
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200">
            <Navbar />

            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                {/* Back link */}
                <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors font-medium">
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to My Tickets
                </Link>

                {/* Ticket Header Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{ticket.subject}</h1>
                                <div className="flex items-center gap-3 mt-2 flex-wrap">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${STATUS_STYLES[ticket.status] || STATUS_STYLES.open}`}>
                                        {ticket.status.replace("_", " ")}
                                    </span>
                                    <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                                        {new Date(ticket.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                                    </span>
                                    <span className="text-xs text-slate-400 dark:text-slate-500 capitalize">
                                        {ticket.department} department
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resolution Banner */}
                    {ticket.resolution && (
                        <div className="px-6 pb-6">
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/30 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[18px]">verified</span>
                                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Resolution</span>
                                    {ticket.resolved_at && (
                                        <span className="text-[11px] text-emerald-600/60 dark:text-emerald-400/50 ml-auto">
                                            {new Date(ticket.resolved_at).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-emerald-900 dark:text-emerald-100 leading-relaxed">{ticket.resolution}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Conversation Thread */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">forum</span>
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Conversation</h2>
                        <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">{visibleComments.length + 1} messages</span>
                    </div>

                    <div className="p-6 space-y-5 max-h-[500px] overflow-y-auto">
                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-500/20 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[16px]">error</span> {error}
                            </div>
                        )}

                        {/* Original message (student's own) */}
                        <div className="flex gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-white font-bold text-xs flex items-center justify-center shrink-0">
                                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "Y"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">You</span>
                                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                                        {new Date(ticket.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm p-4">
                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{ticket.message}</p>
                                </div>
                            </div>
                        </div>

                        {/* Staff and student follow-up replies */}
                        {visibleComments.map((comment) => {
                            const isStaff = comment.author_role && comment.author_role !== "student";
                            const isMe = comment.user_id === user?.id;
                            return (
                                <div key={comment.id} className={`flex gap-3 ${isStaff ? "" : ""}`}>
                                    <div className={`h-8 w-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 text-white ${isStaff ? "bg-primary" : "bg-slate-400 dark:bg-slate-600"}`}>
                                        {comment.author_name ? comment.author_name.charAt(0).toUpperCase() : "?"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                {isMe ? "You" : (comment.author_name || "Support Staff")}
                                            </span>
                                            {isStaff && (
                                                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold capitalize">
                                                    {comment.author_role}
                                                </span>
                                            )}
                                            <span className="text-[11px] text-slate-400 dark:text-slate-500">
                                                {new Date(comment.created_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                        </div>
                                        <div className={`p-4 rounded-2xl rounded-tl-sm border text-sm leading-relaxed whitespace-pre-wrap ${isStaff
                                            ? "bg-primary/5 dark:bg-primary/10 border-primary/20 text-slate-800 dark:text-slate-200"
                                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                                            }`}>
                                            {comment.content}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        <div ref={bottomRef}></div>
                    </div>

                    {/* Reply composer — only if ticket is not closed */}
                    {ticket.status !== "closed" && (
                        <div className="border-t border-slate-100 dark:border-slate-800 p-4">
                            <form onSubmit={handlePostComment}>
                                <div className="flex gap-3">
                                    <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-white font-bold text-xs flex items-center justify-center shrink-0 mt-1">
                                        {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "Y"}
                                    </div>
                                    <div className="flex-1">
                                        <textarea
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePostComment(e); }}
                                            className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none transition-colors"
                                            placeholder="Type a reply..."
                                            rows={3}
                                        ></textarea>
                                        <div className="flex items-center justify-between mt-2">
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500">
                                                Press <kbd className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px] border border-slate-200 dark:border-slate-700">Ctrl+Enter</kbd> to send
                                            </p>
                                            <button type="submit" disabled={posting || !commentText.trim()}
                                                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm disabled:opacity-50 active:scale-95">
                                                <span className="material-symbols-outlined text-[16px]">{posting ? "progress_activity" : "send"}</span>
                                                {posting ? "Sending..." : "Send"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
