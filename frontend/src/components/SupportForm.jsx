import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { ticketApi } from "../services/api";

export default function SupportForm() {
    const { user, isAuthenticated } = useAuth();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        registration_number: "",
        faculty: "",
        campus: "",
        phone: "",
        department: "",
        subject: "",
        message: ""
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    // Pre-fill data if user is authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            setFormData(prev => ({
                ...prev,
                name: user.full_name || "",
                email: user.email || "",
                // Note: user object from context might not have student profile fields directly
                // depending on how /users/me is implemented. It's fine if they are blank 
                // because the API only requires subject, message, and department.
            }));
        }
    }, [isAuthenticated, user]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // The API only expects subject, message, and department.
            // Other fields are inferred from the authenticated user context on the backend.
            await ticketApi.create({
                subject: formData.subject,
                message: formData.message,
                department: formData.department
            });

            setSuccess(true);
            // Optionally, reset just the message/subject, keep the profile data
            setFormData(prev => ({ ...prev, subject: "", message: "" }));
        } catch (err) {
            setError(err.message || "Failed to submit ticket. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <main className="relative min-h-screen py-12 px-4 md:px-12 overflow-hidden flex items-center justify-center">
                <div className="relative z-10 w-full max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-10 text-center">
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl">check_circle</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Ticket Submitted Successfully!</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">
                        Our support team has received your inquiry and will get back to you shortly. You can track its status in your dashboard.
                    </p>
                    <button
                        onClick={() => window.location.href = '/dashboard'}
                        className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl text-sm transition-all shadow-lg active:scale-95 cursor-pointer"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="relative min-h-screen py-12 px-4 md:px-12 overflow-hidden">
            <div className="absolute inset-0 glass-bg scale-105 blur-sm brightness-[0.9] opacity-30 dark:brightness-50"></div>
            <div className="relative z-10 w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {/* Header */}
                <div className="p-8 md:p-10 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <span className="material-symbols-outlined text-primary text-2xl">mail</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Campus Student Support
                        </h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Please complete this form and one of our agents will reply to you as soon as possible.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-10">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium flex items-center gap-3 border border-red-200 dark:border-red-800/30">
                            <span className="material-symbols-outlined text-red-500">error</span>
                            {error}
                        </div>
                    )}

                    {!isAuthenticated && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 p-4 rounded-xl text-sm font-medium flex items-center justify-between border border-amber-200 dark:border-amber-800/30">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined">warning</span>
                                You must be logged in to track the status of your ticket.
                            </div>
                            <button type="button" onClick={() => window.location.href = '/login'} className="underline font-bold hover:text-amber-800">Log in</button>
                        </div>
                    )}

                    {/* Name & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="name">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                                id="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                type="text"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="email">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${isAuthenticated
                                        ? "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 cursor-not-allowed"
                                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary focus:border-primary dark:text-white"
                                    }`}
                                id="email"
                                value={formData.email}
                                onChange={handleChange}
                                readOnly={isAuthenticated}
                                placeholder="e.g. it24xxxxxx@my.sliit.lk"
                                type="email"
                                required
                            />
                        </div>
                    </div>

                    {/* Information fields for non-logged in or additional contexts */}
                    {!isAuthenticated && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="registration_number">
                                    Registration <span className="text-red-500">*</span>
                                </label>
                                <input
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                                    id="registration_number"
                                    value={formData.registration_number}
                                    onChange={handleChange}
                                    placeholder="IT24xxx"
                                    type="text"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="faculty">
                                    Faculty <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        className="appearance-none w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                                        id="faculty"
                                        value={formData.faculty}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select</option>
                                        <option value="computing">Computing</option>
                                        <option value="business">Business</option>
                                        <option value="engineering">Engineering</option>
                                        <option value="humanities">Humanities</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        expand_more
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="phone">
                                    Phone <span className="text-red-500">*</span>
                                </label>
                                <input
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                                    id="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+94 7X XXX"
                                    type="tel"
                                />
                            </div>
                        </div>
                    )}

                    {/* Department */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="department">
                            Department Inquiry <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                id="department"
                                value={formData.department}
                                onChange={handleChange}
                                required
                                className="appearance-none w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                            >
                                <option value="" disabled>Select the department you need help from</option>
                                <option value="administrative">Student Services & Administration</option>
                                <option value="financial">Finance & Payments</option>
                                <option value="academic">Examinations & Academics</option>
                                <option value="technical">Information Technology</option>
                                <option value="library">Library Services</option>
                                <option value="other">Other Inquiry</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                expand_more
                            </span>
                        </div>
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="subject">
                            Subject <span className="text-red-500">*</span>
                        </label>
                        <input
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                            id="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="Brief summary of your inquiry (e.g. Account Locked)"
                            type="text"
                            required
                        />
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="message">
                            Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                            id="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Describe your issue or request in detail..."
                            rows="5"
                            required
                        ></textarea>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col-reverse sm:flex-row items-center gap-4 pt-4">
                        <button
                            onClick={() => setFormData(prev => ({ ...prev, subject: "", message: "", department: "" }))}
                            className="w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                            type="button"
                        >
                            Reset
                        </button>
                        <button
                            className="w-full sm:w-auto sm:flex-1 px-8 py-3 rounded-xl font-semibold text-white bg-primary disabled:bg-primary/50 disabled:cursor-not-allowed hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            type="submit"
                            disabled={loading || !isAuthenticated} // Backend currently requires auth
                        >
                            {loading ? "Submitting..." : "Submit Ticket"}
                            <span className="material-symbols-outlined text-sm">send</span>
                        </button>
                    </div>
                </form>

                {/* Footer */}
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 text-center border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-400">
                        © 2024 Campus Support Desk. All rights reserved.
                    </p>
                </div>
            </div>
        </main>
    );
}
