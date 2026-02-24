import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { isAuthenticated, user } = useAuth();

    return (
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
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
                    <div className="flex items-center space-x-4 sm:space-x-6">
                        <Link
                            className="text-sm font-medium hover:text-primary transition-colors"
                            to="/"
                        >
                            Help Center
                        </Link>
                        <Link
                            to="/student-support"
                            className="bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg active:scale-95"
                        >
                            Contact Support
                        </Link>

                        {isAuthenticated ? (
                            <Link
                                to="/dashboard"
                                className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                            >
                                <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-sm">
                                    {user?.full_name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="hidden sm:inline">{user?.full_name?.split(" ")[0]}</span>
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
