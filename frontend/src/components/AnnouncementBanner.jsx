import { useState, useEffect } from "react";
import { announcementApi } from "../services/api";

const priorityStyles = {
    critical: {
        bg: "bg-red-50 dark:bg-red-900/20",
        border: "border-red-200 dark:border-red-500/30",
        text: "text-red-800 dark:text-red-300",
        icon: "warning",
        iconColor: "text-red-500",
    },
    high: {
        bg: "bg-amber-50 dark:bg-amber-900/20",
        border: "border-amber-200 dark:border-amber-500/30",
        text: "text-amber-800 dark:text-amber-300",
        icon: "info",
        iconColor: "text-amber-500",
    },
    normal: {
        bg: "bg-blue-50 dark:bg-blue-900/20",
        border: "border-blue-200 dark:border-blue-500/30",
        text: "text-blue-800 dark:text-blue-300",
        icon: "campaign",
        iconColor: "text-blue-500",
    },
    low: {
        bg: "bg-slate-50 dark:bg-slate-800",
        border: "border-slate-200 dark:border-slate-700",
        text: "text-slate-700 dark:text-slate-300",
        icon: "info",
        iconColor: "text-slate-400",
    },
};

export default function AnnouncementBanner() {
    const [announcements, setAnnouncements] = useState([]);
    const [dismissed, setDismissed] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("dismissed_announcements") || "[]");
        } catch { return []; }
    });

    useEffect(() => {
        announcementApi.listActive()
            .then(setAnnouncements)
            .catch(() => { });
    }, []);

    const handleDismiss = (id) => {
        const updated = [...dismissed, id];
        setDismissed(updated);
        localStorage.setItem("dismissed_announcements", JSON.stringify(updated));
    };

    const visible = announcements.filter(a => !dismissed.includes(a.id));

    if (visible.length === 0) return null;

    // Sort: critical first, then high, normal, low
    const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
    const sorted = [...visible].sort((a, b) => (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3));

    return (
        <div className="space-y-3">
            {sorted.map(ann => {
                const style = priorityStyles[ann.priority] || priorityStyles.normal;
                return (
                    <div key={ann.id}
                        className={`${style.bg} ${style.border} border rounded-2xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2`}>
                        <span className={`material-symbols-outlined text-xl mt-0.5 shrink-0 ${style.iconColor}`}>{style.icon}</span>
                        <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-bold ${style.text}`}>{ann.title}</h4>
                            <p className={`text-sm mt-0.5 ${style.text} opacity-80 leading-relaxed`}>{ann.content}</p>
                        </div>
                        <button onClick={() => handleDismiss(ann.id)}
                            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0"
                            title="Dismiss">
                            <span className="material-symbols-outlined text-lg text-slate-400 dark:text-slate-500">close</span>
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
