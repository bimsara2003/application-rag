export default function Hero() {
    return (
        <section className="hero-gradient py-20 px-4">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-8 tracking-tight">
                    How can we help you today?
                </h1>
                <div className="relative max-w-2xl mx-auto">
                    <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-slate-400">
                        <span className="material-icons-round">search</span>
                    </span>
                    <input
                        className="w-full pl-14 pr-6 py-5 rounded-2xl border-none ring-0 focus:ring-4 focus:ring-white/20 text-lg shadow-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-all outline-none"
                        placeholder="Search for articles, guides, and more..."
                        type="text"
                    />
                </div>
            </div>
        </section>
    );
}
