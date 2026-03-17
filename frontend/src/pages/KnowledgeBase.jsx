import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { kbApi } from "../services/api";
import Navbar from "../components/Navbar";

export default function KnowledgeBase() {
    const { user } = useAuth();
    const [categories, setCategories] = useState([]);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("");
    const [search, setSearch] = useState("");
    const [selectedArticle, setSelectedArticle] = useState(null);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const [cats, arts] = await Promise.all([kbApi.listCategories(), kbApi.listArticles()]);
                setCategories(cats);
                setArticles(arts);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    const filtered = articles.filter(a => {
        const matchCategory = activeCategory ? a.category_id === activeCategory : true;
        const matchSearch = search
            ? a.title.toLowerCase().includes(search.toLowerCase()) ||
            a.content.toLowerCase().includes(search.toLowerCase()) ||
            (a.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))
            : true;
        return matchCategory && matchSearch;
    });

    const handleOpenArticle = async (article) => {
        setSelectedArticle(article);
        try { await kbApi.markHelpful(article.id); } catch (_) { /* view count */ }
    };

    if (selectedArticle) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                <Navbar />
                <div className="max-w-3xl mx-auto px-4 py-8">
                    {/* Back button */}
                    <button onClick={() => setSelectedArticle(null)}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 mb-6 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Back to Knowledge Base
                    </button>

                    {/* Article Card */}
                    <article className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                                    {selectedArticle.category_name || "General"}
                                </span>
                                {selectedArticle.source_type && selectedArticle.source_type !== "manual" && (
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 capitalize">
                                        {selectedArticle.source_type}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedArticle.title}</h1>
                            <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                                {selectedArticle.author_name && (
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">person</span>
                                        {selectedArticle.author_name}
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                    {new Date(selectedArticle.created_at).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">visibility</span>
                                    {selectedArticle.view_count} views
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-8 py-6">
                            <div className="prose prose-slate dark:prose-invert max-w-none text-[15px] leading-relaxed whitespace-pre-wrap">
                                {selectedArticle.content}
                            </div>
                        </div>

                        {/* File Download */}
                        {selectedArticle.file_url && (
                            <div className="px-8 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
                                <a href={selectedArticle.file_url} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-semibold hover:bg-primary/20 transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">download</span>
                                    Download {selectedArticle.file_name || "Attachment"}
                                </a>
                            </div>
                        )}

                        {/* Tags */}
                        {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                            <div className="px-8 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 flex-wrap">
                                <span className="material-symbols-outlined text-[16px] text-slate-400">sell</span>
                                {selectedArticle.tags.map(tag => (
                                    <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-[11px] font-medium">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </article>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Navbar />
            <div className="max-w-5xl mx-auto px-4 py-8">

                {/* Page Header */}
                <div className="text-center mb-8">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-primary text-3xl">menu_book</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Knowledge Base</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-lg mx-auto">
                        Browse articles, guides, and resources to find answers to common questions
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-xl mx-auto mb-8">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                        <input
                            type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search articles, guides, and resources..."
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
                        />
                        {search && (
                            <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Category Filters */}
                <div className="flex items-center gap-2 justify-center flex-wrap mb-8">
                    <button onClick={() => setActiveCategory("")}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${!activeCategory
                            ? "bg-primary text-white shadow-sm"
                            : "bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                            }`}>
                        All
                    </button>
                    {categories.map(c => (
                        <button key={c.id} onClick={() => setActiveCategory(c.id)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${activeCategory === c.id
                                ? "bg-primary text-white shadow-sm"
                                : "bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                                }`}>
                            <span className="material-symbols-outlined text-[16px]">{c.icon || "folder"}</span>
                            {c.name}
                        </button>
                    ))}
                </div>

                {/* Articles Grid */}
                {loading ? (
                    <div className="text-center py-20">
                        <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
                        <p className="text-sm text-slate-400 mt-3">Loading articles...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 text-5xl">search_off</span>
                        <p className="text-slate-500 dark:text-slate-400 mt-3 font-medium">No articles found</p>
                        <p className="text-xs text-slate-400 mt-1">Try adjusting your search or category filter</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtered.map(a => (
                            <button key={a.id} onClick={() => handleOpenArticle(a)}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-left hover:border-primary/40 hover:shadow-md transition-all group">

                                {/* Category Badge & Source */}
                                <div className="flex items-center justify-between mb-3">
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                                        {a.category_name || "General"}
                                    </span>
                                    {a.file_url && (
                                        <span className="material-symbols-outlined text-[16px] text-slate-400" title="Has attachment">
                                            attach_file
                                        </span>
                                    )}
                                </div>

                                {/* Title */}
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-snug">
                                    {a.title}
                                </h3>

                                {/* Preview */}
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                                    {a.content?.substring(0, 150)}...
                                </p>

                                {/* Tags */}
                                {a.tags && a.tags.length > 0 && (
                                    <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                                        {a.tags.slice(0, 3).map(tag => (
                                            <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full text-[10px] font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[13px]">visibility</span>
                                        {a.view_count} views
                                    </span>
                                    <span className="text-[11px] text-slate-400">
                                        {new Date(a.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Results Count */}
                {!loading && filtered.length > 0 && (
                    <p className="text-center text-xs text-slate-400 mt-6">
                        Showing {filtered.length} of {articles.length} articles
                    </p>
                )}
            </div>
        </div>
    );
}
