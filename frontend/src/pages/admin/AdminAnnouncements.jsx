import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { announcementApi } from "../../services/api";
import AdminSidebar from "../../components/AdminSidebar";

const priorityConfig = {
    low: { label: "Low", color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400", icon: "arrow_downward" },
    normal: { label: "Normal", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: "remove" },
    high: { label: "High", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: "arrow_upward" },
    critical: { label: "Critical", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: "priority_high" },
};

export default function AdminAnnouncements() {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const emptyForm = { title: "", content: "", priority: "normal", is_active: true, expires_at: "" };
    const [form, setForm] = useState(emptyForm);

    useEffect(() => { loadAnnouncements(); }, []);

    const loadAnnouncements = async () => {
        setLoading(true);
        try {
            const data = await announcementApi.listAll();
            setAnnouncements(data);
        } catch { /* handled globally */ }
        finally { setLoading(false); }
    };

    const openCreateForm = () => {
        setEditing(null);
        setForm(emptyForm);
        setShowForm(true);
        setError("");
    };

    const openEditForm = (ann) => {
        setEditing(ann);
        setForm({
            title: ann.title,
            content: ann.content,
            priority: ann.priority,
            is_active: ann.is_active,
            expires_at: ann.expires_at ? ann.expires_at.slice(0, 16) : "",
        });
        setShowForm(true);
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            // Validate expiration date
            if (form.expires_at) {
                const expiryDate = new Date(form.expires_at);
                if (expiryDate < new Date()) {
                    throw new Error("Expiration date cannot be in the past");
                }
            }

            const payload = {
                title: form.title,
                content: form.content,
                priority: form.priority,
                is_active: form.is_active,
                expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
            };

            if (editing) {
                await announcementApi.update(editing.id, payload);
            } else {
                await announcementApi.create(payload);
            }
            setShowForm(false);
            await loadAnnouncements();
        } catch (err) {
            setError(err.message || "Failed to save announcement");
        } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this announcement?")) return;
        try {
            await announcementApi.delete(id);
            await loadAnnouncements();
        } catch { /* handled globally */ }
    };

    const handleToggleActive = async (ann) => {
        try {
            await announcementApi.update(ann.id, { is_active: !ann.is_active });
            await loadAnnouncements();
        } catch { /* handled globally */ }
    };

    const isExpired = (ann) => ann.expires_at && new Date(ann.expires_at) < new Date();

    return (
        <div className="flex h-screen bg-background-light dark:bg-background-dark">
            <AdminSidebar />
            <div className="flex-1 overflow-y-auto">
                {/* Top Bar */}
                <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-2xl">campaign</span>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Announcements</h1>
                        <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">{announcements.length}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-sm overflow-hidden">
                                {user?.profile_picture ? (
                                    <img src={user.profile_picture} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    user?.full_name?.charAt(0).toUpperCase() || "A"
                                )}
                            </div>
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 hidden sm:inline">{user?.full_name}</span>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    {/* Action Bar */}
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Manage campus-wide announcements and alerts</p>
                        <button onClick={openCreateForm}
                            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95">
                            <span className="material-symbols-outlined text-lg">add</span>
                            New Announcement
                        </button>
                    </div>

                    {/* Modal / Form */}
                    {showForm && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                        {editing ? "Edit Announcement" : "Create Announcement"}
                                    </h2>
                                    <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                        <span className="material-symbols-outlined text-slate-400">close</span>
                                    </button>
                                </div>
                                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                    {error && (
                                        <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-200 dark:border-red-500/20 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">error</span>{error}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Title</label>
                                        <input required minLength={5} maxLength={200} value={form.title}
                                            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                            placeholder="e.g. System Maintenance Notice" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Content</label>
                                        <textarea required minLength={10} value={form.content} rows={4}
                                            onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
                                            placeholder="Announcement details..." />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Priority</label>
                                            <select value={form.priority}
                                                onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors">
                                                <option value="low">Low</option>
                                                <option value="normal">Normal</option>
                                                <option value="high">High</option>
                                                <option value="critical">Critical</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Expires At</label>
                                            <input type="datetime-local" value={form.expires_at}
                                                min={new Date().toISOString().slice(0, 16)}
                                                onChange={e => setForm(p => ({ ...p, expires_at: e.target.value }))}
                                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
                                            <p className="text-[11px] text-slate-400 mt-1">Leave empty for no expiry</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button type="button" onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_active ? "bg-primary" : "bg-slate-300 dark:bg-slate-600"}`}>
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${form.is_active ? "translate-x-6" : "translate-x-1"}`} />
                                        </button>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {form.is_active ? "Active — visible to students" : "Inactive — hidden from students"}
                                        </span>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button type="button" onClick={() => setShowForm(false)}
                                            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            Cancel
                                        </button>
                                        <button type="submit" disabled={saving}
                                            className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                            {saving ? (
                                                <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>Saving...</>
                                            ) : (
                                                <><span className="material-symbols-outlined text-sm">save</span>{editing ? "Update" : "Create"}</>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Table */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center text-slate-400">
                                <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
                                <p className="mt-2">Loading announcements...</p>
                            </div>
                        ) : announcements.length === 0 ? (
                            <div className="p-12 text-center">
                                <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 text-5xl">campaign</span>
                                <p className="mt-3 text-slate-500 dark:text-slate-400">No announcements yet</p>
                                <button onClick={openCreateForm} className="mt-4 inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline">
                                    Create your first announcement
                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {announcements.map(ann => {
                                    const pCfg = priorityConfig[ann.priority] || priorityConfig.normal;
                                    const expired = isExpired(ann);
                                    return (
                                        <div key={ann.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                        <h3 className="font-bold text-slate-900 dark:text-white truncate">{ann.title}</h3>
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${pCfg.color}`}>
                                                            {pCfg.label}
                                                        </span>
                                                        {ann.is_active && !expired ? (
                                                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Active</span>
                                                        ) : expired ? (
                                                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">Expired</span>
                                                        ) : (
                                                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">Inactive</span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{ann.content}</p>
                                                    <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                                                        <span className="flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-sm">person</span>
                                                            {ann.author_name || "Unknown"}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-sm">schedule</span>
                                                            {new Date(ann.created_at).toLocaleDateString()}
                                                        </span>
                                                        {ann.expires_at && (
                                                            <span className="flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-sm">timer</span>
                                                                Expires {new Date(ann.expires_at).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <button onClick={() => handleToggleActive(ann)} title={ann.is_active ? "Deactivate" : "Activate"}
                                                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                                        <span className={`material-symbols-outlined text-lg ${ann.is_active ? "text-emerald-500" : "text-slate-400"}`}>
                                                            {ann.is_active ? "visibility" : "visibility_off"}
                                                        </span>
                                                    </button>
                                                    <button onClick={() => openEditForm(ann)} title="Edit"
                                                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                                        <span className="material-symbols-outlined text-lg text-blue-500">edit</span>
                                                    </button>
                                                    <button onClick={() => handleDelete(ann.id)} title="Delete"
                                                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                                                        <span className="material-symbols-outlined text-lg text-red-500">delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
