import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ticketApi } from "../services/api";
import Navbar from "../components/Navbar";

const statusColors = {
    open: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    in_progress: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    resolved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    closed: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

const priorityColors = {
    low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    urgent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const facultyLabels = {
    computing: "Faculty of Computing",
    business: "SLIIT Business School",
    engineering: "Faculty of Engineering",
    humanities: "Faculty of Humanities & Sciences",
};

const campusLabels = {
    malabe: "Malabe Campus",
    metro: "Metro Campus",
    matara: "Matara Center",
    kandy: "Kandy Center",
    kurunegala: "Kurunegala Center",
    jaffna: "Jaffna Center",
};

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [ticketsLoading, setTicketsLoading] = useState(true);

    useEffect(() => {
        ticketApi
            .list()
            .then(setTickets)
            .catch(() => { })
            .finally(() => setTicketsLoading(false));
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
                {/* Welcome header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Welcome, {user.full_name.split(" ")[0]} 👋
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Here's an overview of your account and support tickets
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            to="/student-support"
                            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                            New Ticket
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-lg">logout</span>
                            Sign out
                        </button>
                    </div>
                </div>

                {/* Profile card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-2xl">person</span>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Profile</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ProfileField icon="badge" label="Name" value={user.full_name} />
                        <ProfileField icon="mail" label="Email" value={user.email} />
                        <ProfileField icon="pin" label="Reg. Number" value={user.registration_number} />
                        <ProfileField icon="school" label="Faculty" value={facultyLabels[user.faculty] || user.faculty} />
                        <ProfileField icon="location_on" label="Campus" value={campusLabels[user.campus] || user.campus} />
                        <ProfileField icon="phone" label="Phone" value={user.phone || "—"} />
                        <ProfileField icon="shield_person" label="Role" value={user.role.charAt(0).toUpperCase() + user.role.slice(1)} />
                        <ProfileField icon="verified" label="Status" value={user.is_active ? "Active" : "Inactive"} />
                    </div>
                </div>

                {/* Tickets section */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-2xl">confirmation_number</span>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">My Tickets</h2>
                            <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">
                                {tickets.length}
                            </span>
                        </div>
                    </div>

                    {ticketsLoading ? (
                        <div className="p-12 text-center text-slate-400">
                            <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
                            <p className="mt-2">Loading tickets...</p>
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="p-12 text-center">
                            <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 text-5xl">inbox</span>
                            <p className="mt-3 text-slate-500 dark:text-slate-400">No tickets yet</p>
                            <Link
                                to="/student-support"
                                className="mt-4 inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline"
                            >
                                Submit your first ticket
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {tickets.map((ticket) => (
                                <Link
                                    key={ticket.id}
                                    to={`/ticket/${ticket.id}`}
                                    className="block p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">
                                                {ticket.subject}
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                                                {ticket.message}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[ticket.status]}`}>
                                                {ticket.status.replace("_", " ")}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${priorityColors[ticket.priority]}`}>
                                                {ticket.priority}
                                            </span>
                                            <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-[16px] group-hover:text-primary transition-colors">chevron_right</span>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">apartment</span>
                                            {ticket.department.replace("_", " ")}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">schedule</span>
                                            {new Date(ticket.created_at).toLocaleDateString()}
                                        </span>
                                        {ticket.resolution && (
                                            <span className="flex items-center gap-1 text-emerald-500">
                                                <span className="material-symbols-outlined text-sm">verified</span>
                                                Has resolution
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function ProfileField({ icon, label, value }) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-lg">{icon}</span>
            </div>
            <div>
                <p className="text-xs text-slate-400 font-medium">{label}</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
            </div>
        </div>
    );
}
