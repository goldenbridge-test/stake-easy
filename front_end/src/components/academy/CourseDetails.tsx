import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    Play,
    Clock,
    BookOpen,
    Award,
    ChevronRight,
    CheckCircle2,
    Lock,
    ArrowLeft,
    ShoppingBag,
    Star,
    Users
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { coursesApi, enrollmentsApi } from "../../services/api";

const CourseDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                if (!id) return;
                const data = await coursesApi.get(parseInt(id));
                setCourse(data);
            } catch (err: any) {
                setError("Impossible de charger les détails du cours.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id]);

    const handleEnroll = async () => {
        try {
            setEnrolling(true);
            setError("");

            if (course.is_free || course.price === 0) {
                await enrollmentsApi.enroll(course.id);
                // On redirige vers "My Learning" après inscription réussie
                navigate("/academy/my-learning");
            } else {
                // Pour les cours payants, on simule ou on prépare le paiement Stripe
                alert("Ce cours est payant. L'intégration du paiement Stripe arrive bientôt !");
            }
        } catch (err: any) {
            setError(err.message || "L'inscription a échoué.");
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-grow flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
                    <div className="bg-red-50 text-red-500 p-6 rounded-2xl max-w-md">
                        <h2 className="text-xl font-bold mb-2">Oups !</h2>
                        <p>{error || "Cours introuvable."}</p>
                        <Link to="/academy/catalog" className="mt-4 inline-block bg-primary text-white px-6 py-2 rounded-lg font-bold">
                            Retour au catalogue
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen font-body text-dark flex flex-col">
            <Navbar />

            <main className="flex-grow pt-16">
                {/* HEADER SECTION - Premium Dark Background */}
                <section className="bg-primary text-white py-12 px-6">
                    <div className="max-w-7xl mx-auto">
                        <Link to="/academy/catalog" className="inline-flex items-center text-blue-200 hover:text-white transition gap-2 mb-6 text-sm font-medium">
                            <ArrowLeft className="w-4 h-4" /> Retour au catalogue
                        </Link>

                        <div className="grid lg:grid-cols-3 gap-12 items-start">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="flex flex-wrap gap-2">
                                    <span className="bg-gold/20 text-gold text-xs font-bold px-3 py-1 rounded-full border border-gold/30 uppercase tracking-wider">
                                        {course.category_name || "Academy"}
                                    </span>
                                    <span className="bg-white/10 text-blue-100 text-xs font-bold px-3 py-1 rounded-full border border-white/10">
                                        {course.level || "Tous niveaux"}
                                    </span>
                                </div>

                                <h1 className="text-4xl md:text-5xl font-heading font-bold leading-tight">
                                    {course.title}
                                </h1>

                                <p className="text-blue-100 text-lg max-w-2xl leading-relaxed">
                                    {course.description || "Master the foundations of blockchain technology and decentralized finance with our expert-led curriculum."}
                                </p>

                                <div className="flex flex-wrap items-center gap-6 text-sm text-blue-100/80">
                                    <div className="flex items-center gap-1.5">
                                        <Star className="w-4 h-4 text-gold fill-gold" />
                                        <span className="font-bold text-white">{course.average_rating || "4.8"}</span>
                                        <span>({course.reviews_count || "120"} avis)</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Users className="w-4 h-4" />
                                        <span>{course.students_count || "1,240"} étudiants</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" />
                                        <span>{course.duration_hours || "12"}h de contenu</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center font-bold text-gold">
                                        {course.instructor_name?.charAt(0) || "I"}
                                    </div>
                                    <div>
                                        <p className="text-xs text-blue-200">Instructeur</p>
                                        <p className="text-sm font-bold">{course.instructor_name || "Expert Academy"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* ENROLL CARD */}
                            <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 text-dark relative lg:-mb-32 z-20">
                                <div className="aspect-video rounded-xl overflow-hidden mb-6 bg-gray-100">
                                    <img
                                        src={course.thumbnail || "https://via.placeholder.com/400x225?text=Course+Preview"}
                                        alt={course.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <span className="text-gray-400 text-sm line-through block">69.99€</span>
                                        <span className="text-3xl font-heading font-bold text-primary">
                                            {course.is_free || course.price === 0 ? "GRATUIT" : `${course.price}€`}
                                        </span>
                                    </div>
                                    {course.is_free && (
                                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded">OFFRE LIMITÉE</span>
                                    )}
                                </div>

                                <button
                                    onClick={handleEnroll}
                                    disabled={enrolling}
                                    className="w-full bg-gold hover:bg-gold-hover text-primary font-bold py-4 rounded-xl shadow-lg shadow-gold/20 transition transform hover:-translate-y-1 flex items-center justify-center gap-2 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {enrolling ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                                    ) : (
                                        <>
                                            <Play className="w-5 h-5 fill-current" /> S'inscrire maintenant
                                        </>
                                    )}
                                </button>

                                <p className="text-[11px] text-center text-gray-400 mb-6">
                                    Garantie satisfait ou remboursé de 30 jours
                                </p>

                                <div className="space-y-4">
                                    <p className="font-bold text-xs uppercase tracking-widest text-gray-400">Ce cours comprend :</p>
                                    <ul className="space-y-3">
                                        {[
                                            { icon: Play, text: "Vidéos à la demande" },
                                            { icon: BookOpen, text: "Ressources téléchargeables" },
                                            { icon: Clock, text: "Accès illimité" },
                                            { icon: Award, text: "Certificat de fin de formation" },
                                        ].map((item, idx) => (
                                            <li key={idx} className="flex items-center gap-3 text-sm text-gray-600">
                                                <item.icon className="w-4 h-4 text-gold" />
                                                {item.text}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CONTENT TABS */}
                <section className="py-20 px-6 bg-gray-50/50">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2">
                            <div className="border-b border-gray-200 mb-8 flex gap-8">
                                {["overview", "curriculum", "instructor"].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`pb-4 text-sm font-bold uppercase tracking-wider transition relative ${activeTab === tab ? "text-primary" : "text-gray-400 hover:text-gray-600"
                                            }`}
                                    >
                                        {tab}
                                        {activeTab === tab && (
                                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gold"></div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {activeTab === "overview" && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                            Ce que vous allez apprendre
                                        </h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {[
                                                "Maîtriser les fondamentaux de la Blockchain",
                                                "Comprendre le fonctionnement des Smart Contracts",
                                                "Analyser les protocoles DeFi les plus sûrs",
                                                "Gérer votre propre wallet numérique",
                                                "Sécuriser vos actifs crypto",
                                                "Optimiser vos rendements en staking"
                                            ].map((item, idx) => (
                                                <div key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                                                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                    <span>{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="prose prose-blue max-w-none text-gray-600">
                                        <h3 className="text-xl font-bold text-dark">Description</h3>
                                        <p>
                                            {course.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {activeTab === "curriculum" && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xl font-bold">Programme du cours</h3>
                                        <span className="text-sm text-gray-500">
                                            {course.lessons?.length || 0} leçons • {course.duration_hours || "12"}h
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        {course.lessons && course.lessons.length > 0 ? (
                                            course.lessons.map((lesson: any, idx: number) => (
                                                <div key={lesson.id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between hover:border-gold/30 transition group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-400 group-hover:bg-gold/10 group-hover:text-gold transition">
                                                            {idx + 1}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-700">{lesson.title}</p>
                                                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">{lesson.duration_minutes || "15"} minutes</p>
                                                        </div>
                                                    </div>
                                                    {lesson.is_preview ? (
                                                        <span className="text-[10px] font-bold text-gold bg-gold/10 px-2 py-1 rounded">APERCU</span>
                                                    ) : (
                                                        <Lock className="w-4 h-4 text-gray-200" />
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="bg-gray-50 p-8 rounded-xl text-center border border-dashed border-gray-200">
                                                <p className="text-gray-400 italic">Le programme détaillé est en cours de mise à jour.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === "instructor" && (
                                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="flex items-center gap-6 mb-6">
                                        <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center text-2xl font-bold text-gold">
                                            {course.instructor_name?.charAt(0) || "I"}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-primary">{course.instructor_name || "Expert Academy"}</h4>
                                            <p className="text-sm text-gold font-medium">Bockchain Architect & Educator</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        L'instructeur est un expert reconnu dans le domaine de la blockchain avec plus de 10 ans d'expérience dans le développement Web3 et la finance décentralisée. Il a formé des milliers d'étudiants à travers le monde.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default CourseDetails;
