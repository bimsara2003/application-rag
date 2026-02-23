const links = [
    {
        icon: "auto_stories",
        title: "Knowledgebase",
        description: "Explore our library of guides",
        cta: "View all articles",
        href: "#knowledgebase",
        iconBg: "bg-blue-50 dark:bg-blue-900/30",
        iconColor: "text-primary",
        ctaColor: "text-primary",
    },
    {
        icon: "folder_zip",
        title: "Files",
        description: "Access important documents",
        cta: "Browse our files",
        href: "#",
        iconBg: "bg-orange-50 dark:bg-orange-900/30",
        iconColor: "text-orange-500",
        ctaColor: "text-orange-500",
    },
    {
        icon: "contact_support",
        title: "Contact Support",
        description: "Get direct assistance",
        cta: "Get in touch",
        href: "#",
        iconBg: "bg-emerald-50 dark:bg-emerald-900/30",
        iconColor: "text-emerald-500",
        ctaColor: "text-emerald-500",
    },
];

export default function QuickLinks() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {links.map((link) => (
                <a
                    key={link.title}
                    className="group bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-slate-100 dark:border-slate-700 flex items-start space-x-5"
                    href={link.href}
                >
                    <div
                        className={`p-4 ${link.iconBg} rounded-xl ${link.iconColor} group-hover:scale-110 transition-transform`}
                    >
                        <span className="material-icons-round text-3xl">{link.icon}</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-1">{link.title}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                            {link.description}
                        </p>
                        <span
                            className={`${link.ctaColor} text-sm font-semibold flex items-center group-hover:translate-x-1 transition-transform`}
                        >
                            {link.cta}
                            <span className="material-icons-round text-sm ml-1">
                                chevron_right
                            </span>
                        </span>
                    </div>
                </a>
            ))}
        </div>
    );
}
