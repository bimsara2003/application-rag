import { Link } from "react-router-dom";

export default function SupportNavbar() {
    return (
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
    );
}
