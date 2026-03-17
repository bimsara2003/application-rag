import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(location.state?.message || "");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);
        try {
            await login(email, password);
            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
            {/* Left Sidebar */}
            <div className="relative hidden lg:flex flex-col justify-between p-12 bg-primary overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0"
                        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}>
                    </div>
                </div>
                <div className="relative z-10">
                    <Link to="/" className="flex items-center gap-3 text-white hover:opacity-90 transition-opacity">
                        <span className="material-symbols-outlined text-4xl font-bold">school</span>
                        <h1 className="text-2xl font-bold tracking-tight">CAMPUS Support</h1>
                    </Link>
                </div>
                <div className="relative z-10 max-w-md">
                    <h2 className="text-4xl font-extrabold text-white leading-tight mb-6">Empowering Your Academic Journey.</h2>
                    <p className="text-white/80 text-lg leading-relaxed">
                        Join the CAMPUS Support Desk community to get priority assistance, access technical resources, and
                        resolve academic inquiries seamlessly.
                    </p>
                </div>
                <div className="relative z-10 flex items-center gap-4">
                    <div className="flex -space-x-3">
                        <img alt="Student 1" className="h-10 w-10 rounded-full border-2 border-primary object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD74OOslal8kYmtvt4rjWF-hcE3zkZBOsWeEf2qIu0-1iqjzSyxlJP9iRb_B7VDempmxbHBOwFk80bHs-lLikowNHHV8fqqFzMNxr17Z3Jzy8z_w1vbcPsxb-orx7jC1SOYfnq_501ad93QCUVT3hGTqLG1YqOXQXN6KYTBI7dFwGOLhUNsn37SdZtit4TIWCZKn49elshpzT9JKURes_mbuBWKXvf1KGOI6WIP_lRAUMFv8EVgLvnDQLSTF9z7GrEqzWzAKUuM0Uh1" />
                        <img alt="Student 2" className="h-10 w-10 rounded-full border-2 border-primary object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuARshsTtmGG9wOd0NCFfZiuT6GfA0EeMyo1BomjFv3wlrfzxnffKbFmA75ubVp43ywH7skLXlWpNawdCWkt6uTIZ-estJ5TfMLn9YpLm_YnQa7suSfyv0s5acWLEobxVN6_0UR4CVoQjNu_BgWeKGaWpvkQPdViuU7vNzNqUgOEaibtKtsYVnKVzOIv5JCoahk5f89zBMV1vC0trGopjPGzxfnQL7TKOk1GNwnn6Bb_L_6t9fGV1YH9ShCHyJYsYm4ZDRRc2yBFd04e" />
                        <img alt="Student 3" className="h-10 w-10 rounded-full border-2 border-primary object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7FNSyWA3kA6fy5byT0nV_AuIC1MdLOMbi-nZpXormxrXH6m5K6XlDwOOgSxvz5on-bvzaIfx2el3lNbAyuEPE7INeoBW6Z_DfAedUcTC7ApS7cNNul2a_B2Tvfyp2X8ByuoU4DET0rQ9zYbHoiadVg-XgsaDTCM-E0LOMLoQHljD9zv5whYIjQrTYZQbhbO464yHRmAHlzF4Gmo9PPcUc6LRd0qIdAbNhDX58goQTwPIg5tIMzd5BE8XcpNLqV8z6S5js9TxK5Di_" />
                    </div>
                    <p className="text-white/70 text-sm font-medium">Joined by 5,00+ students this semester</p>
                </div>
            </div>

            {/* Right Form Container */}
            <div className="flex flex-col justify-center p-8 lg:p-16 bg-white dark:bg-slate-900 overflow-y-auto">
                {/* Mobile text logo (shown only on small screens) */}
                <div className="lg:hidden text-center mb-10">
                    <Link to="/" className="inline-flex items-center gap-2">
                        <div className="bg-primary p-2 rounded-xl">
                            <span className="material-symbols-outlined text-white text-2xl">school</span>
                        </div>
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">SLIIT Support</span>
                    </Link>
                </div>

                <div className="w-full max-w-xl mx-auto">
                    <div className="mb-10">
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Welcome Back</h2>
                        <p className="text-slate-500 dark:text-slate-400">Sign in to your student account to access the support desk.</p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">check_circle</span>
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="email">
                                Institutional Email
                            </label>
                            <input
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none dark:text-white"
                                id="email"
                                type="email"
                                placeholder="it24xxxxxx@my.campus.lk"
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
                                <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <input
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none dark:text-white"
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
                            className="w-full mt-8 py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/30 hover:bg-primary/90 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Don't have an account?{" "}
                            <Link to="/register" className="text-primary font-bold ml-1 hover:underline">
                                Create one
                            </Link>
                        </p>
                    </div>

                    <footer className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                        <span>© {new Date().getFullYear()} CAMPUS IT Services</span>
                        <div className="flex gap-4">
                            <Link to="/" className="hover:text-primary transition-colors">Help Center</Link>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
}
