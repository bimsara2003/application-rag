import { Link } from "react-router-dom";

export default function Breadcrumb({ current }) {
    return (
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
                        {current}
                    </span>
                </div>
            </div>
        </div>
    );
}
