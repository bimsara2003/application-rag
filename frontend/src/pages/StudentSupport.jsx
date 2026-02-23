import { Link } from "react-router-dom";
import Hero from "../components/Hero";

export default function StudentSupport() {
    return (
        <div className="font-display bg-background-light dark:bg-background-dark min-h-screen text-slate-800 dark:text-slate-200 transition-colors duration-300">
            {/* Nav */}
            <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="bg-primary p-1.5 rounded-lg">
                                <span className="material-symbols-outlined text-white">school</span>
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white hidden sm:inline">
                                SLIIT Support Desk
                            </span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            to="/student-support"
                            className="hidden md:flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all"
                        >
                            Contact SLIIT Student Support
                        </Link>
                        <div className="flex items-center gap-2 border-l pl-4 border-slate-200 dark:border-slate-700">
                            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                <span className="material-symbols-outlined text-sm">person</span>
                            </div>
                            <span className="text-sm font-medium hidden sm:inline">IW</span>
                            <span className="material-symbols-outlined text-sm">expand_more</span>
                        </div>
                    </div>
                </div>
            </nav>

            <Hero />

            {/* Breadcrumb */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center text-sm font-medium">
                        <Link to="/" className="text-slate-500 hover:text-primary transition-colors">
                            Help Center
                        </Link>
                        <span className="material-symbols-outlined text-slate-400 mx-2 text-sm">
                            chevron_right
                        </span>
                        <span className="text-slate-900 dark:text-white border-b-2 border-primary pb-3 -mb-[13px]">
                            Contact SLIIT Student Support
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Form */}
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
                                SLIIT Student Support
                            </h1>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Please complete this form and one of our agents will reply to you as soon as possible.
                        </p>
                    </div>

                    {/* Form */}
                    <form className="p-8 md:p-10 space-y-8">
                        {/* Name & Email */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="name">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                                    id="name"
                                    placeholder="Enter your full name"
                                    type="text"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="email">
                                        Email
                                    </label>
                                    <a className="text-xs font-medium text-primary hover:underline" href="#">
                                        Manage my email addresses
                                    </a>
                                </div>
                                <input
                                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 cursor-not-allowed outline-none transition-all"
                                    id="email"
                                    readOnly
                                    type="email"
                                    defaultValue="it24103190@my.sliit.lk"
                                />
                            </div>
                        </div>

                        {/* Registration Number */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="reg_number">
                                Registration number <span className="text-red-500">*</span>
                            </label>
                            <input
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                                id="reg_number"
                                placeholder="e.g. IT24000000"
                                type="text"
                            />
                        </div>

                        {/* Faculty */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="faculty">
                                Faculty / School <span className="text-red-500">*</span>
                            </label>
                            <p className="text-xs text-slate-500 mb-2">Please select your faculty</p>
                            <div className="relative">
                                <select
                                    className="appearance-none w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                                    id="faculty"
                                >
                                    <option value="">Select your faculty</option>
                                    <option value="computing">Faculty of Computing</option>
                                    <option value="business">SLIIT Business School</option>
                                    <option value="engineering">Faculty of Engineering</option>
                                    <option value="humanities">Faculty of Humanities &amp; Sciences</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    expand_more
                                </span>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="phone">
                                Contact number <span className="text-red-500">*</span>
                            </label>
                            <p className="text-xs text-slate-500 mb-2">Enter your mobile telephone number</p>
                            <input
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                                id="phone"
                                placeholder="+94 7X XXX XXXX"
                                type="tel"
                            />
                        </div>

                        {/* Department & Campus */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Department <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select className="appearance-none w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white">
                                        <option>Student Services</option>
                                        <option>Finance</option>
                                        <option>Examinations</option>
                                        <option>Information Technology</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        expand_more
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Campus/Center <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select className="appearance-none w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white">
                                        <option>Malabe Campus</option>
                                        <option>Metro Campus</option>
                                        <option>Matara Center</option>
                                        <option>Kandy Center</option>
                                        <option>Kurunegala Center</option>
                                        <option>Jaffna Center</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        expand_more
                                    </span>
                                </div>
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
                                placeholder="Brief summary of your inquiry"
                                type="text"
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
                                placeholder="Describe your issue or request in detail..."
                                rows="5"
                            ></textarea>
                        </div>

                        {/* File Upload */}
                        <div className="space-y-3">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Add attachment
                            </label>
                            <div className="group relative flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary dark:hover:border-primary rounded-2xl p-10 bg-slate-50/50 dark:bg-slate-800/50 transition-all cursor-pointer">
                                <div className="flex flex-col items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-4xl">
                                        cloud_upload
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium shadow-sm group-hover:text-primary transition-all">
                                            Choose files
                                        </span>
                                        <span className="text-slate-500 text-sm">or Drag and drop</span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">
                                        Maximum file size: 25MB. PDF, JPG, PNG allowed.
                                    </p>
                                </div>
                                <input className="absolute inset-0 opacity-0 cursor-pointer" type="file" />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col-reverse sm:flex-row items-center gap-4 pt-4">
                            <button
                                className="w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                                type="button"
                            >
                                Reset
                            </button>
                            <button
                                className="w-full sm:w-auto sm:flex-1 px-8 py-3 rounded-xl font-semibold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                type="submit"
                            >
                                Submit Ticket
                                <span className="material-symbols-outlined text-sm">send</span>
                            </button>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 text-center border-t border-slate-100 dark:border-slate-800">
                        <p className="text-xs text-slate-400">
                            © 2024 Sri Lanka Institute of Information Technology. All rights reserved.
                        </p>
                    </div>
                </div>
            </main>

            {/* Decorative blurs */}
            <div className="fixed top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
            <div className="fixed bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        </div>
    );
}
