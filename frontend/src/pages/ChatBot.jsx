import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { chatApi } from "../services/api";
import Navbar from "../components/Navbar";

export default function ChatBot() {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [ingesting, setIngesting] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        chatApi.listSessions().then(setSessions).catch(() => { });
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e) => {
        e?.preventDefault();
        const q = input.trim();
        if (!q || loading) return;

        // Optimistic update
        setMessages(prev => [...prev, { role: "user", content: q, created_at: new Date().toISOString() }]);
        setInput("");
        setLoading(true);

        try {
            const res = await chatApi.ask(q, activeSession);

            // Set session if new
            if (!activeSession && res.session_id) {
                setActiveSession(res.session_id);
                chatApi.listSessions().then(setSessions).catch(() => { });
            }

            setMessages(prev => [
                ...prev,
                {
                    role: "assistant",
                    content: res.answer,
                    sources: res.sources,
                    created_at: new Date().toISOString(),
                },
            ]);
        } catch (err) {
            setMessages(prev => [
                ...prev,
                {
                    role: "assistant",
                    content: "Sorry, something went wrong. Please try again.",
                    created_at: new Date().toISOString(),
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const loadSession = async (sessionId) => {
        setActiveSession(sessionId);
        setShowSidebar(false);
        try {
            const msgs = await chatApi.getMessages(sessionId);
            setMessages(msgs);
        } catch { setMessages([]); }
    };

    const handleNewChat = () => {
        setActiveSession(null);
        setMessages([]);
        setShowSidebar(false);
    };

    const handleIngest = async () => {
        setIngesting(true);
        try {
            const res = await chatApi.ingest();
            alert(res.message || "Ingestion complete!");
        } catch (err) { alert(err.message || "Ingestion failed"); }
        finally { setIngesting(false); }
    };

    const isAdmin = user?.role && user.role !== "student";

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
            <Navbar />

            <div className="flex-1 flex max-w-5xl mx-auto w-full relative">

                {/* Session Sidebar */}
                <div className={`${showSidebar ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} fixed lg:relative z-40 lg:z-auto inset-y-0 left-0 w-72 lg:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform lg:mt-0 mt-16`}>
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Chat History</h3>
                        <button onClick={handleNewChat}
                            className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors" title="New Chat">
                            <span className="material-symbols-outlined text-[20px]">add</span>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {sessions.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-8">No previous chats</p>
                        ) : sessions.map(s => (
                            <button key={s.id} onClick={() => loadSession(s.id)}
                                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${activeSession === s.id
                                    ? "bg-primary/10 text-primary font-semibold"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    }`}>
                                <p className="truncate">{s.title || "New Chat"}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                    {new Date(s.created_at).toLocaleDateString()}
                                </p>
                            </button>
                        ))}
                    </div>

                    {/* Admin: Ingest button */}
                    {isAdmin && (
                        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
                            <button onClick={handleIngest} disabled={ingesting}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors disabled:opacity-50">
                                {ingesting ? (
                                    <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span> Ingesting...</>
                                ) : (
                                    <><span className="material-symbols-outlined text-[16px]">sync</span> Re-ingest Documents</>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Overlay for mobile sidebar */}
                {showSidebar && (
                    <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setShowSidebar(false)} />
                )}

                {/* Chat Area */}
                <div className="flex-1 flex flex-col min-w-0">

                    {/* Chat header - mobile toggle */}
                    <div className="h-12 lg:hidden flex items-center px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <button onClick={() => setShowSidebar(true)} className="text-slate-500">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <span className="ml-3 text-sm font-semibold text-slate-700 dark:text-slate-300">AI Chat</span>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">

                        {messages.length === 0 && !loading && (
                            <div className="flex flex-col items-center justify-center h-full text-center py-20">
                                <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-5">
                                    <span className="material-symbols-outlined text-primary text-4xl">smart_toy</span>
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">SLIIT Support Assistant</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
                                    Ask me anything about SLIIT — courses, fees, exams, rules, campus info, and more!
                                </p>
                                <div className="flex flex-wrap gap-2 mt-6 justify-center max-w-lg">
                                    {["What are the exam rules?", "How to apply for re-exam?", "What is the dress code?", "Fee structure for computing"].map(q => (
                                        <button key={q} onClick={() => { setInput(q); }}
                                            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary transition-colors">
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === "user"
                                    ? "bg-primary text-white rounded-br-md"
                                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-md"
                                    }`}>
                                    {msg.role === "assistant" && (
                                        <div className="flex items-center gap-1.5 mb-1.5">
                                            <span className="material-symbols-outlined text-primary text-[16px]">smart_toy</span>
                                            <span className="text-[10px] font-bold text-primary">AI Assistant</span>
                                        </div>
                                    )}
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                                    {/* Source references */}
                                    {msg.sources && msg.sources.length > 0 && (
                                        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                                            <p className="text-[10px] font-bold text-slate-400 mb-1.5">📚 Sources</p>
                                            <div className="space-y-1">
                                                {msg.sources.map((src, j) => (
                                                    <div key={j} className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 rounded-lg px-2.5 py-1.5">
                                                        <span className="font-semibold">{src.title || src.file_name || "Source"}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <p className="text-[10px] text-slate-400 mt-1.5 text-right opacity-60">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-bl-md px-4 py-3">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <span className="material-symbols-outlined text-primary text-[16px]">smart_toy</span>
                                        <span className="text-[10px] font-bold text-primary">AI Assistant</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={bottomRef} />
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                        <form onSubmit={handleSend} className="flex items-center gap-3 max-w-3xl mx-auto">
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Ask about SLIIT courses, fees, rules..."
                                disabled={loading}
                                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50 transition-all"
                            />
                            <button type="submit" disabled={loading || !input.trim()}
                                className="h-12 w-12 bg-primary hover:bg-primary/90 text-white rounded-2xl flex items-center justify-center disabled:opacity-50 transition-all shadow-sm">
                                <span className="material-symbols-outlined text-[20px]">send</span>
                            </button>
                        </form>
                        <p className="text-center text-[10px] text-slate-400 mt-2">
                            AI responses are generated from SLIIT knowledge base documents. Always verify important information.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
