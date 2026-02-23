import { useState, useEffect } from "react";

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
    }, [isDark]);

    return (
        <button
            className="fixed bottom-6 right-6 p-3 bg-white dark:bg-slate-800 shadow-lg rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:scale-110 transition-all z-50 cursor-pointer"
            onClick={() => setIsDark((prev) => !prev)}
            aria-label="Toggle dark mode"
        >
            {isDark ? (
                <span className="material-icons-round">light_mode</span>
            ) : (
                <span className="material-icons-round">dark_mode</span>
            )}
        </button>
    );
}
