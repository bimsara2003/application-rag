const categories = [
    {
        icon: "folder",
        iconColor: "text-slate-500",
        title: "Registration",
        count: 1,
        articles: ["Non-GPA modules"],
    },
    {
        icon: "folder_open",
        iconColor: "text-red-400",
        title: "General",
        count: 43,
        articles: [
            "About Us",
            "What is Courseweb",
            "Semester Registration",
            "Rules and Regulations for students",
            "IT Support Services",
        ],
    },
    {
        icon: "folder_special",
        iconColor: "text-indigo-400",
        title: "Verification",
        count: 3,
        articles: [
            "Credit Conversions to European Credit Transfer...",
            "Issuance of Course Outlines for Overseas...",
            "Academic Level & Qualification verification...",
        ],
    },
];

export default function KnowledgebaseSection() {
    return (
        <div className="scroll-mt-24 bg-white dark:bg-slate-800 p-10 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm" id="knowledgebase">
            <div className="flex items-center space-x-3 mb-10">
                <span className="material-icons-round text-primary text-3xl">
                    menu_book
                </span>
                <h2 className="text-3xl font-bold">Knowledgebase</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {categories.map((cat) => (
                    <div key={cat.title} className="space-y-6">
                        <div className="flex items-center justify-between group cursor-pointer">
                            <div className="flex items-center space-x-4">
                                <div
                                    className={`w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center ${cat.iconColor}`}
                                >
                                    <span className="material-icons-round">{cat.icon}</span>
                                </div>
                                <h3 className="text-xl font-semibold text-primary">
                                    {cat.title} ({cat.count})
                                </h3>
                            </div>
                        </div>
                        <ul className="space-y-3 pl-16">
                            {cat.articles.map((article) => (
                                <li key={article}>
                                    <a
                                        className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors flex items-center"
                                        href="#"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mr-3"></span>
                                        {article}
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <div className="pl-16 pt-2">
                            <a
                                className="text-sm font-medium text-primary hover:underline flex items-center"
                                href="#"
                            >
                                View all articles in {cat.title}
                                <span className="material-icons-round text-xs ml-1">
                                    arrow_forward
                                </span>
                            </a>
                        </div>
                        <hr className="border-slate-100 dark:border-slate-800" />
                    </div>
                ))}
            </div>
        </div>
    );
}
