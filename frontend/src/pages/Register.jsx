import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        full_name: "",
        email: "",
        password: "",
        confirmPassword: "",
        registration_number: "",
        faculty: "",
        campus: "",
        phone: "",
    });

    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const { confirmPassword, ...data } = form;
            // Only send phone if filled, and strip spaces for backend regex validation
            if (data.phone) {
                data.phone = data.phone.replace(/[\s-]/g, "");
            } else {
                delete data.phone;
            }
            await register(data);
            navigate("/login", { state: { message: "Registration successful. Please log in." } });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white";
    const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-300";

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
                        <h1 className="text-2xl font-bold tracking-tight">SLIIT Support</h1>
                    </Link>
                </div>
                <div className="relative z-10 max-w-md">
                    <h2 className="text-4xl font-extrabold text-white leading-tight mb-6">Empowering Your Academic Journey.</h2>
                    <p className="text-white/80 text-lg leading-relaxed">
                        Join the SLIIT Support Desk community to get priority assistance, access technical resources, and
                        resolve academic inquiries seamlessly.
                    </p>
                </div>
                <div className="relative z-10 flex items-center gap-4">
                    <div className="flex -space-x-3">
                        <img alt="Student 1" className="h-10 w-10 rounded-full border-2 border-primary object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD74OOslal8kYmtvt4rjWF-hcE3zkZBOsWeEf2qIu0-1iqjzSyxlJP9iRb_B7VDempmxbHBOwFk80bHs-lLikowNHHV8fqqFzMNxr17Z3Jzy8z_w1vbcPsxb-orx7jC1SOYfnq_501ad93QCUVT3hGTqLG1YqOXQXN6KYTBI7dFwGOLhUNsn37SdZtit4TIWCZKn49elshpzT9JKURes_mbuBWKXvf1KGOI6WIP_lRAUMFv8EVgLvnDQLSTF9z7GrEqzWzAKUuM0Uh1" />
                        <img alt="Student 2" className="h-10 w-10 rounded-full border-2 border-primary object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuARshsTtmGG9wOd0NCFfZiuT6GfA0EeMyo1BomjFv3wlrfzxnffKbFmA75ubVp43ywH7skLXlWpNawdCWkt6uTIZ-estJ5TfMLn9YpLm_YnQa7suSfyv0s5acWLEobxVN6_0UR4CVoQjNu_BgWeKGaWpvkQPdViuU7vNzNqUgOEaibtKtsYVnKVzOIv5JCoahk5f89zBMV1vC0trGopjPGzxfnQL7TKOk1GNwnn6Bb_L_6t9fGV1YH9ShCHyJYsYm4ZDRRc2yBFd04e" />
                        <img alt="Student 3" className="h-10 w-10 rounded-full border-2 border-primary object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7FNSyWA3kA6fy5byT0nV_AuIC1MdLOMbi-nZpXormxrXH6m5K6XlDwOOgSxvz5on-bvzaIfx2el3lNbAyuEPE7INeoBW6Z_DfAedUcTC7ApS7cNNul2a_B2Tvfyp2X8ByuoU4DET0rQ9zYbHoiadVg-XgsaDTCM-E0LOMLoQHljD9zv5whYIjQrTYZQbhbO464yHRmAHlzF4Gmo9PPcUc6LRd0qIdAbNhDX58goQTwPIg5tIMzd5BE8XcpNLqV8z6S5js9TxK5Di_" />
                    </div>
                    <p className="text-white/70 text-sm font-medium">Joined by 5,000+ students this semester</p>
                </div>
            </div>

            {/* Right Form Container */}
            <div className="flex flex-col justify-center p-8 lg:p-16 bg-white dark:bg-slate-900 overflow-y-auto">
                {/* Mobile text logo (shown only on small screens since sidebar is hidden) */}
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
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Create Student Account</h2>
                        <p className="text-slate-500 dark:text-slate-400">Please provide your academic details to get started with the support desk.</p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Section 1: Personal Information */}
                        <section>
                            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-2">
                                <span className="material-symbols-outlined text-primary">person</span>
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-sm">Personal Information</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                                    <input className={inputClass} placeholder="John Doe" type="text" value={form.full_name} onChange={set("full_name")} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Student ID</label>
                                    <input className={inputClass} placeholder="e.g. IT24103190" type="text" value={form.registration_number} onChange={set("registration_number")} required />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Faculty</label>
                                    <div className="relative">
                                        <select className={`${inputClass} appearance-none`} value={form.faculty} onChange={set("faculty")} required>
                                            <option value="" disabled>Select your faculty</option>
                                            <option value="computing">Faculty of Computing</option>
                                            <option value="business">SLIIT Business School</option>
                                            <option value="engineering">Faculty of Engineering</option>
                                            <option value="humanities">Faculty of Humanities & Sciences</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Campus</label>
                                    <div className="relative">
                                        <select className={`${inputClass} appearance-none`} value={form.campus} onChange={set("campus")} required>
                                            <option value="" disabled>Select your campus</option>
                                            <option value="malabe">Malabe Campus</option>
                                            <option value="metro">Metro Campus</option>
                                            <option value="matara">Matara Center</option>
                                            <option value="kandy">Kandy Center</option>
                                            <option value="kurunegala">Kurunegala Center</option>
                                            <option value="jaffna">Jaffna Center</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Account Security */}
                        <section>
                            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-2">
                                <span className="material-symbols-outlined text-primary">security</span>
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-sm">Account Security</h3>
                            </div>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Institutional Email</label>
                                        <input className={inputClass} placeholder="it24xxxxxx@my.sliit.lk" type="email" value={form.email} onChange={set("email")} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                                        <input className={inputClass} placeholder="+94 7X XXX XXXX" type="tel" value={form.phone} onChange={set("phone")} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                                        <input className={inputClass} placeholder="Minimum 8 characters" type="password" minLength={8} value={form.password} onChange={set("password")} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confirm Password</label>
                                        <input className={inputClass} placeholder="Repeat password" type="password" minLength={8} value={form.confirmPassword} onChange={set("confirmPassword")} required />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="pt-4">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input className="mt-1 rounded border-slate-300 text-primary focus:ring-primary" type="checkbox" required />
                                <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    I agree to the <a className="text-primary hover:underline" href="#">Terms of Service</a> and
                                    <a className="text-primary hover:underline" href="#">Privacy Policy</a> of the SLIIT Support Desk.
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/30 hover:bg-primary/90 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                                    Creating Account...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Already have an account?
                            <Link to="/login" className="text-primary font-bold ml-1 hover:underline">Back to Login</Link>
                        </p>
                    </div>

                    <footer className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                        <span>© {new Date().getFullYear()} SLIIT IT Services</span>
                        <div className="flex gap-4">
                            <Link to="/" className="hover:text-primary transition-colors">Help Center</Link>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
}
