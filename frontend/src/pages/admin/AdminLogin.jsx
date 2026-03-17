import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { adminLogin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await adminLogin(email, password);
            navigate("/admin/dashboard");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
            {/* Left Sidebar */}
            <div className="relative hidden lg:flex flex-col justify-between p-12 bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0"
                        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}>
                    </div>
                </div>
                <div className="relative z-10">
                    <Link to="/" className="flex items-center gap-3 text-white hover:opacity-90 transition-opacity">
                        <span className="material-symbols-outlined text-4xl font-bold">admin_panel_settings</span>
                        <h1 className="text-2xl font-bold tracking-tight">CAMPUS Admin</h1>
                    </Link>
                </div>
                <div className="relative z-10 max-w-md">
                    <h2 className="text-4xl font-extrabold text-white leading-tight mb-6">Manage Support Infrastructure.</h2>
                    <p className="text-white/80 text-lg leading-relaxed">
                        Securely access the CAMPUS Support Desk administrator portal to manage tickets, knowledge base articles, and system settings.
                    </p>
                </div>
                <div className="relative z-10 flex items-center gap-4">
                    <p className="text-white/70 text-sm font-medium">Authorized Personnel Only</p>
                </div>
            </div>

            {/* Right Form Container */}
            <div className="flex flex-col justify-center p-8 lg:p-16 bg-white dark:bg-slate-900 overflow-y-auto">
                {/* Mobile text logo (shown only on small screens) */}
                <div className="lg:hidden text-center mb-10">
                    <Link to="/" className="inline-flex items-center gap-2">
                        <div className="bg-slate-900 p-2 rounded-xl">
                            <span className="material-symbols-outlined text-white text-2xl">admin_panel_settings</span>
                        </div>
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">CAMPUS Admin</span>
                    </Link>
                </div>

                <div className="w-full max-w-xl mx-auto">
                    <div className="mb-10">
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Staff Login</h2>
                        <p className="text-slate-500 dark:text-slate-400">Sign in to the administrative support desk.</p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="email">
                                Staff Email
                            </label>
                            <input
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all text-sm outline-none dark:text-white dark:focus:border-slate-100"
                                id="email"
                                type="email"
                                placeholder="staff@my.campus.lk"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="password">
                                    Password
                                </label>
                                <Link to="/forgot-password" className="text-xs font-medium text-slate-900 hover:underline dark:text-slate-300">
                                    Forgot password?
                                </Link>
                            </div>
                            <input
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all text-sm outline-none dark:text-white dark:focus:border-slate-100"
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-8 py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-xl font-bold text-lg shadow-lg shadow-slate-900/30 hover:bg-slate-800 dark:hover:bg-slate-700 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border dark:border-slate-700"
                        >
                            {loading ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                                    Authenticating...
                                </>
                            ) : (
                                "Sign In to Admin Portal"
                            )}
                        </button>
                    </form>

                    <footer className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                        <span>© {new Date().getFullYear()} CAMPUS IT Services</span>
                        <div className="flex gap-4">
                            <Link to="/login" className="hover:text-slate-900 dark:hover:text-white transition-colors">Student Login</Link>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
}
