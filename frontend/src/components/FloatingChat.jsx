import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { chatApi } from "../services/api";

export default function FloatingChat() {
    const { isAuthenticated, user } = useAuth();
    const [open, setOpen] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        if (open && isAuthenticated) {
            chatApi.listSessions().then(setSessions).catch(() => { });
        }
    }, [open, isAuthenticated]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (!isAuthenticated) return null;

    const handleSend = async (e) => {
        e?.preventDefault();
        const q = input.trim();
        if (!q || loading) return;

        setMessages(prev => [...prev, { role: "user", content: q, created_at: new Date().toISOString() }]);
        setInput("");
        setLoading(true);

        try {
            const res = await chatApi.ask(q, activeSession);
            if (!activeSession && res.session_id) {
                setActiveSession(res.session_id);
                chatApi.listSessions().then(setSessions).catch(() => { });
            }
            setMessages(prev => [
                ...prev,
                { role: "assistant", content: res.answer, sources: res.sources, created_at: new Date().toISOString() },
            ]);
        } catch {
            setMessages(prev => [
                ...prev,
                { role: "assistant", content: "Sorry, something went wrong. Please try again.", created_at: new Date().toISOString() },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const loadSession = async (id) => {
        setActiveSession(id);
        setShowHistory(false);
        try {
            const msgs = await chatApi.getMessages(id);
            setMessages(msgs);
        } catch { setMessages([]); }
    };

    const handleNewChat = () => {
        setActiveSession(null);
        setMessages([]);
        setShowHistory(false);
    };

    const handleIngest = async () => {
        try {
            const res = await chatApi.ingest();
            alert(res.message || "Ingestion complete!");
        } catch (err) { alert(err.message || "Ingestion failed"); }
    };

    const isAdmin = user?.role && user.role !== "student";

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => setOpen(prev => !prev)}
                className="fixed bottom-5 right-20 z-50 h-14 w-14 bg-primary hover:bg-primary/90 text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                title="AI Chat Assistant"
            >
                <span className="material-symbols-outlined text-[26px]">
                    {open ? "close" : "smart_toy"}
                </span>
            </button>

            {/* Chat panel */}
            {open && (
                <div className="fixed bottom-24 right-5 z-50 w-[380px] h-[540px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in">

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-primary text-white rounded-t-2xl">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[22px]">smart_toy</span>
                            <div>
                                <h3 className="text-sm font-bold">SLIIT Assistant</h3>
                                <p className="text-[10px] opacity-80">Powered by AI</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setShowHistory(prev => !prev)} className="p-1 hover:bg-white/20 rounded-lg transition-colors" title="Chat History">
                                <span className="material-symbols-outlined text-[18px]">history</span>
                            </button>
                            <button onClick={handleNewChat} className="p-1 hover:bg-white/20 rounded-lg transition-colors" title="New Chat">
                                <span className="material-symbols-outlined text-[18px]">add</span>
                            </button>
                            {isAdmin && (
                                <button onClick={handleIngest} className="p-1 hover:bg-white/20 rounded-lg transition-colors" title="Re-ingest Documents">
                                    <span className="material-symbols-outlined text-[18px]">sync</span>
                                </button>
                            )}
                            <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        </div>
                    </div>

                    {/* Session History Dropdown */}
                    {showHistory && (
                        <div className="absolute top-14 left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 max-h-48 overflow-y-auto z-10 shadow-lg">
                            {sessions.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-4">No previous chats</p>
                            ) : sessions.map(s => (
                                <button key={s.id} onClick={() => loadSession(s.id)}
                                    className={`w-full text-left px-4 py-2.5 text-xs border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${activeSession === s.id ? "bg-primary/5 text-primary font-semibold" : "text-slate-600 dark:text-slate-400"}`}>
                                    <p className="truncate">{s.title || "New Chat"}</p>
                                    <p className="text-[10px] text-slate-400">{new Date(s.created_at).toLocaleDateString()}</p>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">

                        {messages.length === 0 && !loading && (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                                    <span className="material-symbols-outlined text-primary text-2xl">smart_toy</span>
                                </div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">How can I help you?</p>
                                <p className="text-[11px] text-slate-400 mt-1 max-w-[250px]">
                                    Ask about SLIIT courses, fees, exams, rules, and more
                                </p>
                                <div className="flex flex-col gap-1.5 mt-4 w-full px-2">
                                    {["What are the exam rules?", "How to apply for re-exam?", "Fee structure for computing"].map(q => (
                                        <button key={q} onClick={() => setInput(q)}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary transition-colors text-left">
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${msg.role === "user"
                                    ? "bg-primary text-white rounded-br-sm"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm"
                                    }`}>
                                    {msg.role === "assistant" && (
                                        <div className="flex items-center gap-1 mb-1">
                                            <span className="material-symbols-outlined text-primary text-[14px]">smart_toy</span>
                                            <span className="text-[9px] font-bold text-primary">AI</span>
                                        </div>
                                    )}
                                    <p className="text-[12px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                                    {msg.sources && msg.sources.length > 0 && (
                                        <div className="mt-2 pt-1.5 border-t border-slate-200/50 dark:border-slate-700">
                                            <p className="text-[9px] font-bold text-slate-400 mb-1">📚 Sources</p>
                                            {msg.sources.map((src, j) => (
                                                <p key={j} className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                                    • {src.title || src.file_name || "Document"}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-sm px-3 py-2">
                                    <div className="flex items-center gap-1 mb-1">
                                        <span className="material-symbols-outlined text-primary text-[14px]">smart_toy</span>
                                        <span className="text-[9px] font-bold text-primary">AI</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div className="border-t border-slate-200 dark:border-slate-800 p-3">
                        <form onSubmit={handleSend} className="flex items-center gap-2">
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Ask a question..."
                                disabled={loading}
                                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 disabled:opacity-50"
                            />
                            <button type="submit" disabled={loading || !input.trim()}
                                className="h-10 w-10 bg-primary hover:bg-primary/90 text-white rounded-xl flex items-center justify-center disabled:opacity-50 transition-all flex-shrink-0">
                                <span className="material-symbols-outlined text-[18px]">send</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
