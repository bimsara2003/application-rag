import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { kbApi } from "../../services/api";
import AdminSidebar from "../../components/AdminSidebar";

const API_BASE = "http://localhost:8000";

export default function AdminKnowledgeBase() {
    const { user: me } = useAuth();
    const [categories, setCategories] = useState([]);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("articles");
    const [filterCategory, setFilterCategory] = useState("");
    const [showArticleModal, setShowArticleModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingArticle, setEditingArticle] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [deleting, setDeleting] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const emptyArticle = { title: "", content: "", category_id: "", tags: "", is_published: false, file_url: "", file_name: "", source_type: "manual" };
    const emptyCategory = { name: "", description: "", icon: "", sort_order: 0 };

    const [articleForm, setArticleForm] = useState(emptyArticle);
    const [categoryForm, setCategoryForm] = useState(emptyCategory);

    useEffect(() => { load(); }, []);

    const load = async () => {
        setLoading(true);
        try {
            const [cats, arts] = await Promise.all([kbApi.listCategories(), kbApi.listAllArticles()]);
            setCategories(cats);
            setArticles(arts);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    // ── Article CRUD ────────────────────────────────────────────

    const openCreateArticle = () => {
        setEditingArticle(null);
        setArticleForm(emptyArticle);
        setError("");
        setShowArticleModal(true);
    };

    const openEditArticle = (a) => {
        setEditingArticle(a);
        setArticleForm({
            title: a.title, content: a.content, category_id: a.category_id,
            tags: (a.tags || []).join(", "), is_published: a.is_published,
            file_url: a.file_url || "", file_name: a.file_name || "", source_type: a.source_type || "manual",
        });
        setError("");
        setShowArticleModal(true);
    };

    const handleSaveArticle = async (e) => {
        e.preventDefault();
        setSaving(true); setError("");
        const payload = {
            ...articleForm,
            tags: articleForm.tags ? articleForm.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
            file_url: articleForm.file_url || null,
            file_name: articleForm.file_name || null,
        };
        try {
            if (editingArticle) {
                await kbApi.updateArticle(editingArticle.id, payload);
            } else {
                await kbApi.createArticle(payload);
            }
            setShowArticleModal(false);
            load();
        } catch (err) { setError(err.message || "Failed"); }
        finally { setSaving(false); }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true); setError("");
        try {
            const token = localStorage.getItem("access_token");
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch(`${API_BASE}/kb/upload`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || "Upload failed");
            }
            const data = await res.json();
            // Auto-detect source type from content type
            let sourceType = "document";
            if (file.type === "application/pdf") sourceType = "pdf";
            else if (file.type.startsWith("image/")) sourceType = "manual";
            else if (file.type === "text/plain") sourceType = "document";
            setArticleForm(p => ({
                ...p,
                file_url: data.file_url,
                file_name: data.file_name,
                source_type: sourceType,
            }));
        } catch (err) { setError(err.message || "Upload failed"); }
        finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
    };

    const handleRemoveFile = () => {
        setArticleForm(p => ({ ...p, file_url: "", file_name: "", source_type: "manual" }));
    };

    const handleDeleteArticle = async (id, title) => {
        if (!window.confirm(`Delete article "${title}"?`)) return;
        setDeleting(id);
        try { await kbApi.deleteArticle(id); setArticles(prev => prev.filter(a => a.id !== id)); }
        catch (err) { alert(err.message); }
        finally { setDeleting(null); }
    };

    // ── Category CRUD ───────────────────────────────────────────

    const openCreateCategory = () => {
        setEditingCategory(null);
        setCategoryForm(emptyCategory);
        setError("");
        setShowCategoryModal(true);
    };

    const openEditCategory = (c) => {
        setEditingCategory(c);
        setCategoryForm({ name: c.name, description: c.description || "", icon: c.icon || "", sort_order: c.sort_order });
        setError("");
        setShowCategoryModal(true);
    };

    const handleSaveCategory = async (e) => {
        e.preventDefault();
        setSaving(true); setError("");
        try {
            if (editingCategory) {
                await kbApi.updateCategory(editingCategory.id, categoryForm);
            } else {
                await kbApi.createCategory(categoryForm);
            }
            setShowCategoryModal(false);
            load();
        } catch (err) { setError(err.message || "Failed"); }
        finally { setSaving(false); }
    };

    const handleDeleteCategory = async (id, name) => {
        if (!window.confirm(`Delete category "${name}"? It must have no articles.`)) return;
        setDeleting(id);
        try { await kbApi.deleteCategory(id); load(); }
        catch (err) { alert(err.message); }
        finally { setDeleting(null); }
    };

    const filtered = filterCategory ? articles.filter(a => a.category_id === filterCategory) : articles;

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
            <AdminSidebar />

            <main className="flex-1 flex flex-col overflow-y-auto">
                <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
                    <h2 className="text-lg font-bold">Knowledge Base</h2>
                    <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                        {me?.full_name?.charAt(0).toUpperCase() || "A"}
                    </div>
                </header>

                <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Total Articles", count: articles.length, icon: "article", color: "text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300" },
                            { label: "Published", count: articles.filter(a => a.is_published).length, icon: "check_circle", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400" },
                            { label: "Drafts", count: articles.filter(a => !a.is_published).length, icon: "edit_note", color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400" },
                            { label: "Categories", count: categories.length, icon: "folder", color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400" },
                        ].map(c => (
                            <div key={c.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${c.color}`}>
                                        <span className="material-symbols-outlined text-[20px]">{c.icon}</span>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{c.count}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{c.label}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Tabs & Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <button onClick={() => setActiveTab("articles")} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors border ${activeTab === "articles" ? "bg-primary text-white border-primary" : "bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700"}`}>
                                Articles
                            </button>
                            <button onClick={() => setActiveTab("categories")} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors border ${activeTab === "categories" ? "bg-primary text-white border-primary" : "bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700"}`}>
                                Categories
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            {activeTab === "articles" && (
                                <>
                                    <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none">
                                        <option value="">All Categories</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    <button onClick={openCreateArticle} className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm">
                                        <span className="material-symbols-outlined text-[18px]">add</span> New Article
                                    </button>
                                </>
                            )}
                            {activeTab === "categories" && (
                                <button onClick={openCreateCategory} className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm">
                                    <span className="material-symbols-outlined text-[18px]">add</span> New Category
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Articles Table */}
                    {activeTab === "articles" && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left whitespace-nowrap">
                                    <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                                        <tr>
                                            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Title</th>
                                            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</th>
                                            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Source</th>
                                            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Views</th>
                                            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {loading ? (
                                            <tr><td colSpan="6" className="px-6 py-16 text-center">
                                                <span className="material-symbols-outlined text-primary text-3xl animate-spin">progress_activity</span>
                                                <p className="text-sm text-slate-400 mt-2">Loading articles...</p>
                                            </td></tr>
                                        ) : filtered.length === 0 ? (
                                            <tr><td colSpan="6" className="px-6 py-16 text-center">
                                                <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 text-4xl">article</span>
                                                <p className="text-sm text-slate-400 mt-2">No articles found</p>
                                            </td></tr>
                                        ) : filtered.map(a => (
                                            <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{a.title}</p>
                                                        <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{a.content?.substring(0, 80)}...</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                                                        {a.category_name || "—"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="material-symbols-outlined text-[16px] text-slate-400">
                                                            {a.source_type === "pdf" ? "picture_as_pdf" : a.source_type === "document" ? "description" : "edit_note"}
                                                        </span>
                                                        <span className="text-xs text-slate-500 capitalize">{a.source_type || "manual"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase ${a.is_published ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500"}`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${a.is_published ? "bg-emerald-500" : "bg-amber-500"}`}></div>
                                                        {a.is_published ? "Published" : "Draft"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-slate-400">{a.view_count}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => openEditArticle(a)} className="text-primary hover:text-primary/80 text-xs font-bold transition-colors">Edit</button>
                                                        <button onClick={() => handleDeleteArticle(a.id, a.title)} disabled={deleting === a.id}
                                                            className="text-red-500 hover:text-red-700 text-xs font-bold transition-colors disabled:opacity-50">
                                                            {deleting === a.id ? "..." : "Delete"}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
                                <p className="text-xs text-slate-400 font-medium">Showing {filtered.length} of {articles.length} articles</p>
                            </div>
                        </div>
                    )}

                    {/* Categories Table */}
                    {activeTab === "categories" && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left whitespace-nowrap">
                                    <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                                        <tr>
                                            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</th>
                                            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Articles</th>
                                            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Order</th>
                                            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {categories.length === 0 ? (
                                            <tr><td colSpan="5" className="px-6 py-16 text-center">
                                                <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 text-4xl">folder_off</span>
                                                <p className="text-sm text-slate-400 mt-2">No categories yet</p>
                                            </td></tr>
                                        ) : categories.map(c => (
                                            <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-[20px]">{c.icon || "folder"}</span>
                                                        </div>
                                                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{c.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-slate-500 truncate max-w-xs">{c.description || "—"}</td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                        {articles.filter(a => a.category_id === c.id).length}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-slate-400">{c.sort_order}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => openEditCategory(c)} className="text-primary hover:text-primary/80 text-xs font-bold">Edit</button>
                                                        <button onClick={() => handleDeleteCategory(c.id, c.name)} disabled={deleting === c.id}
                                                            className="text-red-500 hover:text-red-700 text-xs font-bold disabled:opacity-50">
                                                            {deleting === c.id ? "..." : "Delete"}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Article Modal */}
            {showArticleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-bold">{editingArticle ? "Edit Article" : "New Article"}</h3>
                            <button onClick={() => setShowArticleModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSaveArticle} className="p-6 space-y-4">
                            {error && <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 px-4 py-2 rounded-xl text-sm">{error}</div>}

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Title *</label>
                                <input required value={articleForm.title} onChange={e => setArticleForm(p => ({ ...p, title: e.target.value }))}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Category *</label>
                                <select required value={articleForm.category_id} onChange={e => setArticleForm(p => ({ ...p, category_id: e.target.value }))}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary">
                                    <option value="">Select category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Content *</label>
                                <textarea required rows={6} value={articleForm.content} onChange={e => setArticleForm(p => ({ ...p, content: e.target.value }))}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-y" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Tags (comma separated)</label>
                                    <input value={articleForm.tags} onChange={e => setArticleForm(p => ({ ...p, tags: e.target.value }))}
                                        placeholder="academic, fees, registration"
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Source Type</label>
                                    <select value={articleForm.source_type} onChange={e => setArticleForm(p => ({ ...p, source_type: e.target.value }))}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary">
                                        <option value="manual">Manual</option>
                                        <option value="pdf">PDF</option>
                                        <option value="document">Document</option>
                                        <option value="webpage">Webpage</option>
                                    </select>
                                </div>
                            </div>

                            {/* File Upload */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Attachment (max 10 MB)</label>
                                {articleForm.file_url ? (
                                    <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl px-4 py-3">
                                        <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[20px]">check_circle</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 truncate">{articleForm.file_name}</p>
                                            <a href={articleForm.file_url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-emerald-500 hover:underline truncate block">View uploaded file</a>
                                        </div>
                                        <button type="button" onClick={handleRemoveFile} className="text-slate-400 hover:text-red-500 transition-colors" title="Remove file">
                                            <span className="material-symbols-outlined text-[18px]">close</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <input type="file" ref={fileInputRef} onChange={handleFileUpload}
                                            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.webp"
                                            disabled={uploading}
                                            className="hidden" id="kb-file-upload" />
                                        <label htmlFor="kb-file-upload"
                                            className={`flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-xl px-4 py-4 cursor-pointer transition-colors ${uploading
                                                ? "border-primary/40 bg-primary/5"
                                                : "border-slate-300 dark:border-slate-700 hover:border-primary hover:bg-primary/5"
                                                }`}>
                                            {uploading ? (
                                                <>
                                                    <span className="material-symbols-outlined text-primary text-[20px] animate-spin">progress_activity</span>
                                                    <span className="text-sm text-primary font-medium">Uploading to S3...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-slate-400 text-[20px]">cloud_upload</span>
                                                    <span className="text-sm text-slate-500 font-medium">Click to upload a file</span>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="is_published" checked={articleForm.is_published} onChange={e => setArticleForm(p => ({ ...p, is_published: e.target.checked }))}
                                    className="w-4 h-4 text-primary rounded border-slate-300" />
                                <label htmlFor="is_published" className="text-sm font-medium text-slate-700 dark:text-slate-300">Publish immediately</label>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowArticleModal(false)}
                                    className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
                                <button type="submit" disabled={saving}
                                    className="px-5 py-2 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
                                    {saving && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                                    {editingArticle ? "Update" : "Create"} Article
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Category Modal */}
            {showCategoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-bold">{editingCategory ? "Edit Category" : "New Category"}</h3>
                            <button onClick={() => setShowCategoryModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
                            {error && <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 px-4 py-2 rounded-xl text-sm">{error}</div>}

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Name *</label>
                                <input required value={categoryForm.name} onChange={e => setCategoryForm(p => ({ ...p, name: e.target.value }))}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Description</label>
                                <textarea rows={3} value={categoryForm.description} onChange={e => setCategoryForm(p => ({ ...p, description: e.target.value }))}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary resize-y" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Icon (Material symbol)</label>
                                    <input value={categoryForm.icon} onChange={e => setCategoryForm(p => ({ ...p, icon: e.target.value }))}
                                        placeholder="school"
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Sort Order</label>
                                    <input type="number" value={categoryForm.sort_order} onChange={e => setCategoryForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowCategoryModal(false)}
                                    className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
                                <button type="submit" disabled={saving}
                                    className="px-5 py-2 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
                                    {saving && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                                    {editingCategory ? "Update" : "Create"} Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
