import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SupportNavbar() {
    const { isAuthenticated, user } = useAuth();
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
                    <div className="flex items-center gap-4 border-l pl-4 border-slate-200 dark:border-slate-700">
                        {isAuthenticated ? (
                            <Link
                                to="/dashboard"
                                className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                            >
                                <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-sm uppercase">
                                    {user?.full_name?.charAt(0) || "U"}
                                </div>
                                <span className="hidden sm:inline">{user?.full_name?.split(" ")[0] || "User"}</span>
                            </Link>
                        ) : (
                            <Link
                                to="/login"
                                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                            >
                                Log in
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
