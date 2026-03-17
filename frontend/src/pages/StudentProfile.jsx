import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userApi } from "../services/api";
import Navbar from "../components/Navbar";

export default function StudentProfile() {
    const { user, setUser, logout } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ full_name: "", phone: "" });
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (user) {
            setForm({
                full_name: user.full_name || "",
                phone: user.phone || "",
            });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            const updated = await userApi.updateProfile({
                full_name: form.full_name,
                phone: form.phone || null,
            });
            // Update context so the navbar reflects the new name
            setUser(updated);
            setSuccess("Profile updated successfully!");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.message || "Failed to update profile");
        } finally { setSaving(false); }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Navbar />
            <div className="max-w-xl mx-auto px-4 py-10">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold mx-auto shadow-lg">
                        {user.full_name?.charAt(0).toUpperCase() || "S"}
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-4">My Profile</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Update your personal information</p>
                </div>

                {/* Profile Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

                    {/* Read-only Info */}
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 space-y-3">
                        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Account Details</h3>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500 dark:text-slate-400">Email</span>
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{user.email}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500 dark:text-slate-400">Role</span>
                            <span className="text-sm font-semibold text-primary capitalize">{user.role}</span>
                        </div>
                        {user.student_profile && (
                            <>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Reg. Number</span>
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white font-mono">{user.student_profile.registration_number}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Faculty</span>
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{user.student_profile.faculty}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Campus</span>
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{user.student_profile.campus}</span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Editable Fields */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Editable Information</h3>

                        {success && (
                            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                {success}
                            </div>
                        )}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">error</span>
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                            <input
                                required minLength={2} maxLength={100}
                                value={form.full_name}
                                onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Mobile Number</label>
                            <input
                                value={form.phone}
                                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                placeholder="+94XXXXXXXXX"
                            />
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Format: +94 followed by 9 digits (e.g. +94771234567)</p>
                        </div>

                        <button type="submit" disabled={saving}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm">
                            {saving ? (
                                <>
                                    <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-sm">save</span>
                                    Save Changes
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Sign Out */}
                <button onClick={async () => { await logout(); navigate("/login"); }}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 dark:border-red-500/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 text-sm font-semibold transition-colors">
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Sign Out
                </button>
            </div>
        </div>
    );
}
