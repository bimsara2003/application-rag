import SupportNavbar from "../components/SupportNavbar";
import Hero from "../components/Hero";
import Breadcrumb from "../components/Breadcrumb";
import SupportForm from "../components/SupportForm";

export default function StudentSupport() {
    return (
        <div className="font-display bg-background-light dark:bg-background-dark min-h-screen text-slate-800 dark:text-slate-200 transition-colors duration-300">
            <SupportNavbar />
            <Hero />
            <Breadcrumb current="Contact SLIIT Student Support" />
            <SupportForm />

            {/* Decorative blurs */}
            <div className="fixed top-0 right-0 -z-10 w-125 h-125 bg-primary/10 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
            <div className="fixed bottom-0 left-0 -z-10 w-100 h-100 bg-primary/10 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        </div>
    );
}
