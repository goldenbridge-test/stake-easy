import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { coachingApi, getUser } from "../../services/api";
import {
    Calendar,
    CheckCircle2,
    Clock,
    User,
    ExternalLink,
    ChevronRight,
    Loader2,
    RefreshCcw,
    Target
} from "lucide-react";

const CoachingPrograms = () => {
    const [programs, setPrograms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeView, setActiveView] = useState<"student" | "instructor">("student");
    const currentUser = getUser();

    const fetchPrograms = async () => {
        try {
            setLoading(true);
            const data = await coachingApi.list();
            setPrograms(data);
        } catch (err: any) {
            setError("Failed to load coaching programs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrograms();
        // If user is instructor, default to instructor view if they have programs there
        if (currentUser?.role === 'instructor' && programs.some(p => p.instructor === currentUser.id)) {
            setActiveView("instructor");
        }
    }, []);

    const handleValidate = async (sessionId: number) => {
        try {
            await coachingApi.validateSession(sessionId);
            fetchPrograms();
        } catch (err: any) {
            alert("Error validating session");
        }
    };

    const handleConfirm = async (sessionId: number) => {
        try {
            await coachingApi.confirmSession(sessionId);
            fetchPrograms();
        } catch (err: any) {
            alert("Error confirming session");
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "scheduled": return "bg-blue-100 text-blue-700";
            case "validated_by_student": return "bg-purple-100 text-purple-700";
            case "completed": return "bg-green-100 text-green-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const filteredPrograms = programs.filter(p =>
        activeView === 'student' ? p.student === currentUser?.id : p.instructor === currentUser?.id
    );

    return (
        <div className="bg-gray-50 min-h-screen font-body text-dark flex flex-col">
            <Navbar />
            <main className="flex-grow pt-24 pb-20 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div>
                            <h1 className="text-3xl font-heading font-bold text-primary mb-2">Mes Coachings</h1>
                            <p className="text-gray-500">Suivez vos sessions et votre progression en direct.</p>
                        </div>

                        <div className="flex items-center gap-3">
                            {currentUser?.role === 'instructor' && (
                                <div className="bg-white border border-gray-200 p-1 rounded-xl flex shadow-sm font-bold">
                                    <button
                                        onClick={() => setActiveView("student")}
                                        className={`px-4 py-2 rounded-lg text-sm transition ${activeView === "student" ? "bg-primary text-white" : "text-gray-500 hover:text-primary"
                                            }`}
                                    >
                                        Espace Étudiant
                                    </button>
                                    <button
                                        onClick={() => setActiveView("instructor")}
                                        className={`px-4 py-2 rounded-lg text-sm transition ${activeView === "instructor" ? "bg-primary text-white" : "text-gray-500 hover:text-primary"
                                            }`}
                                    >
                                        Espace Instructeur
                                    </button>
                                </div>
                            )}
                            <button
                                onClick={fetchPrograms}
                                className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition shadow-sm"
                            >
                                <RefreshCcw className="w-4 h-4" /> Actualiser
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-10 h-10 text-gold animate-spin" />
                        </div>
                    ) : filteredPrograms.length === 0 ? (
                        <div className="bg-white p-16 rounded-3xl text-center border border-gray-100 shadow-sm max-w-2xl mx-auto">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Target className="w-10 h-10 text-gray-300" />
                            </div>
                            <h2 className="text-xl font-heading font-bold text-primary mb-3">
                                {activeView === 'student' ? 'Aucun programme de coaching' : 'Aucun élève à coacher'}
                            </h2>
                            <p className="text-gray-400 mb-8 leading-relaxed">
                                {activeView === 'student'
                                    ? "Vous n'avez pas encore de programme de coaching en cours. Découvrez nos coachs experts pour accélérer votre apprentissage."
                                    : "Aucun élève n'est encore inscrit à vos programmes de coaching."}
                            </p>
                            {activeView === 'student' && (
                                <a href="/academy/catalog" className="inline-block bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-primary-dark transition shadow-lg shadow-primary/20">
                                    Explorer le Catalogue
                                </a>
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-8">
                            {filteredPrograms.map((program) => {
                                const isCoachView = activeView === 'instructor';
                                return (
                                    <div key={program.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between gap-6 items-start">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                                                    <User className="w-7 h-7" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-gold uppercase tracking-widest mb-1">
                                                        {isCoachView ? "Élève" : "Coach"}
                                                    </p>
                                                    <h3 className="text-xl font-heading font-bold text-primary">
                                                        {isCoachView ? program.student_name : program.instructor_name}
                                                    </h3>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-4 items-center">
                                                <div className="bg-gray-50 px-4 py-2 rounded-xl text-center min-w-[100px]">
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Sessions</p>
                                                    <p className="font-heading font-bold text-primary">{program.sessions_count}/{program.total_sessions}</p>
                                                </div>
                                                <div className="bg-blue-50/50 px-4 py-2 rounded-xl text-center min-w-[100px]">
                                                    <p className="text-[10px] text-blue-400 font-bold uppercase mb-1">Progression</p>
                                                    <p className="font-heading font-bold text-blue-600">{Math.round((program.sessions_count / program.total_sessions) * 100)}%</p>
                                                </div>
                                                {program.status === "completed" && (
                                                    <div className="bg-green-50 px-4 py-2 rounded-xl flex items-center gap-2">
                                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                        <span className="text-green-700 font-bold text-sm uppercase">Terminé</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-8">
                                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">Sessions du programme</h4>
                                            <div className="space-y-4">
                                                {program.sessions && program.sessions.sort((a: any, b: any) => a.session_number - b.session_number).map((session: any) => (
                                                    <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-gray-50 hover:border-gold/20 transition group bg-gray-50/30">
                                                        <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${session.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-white text-gray-400 border border-gray-100'
                                                                }`}>
                                                                {session.session_number}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <p className="font-bold text-primary">Session #{session.session_number}</p>
                                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${getStatusStyle(session.status)}`}>
                                                                        {session.status.replace(/_/g, " ")}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                                                    <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(session.scheduled_date).toLocaleDateString()}</div>
                                                                    <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {session.duration_minutes} min</div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            {session.meeting_link && (
                                                                <a href={session.meeting_link} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-blue-500 transition">
                                                                    <ExternalLink className="w-5 h-5" />
                                                                </a>
                                                            )}

                                                            {activeView === 'student' && session.status === 'scheduled' && (
                                                                <button
                                                                    onClick={() => handleValidate(session.id)}
                                                                    className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-primary-dark transition shadow-sm"
                                                                >
                                                                    Valider la Session
                                                                </button>
                                                            )}

                                                            {activeView === 'instructor' && session.status === 'validated_by_student' && (
                                                                <button
                                                                    onClick={() => handleConfirm(session.id)}
                                                                    className="bg-gold text-primary text-xs font-bold px-4 py-2 rounded-lg hover:bg-gold-hover transition shadow-sm"
                                                                >
                                                                    Confirmer la Session
                                                                </button>
                                                            )}

                                                            {session.status === 'completed' && (
                                                                <div className="bg-green-50 p-2 rounded-lg">
                                                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CoachingPrograms;
