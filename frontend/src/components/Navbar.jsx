export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <span className="text-2xl font-bold tracking-tight text-primary">
                                SLIIT
                            </span>
                            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 mx-4"></div>
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Support Desk
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-6">
                        <a
                            className="text-sm font-medium hover:text-primary transition-colors"
                            href="#"
                        >
                            Help Center
                        </a>
                        <button className="bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer">
                            Contact Support
                        </button>
                        <a
                            className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary"
                            href="#"
                        >
                            Log in
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    );
}
