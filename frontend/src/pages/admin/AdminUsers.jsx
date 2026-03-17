import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { userApi } from "../../services/api";
import AdminSidebar from "../../components/AdminSidebar";

const roleBadge = {
    student: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    staff: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    admin: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
    super_admin: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

export default function AdminUsers() {
    const { user: me, logout } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [showModal, setShowModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");
    const [deleting, setDeleting] = useState(null);

    const [form, setForm] = useState({
        email: "", full_name: "", password: "",
        role: "staff", employee_id: "", department: "", position: "",
    });

    useEffect(() => { loadUsers(); }, []);

    const loadUsers = async () => {
        setLoading(true);
        try { setUsers(await userApi.listAll()); }
        catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError("");
        setCreating(true);
        try {
            await userApi.createStaff(form);
            setShowModal(false);
            setForm({ email: "", full_name: "", password: "", role: "staff", employee_id: "", department: "", position: "" });
            loadUsers();
        } catch (err) {
            setError(err.message || "Failed to create user");
        } finally { setCreating(false); }
    };

    const handleDelete = async (userId, name) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;
        setDeleting(userId);
        try {
            await userApi.deleteUser(userId);
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (err) { alert(err.message || "Failed to delete user"); }
        finally { setDeleting(null); }
    };

    const filtered = filter === "all" ? users : users.filter(u => u.role === filter);
    const counts = {
        all: users.length,
        student: users.filter(u => u.role === "student").length,
        staff: users.filter(u => u.role === "staff").length,
        admin: users.filter(u => u.role === "admin").length,
    };

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">

            {/* Sidebar */}
            <AdminSidebar />

            {/* Main */}
            <main className="flex-1 flex flex-col overflow-y-auto">
                <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
                    <h2 className="text-lg font-bold">User Management</h2>
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                            {me?.full_name?.charAt(0).toUpperCase() || "A"}
                        </div>
                    </div>
                </header>

                <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">

                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold">All Users</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage staff accounts and student records</p>
                        </div>
                        <button onClick={() => setShowModal(true)}
                            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm">
                            <span className="material-symbols-outlined text-[18px]">person_add</span>
                            Add Staff Member
                        </button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Total", count: counts.all, icon: "group", color: "text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300" },
                            { label: "Students", count: counts.student, icon: "school", color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400" },
                            { label: "Staff", count: counts.staff, icon: "badge", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400" },
                            { label: "Admins", count: counts.admin, icon: "admin_panel_settings", color: "text-purple-600 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400" },
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

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {["all", "student", "staff", "admin"].map(s => (
                            <button key={s} onClick={() => setFilter(s)}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold capitalize transition-colors border ${filter === s
                                    ? "bg-primary text-white border-primary"
                                    : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    }`}>
                                {s === "all" ? `All (${counts.all})` : `${s} (${counts[s] || 0})`}
                            </button>
                        ))}
                    </div>

                    {/* User Table */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Details</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Joined</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {loading ? (
                                        <tr><td colSpan="6" className="px-6 py-16 text-center">
                                            <span className="material-symbols-outlined text-primary text-3xl animate-spin">progress_activity</span>
                                            <p className="text-sm text-slate-400 mt-2">Loading users...</p>
                                        </td></tr>
                                    ) : filtered.length === 0 ? (
                                        <tr><td colSpan="6" className="px-6 py-16 text-center">
                                            <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 text-4xl">group_off</span>
                                            <p className="text-sm text-slate-400 mt-2">No users found</p>
                                        </td></tr>
                                    ) : filtered.map(u => (
                                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-white font-bold text-sm flex items-center justify-center">
                                                        {u.full_name?.charAt(0).toUpperCase() || "?"}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{u.full_name}</p>
                                                        <p className="text-xs text-slate-400 dark:text-slate-500">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${roleBadge[u.role] || roleBadge.student}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                                                {u.role === "student" ? (
                                                    <span>{u.student_profile?.registration_number || "—"} · {u.student_profile?.faculty || ""}</span>
                                                ) : (
                                                    <span>{u.staff_profile?.employee_id || "—"} · {u.staff_profile?.department || ""}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase ${u.is_active ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${u.is_active ? "bg-emerald-500" : "bg-red-500"}`}></div>
                                                    {u.is_active ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-400 dark:text-slate-500">
                                                {new Date(u.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {u.id !== me?.id && (
                                                    <button onClick={() => handleDelete(u.id, u.full_name)}
                                                        disabled={deleting === u.id}
                                                        className="inline-flex items-center gap-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 text-xs font-bold transition-colors disabled:opacity-50">
                                                        <span className="material-symbols-outlined text-[16px]">
                                                            {deleting === u.id ? "progress_activity" : "delete"}
                                                        </span>
                                                        Delete
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
                            <p className="text-xs text-slate-400 font-medium">Showing {filtered.length} of {users.length} users</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Add Staff Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Staff Member</h3>
                            <button onClick={() => { setShowModal(false); setError(""); }}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            {error && (
                                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 px-4 py-2 rounded-xl text-sm">{error}</div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Full Name *</label>
                                    <input required value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Email *</label>
                                    <input required type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Password *</label>
                                <input required type="password" minLength={6} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Role *</label>
                                    <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary">
                                        <option value="staff">Staff</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Employee ID *</label>
                                    <input required value={form.employee_id} onChange={e => setForm(p => ({ ...p, employee_id: e.target.value }))}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Department *</label>
                                    <input required value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Position</label>
                                    <input value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value }))}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => { setShowModal(false); setError(""); }}
                                    className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={creating}
                                    className="px-5 py-2 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                                    {creating && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                                    Create User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
