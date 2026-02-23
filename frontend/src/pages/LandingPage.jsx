import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import QuickLinks from "../components/QuickLinks";
import WelcomeSection from "../components/WelcomeSection";
import KnowledgebaseSection from "../components/KnowledgebaseSection";
import Footer from "../components/Footer";

export default function LandingPage() {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-200">
            <Navbar />
            <Hero />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 mb-20">
                <QuickLinks />
                <WelcomeSection />
                <KnowledgebaseSection />
            </main>
            <Footer />
        </div>
    );
}
