import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { coursesApi, enrollmentsApi, progressApi, getUser } from "../../services/api";
import CoachingSubscribe from "./CoachingSubscribe";
import CourseReviews from "./CourseReviews";
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
    Users,
    Target,
    Settings
} from "lucide-react";

const CourseDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [error, setError] = useState("");
    const [showCoachingModal, setShowCoachingModal] = useState(false);
    const [courseProgress, setCourseProgress] = useState<number>(0);
    const currentUser = getUser();

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                if (id) {
                    const data = await coursesApi.get(parseInt(id));
                    setCourse(data);

                    // Check if enrolled
                    try {
                        const userCourses = await enrollmentsApi.list();
                        const enrolled = userCourses.some((c: any) => c.id === parseInt(id));
                        setIsEnrolled(enrolled);
                        if (enrolled) {
                            const prog = await progressApi.get(parseInt(id));
                            setCourseProgress(prog.percentage || 0);
                        }
                    } catch (err) {
                        console.error("Error checking enrollment:", err);
                    }
                }
            } catch (err: any) {
                setError("Failed to load course details");
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [id]);

    const handleEnroll = async () => {
        if (!currentUser) {
            navigate("/login");
            return;
        }

        try {
            await enrollmentsApi.enroll(parseInt(id!));
            setIsEnrolled(true);
        } catch (err: any) {
            alert("Error enrolling in course");
        }
    };

    if (loading) {
        return (
            <div className="bg-primary min-h-screen flex items-center justify-center">
                <Navbar />
                <div className="text-gold flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-bold tracking-widest text-sm uppercase">Chargement...</span>
                </div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="bg-primary min-h-screen">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 pt-32 pb-20 text-center">
                    <h2 className="text-2xl font-heading font-bold text-white mb-4">Oups !</h2>
                    <p className="text-gray-400 mb-8">{error || "Cours non trouvé."}</p>
                    <Link to="/academy/catalog" className="bg-gold text-primary font-bold px-8 py-3 rounded-xl hover:bg-gold-hover transition">
                        Retour au catalogue
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    // Check if current user is the instructor of this course
    const isOwner = currentUser?.id === course.instructor_id || currentUser?.role === 'admin';

    return (
        <div className="bg-primary min-h-screen font-body text-white">
            <Navbar />

            {/* Header / Hero */}
            <div className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(212,175,55,0.05)_0%,transparent_50%)]"></div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <Link to="/academy/catalog" className="inline-flex items-center gap-2 text-gray-400 hover:text-gold transition mb-8 group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
                        <span>Retour au catalogue</span>
                    </Link>

                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <span className="bg-gold/10 text-gold text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-gold/20">
                                    {course.category || "Formation"}
                                </span>
                                <div className="flex items-center gap-1 text-gold">
                                    <Star className="w-4 h-4 fill-gold" />
                                    <span className="text-sm font-bold">{course.rating || "4.9"}</span>
                                </div>
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 leading-tight">
                                {course.title}
                            </h1>

                            <p className="text-xl text-gray-400 mb-8 leading-relaxed max-w-xl">
                                {course.description}
                            </p>

                            <div className="flex flex-wrap gap-6 mb-10">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Users className="w-5 h-5 text-gold" />
                                    <span className="text-sm font-medium">{course.enrolled_count || 120} Étudiants</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Clock className="w-5 h-5 text-gold" />
                                    <span className="text-sm font-medium">{course.duration || "8h 30min"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <BookOpen className="w-5 h-5 text-gold" />
                                    <span className="text-sm font-medium">{course.lessons_count || 24} Leçons</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative group">
                                <img
                                    src={course.image_url || "/course-placeholder.jpg"}
                                    alt={course.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-primary/40 flex items-center justify-center group-hover:bg-primary/20 transition">
                                    <button className="w-20 h-20 bg-gold text-primary rounded-full flex items-center justify-center shadow-xl shadow-gold/20 hover:scale-110 transition">
                                        <Play className="w-8 h-8 fill-primary ml-1" />
                                    </button>
                                </div>
                            </div>

                            {/* Floating Card */}
                            <div className="absolute -bottom-10 -right-6 lg:-right-10 bg-white rounded-3xl p-8 text-primary shadow-2xl max-w-sm hidden sm:block">
                                <div className="text-3xl font-heading font-bold mb-6">
                                    {course.is_free ? "Gratuit" : `${course.price} USDT`}
                                </div>

                                {isEnrolled ? (
                                    <div className="space-y-3">
                                        {courseProgress > 0 && (
                                            <div>
                                                <div className="flex justify-between text-xs mb-1.5">
                                                    <span className="text-gray-500 font-medium">Progression</span>
                                                    <span className="text-gold font-bold">{courseProgress}%</span>
                                                </div>
                                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${courseProgress}%` }} />
                                                </div>
                                            </div>
                                        )}
                                        <Link to={`/academy/course/${id}/player`}
                                            className="w-full bg-gold text-primary font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-gold/20 hover:bg-gold-hover transition">
                                            <Play className="w-5 h-5 fill-primary" />
                                            {courseProgress > 0 ? "Reprendre le cours" : "Commencer le cours"}
                                        </Link>
                                        {courseProgress === 100 && (
                                            <Link to={`/academy/course/${id}/certificate`}
                                                className="w-full border border-gold/30 text-gold font-bold py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-gold/5 transition text-sm">
                                                <Award className="w-4 h-4" /> Voir mon certificat
                                            </Link>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleEnroll}
                                        className="w-full bg-primary text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-primary-dark transition shadow-lg shadow-primary/20"
                                    >
                                        <ShoppingBag className="w-6 h-6" /> Commencer maintenant
                                    </button>
                                )}

                                {isOwner && (
                                    <Link to={`/academy/course/${id}/upload`}
                                        className="w-full border border-white/10 text-gray-400 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 hover:border-gold/30 hover:text-gold transition text-sm">
                                        <Settings className="w-4 h-4" /> Gérer les vidéos
                                    </Link>
                                )}

                                <p className="text-center text-xs text-gray-400 mt-4 leading-relaxed">
                                    Accès à vie • Certificat d'achèvement • Support 24/7
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs / Body */}
            <div className="max-w-7xl mx-auto px-4 pb-32">
                <div className="grid lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-12">
                        {/* Curriculum / Modules */}
                        <section>
                            <h2 className="text-2xl font-heading font-bold mb-8 flex items-center gap-3">
                                <span className="bg-gold/20 p-2 rounded-xl text-gold">
                                    <BookOpen className="w-6 h-6" />
                                </span>
                                Programme de la formation
                            </h2>

                            <div className="space-y-4">
                                {(course.modules || []).map((module: any, idx: number) => (
                                    <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition hover:border-gold/30">
                                        <button className="w-full p-6 flex items-center justify-between text-left group">
                                            <div className="flex items-center gap-4">
                                                <span className="text-gold font-bold">{String(idx + 1).padStart(2, '0')}</span>
                                                <h3 className="font-bold group-hover:text-gold transition">{module.title}</h3>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">{module.lessons?.length || 0} Leçons</span>
                                                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gold transition" />
                                            </div>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Coaching Section */}
                        <section className="bg-gold/5 border border-gold/20 rounded-3xl p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-3xl -mr-32 -mt-32 rounded-full"></div>

                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
                                <div className="flex-grow">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center text-gold">
                                            <Target className="w-7 h-7" />
                                        </div>
                                        <h2 className="text-2xl font-heading font-bold text-white">Coaching Privé</h2>
                                    </div>
                                    <p className="text-gray-400 leading-relaxed mb-6 max-w-lg">
                                        Boostez votre apprentissage avec des sessions privées en direct avec l'instructeur {course.instructor_name}.
                                        Questions-réponses, revue de projets et conseils personnalisés.
                                    </p>

                                    {isOwner && (
                                        <div className="flex items-center gap-4 mb-4">
                                            <span className="text-gold font-bold flex items-center gap-2">
                                                <Settings className="w-4 h-4" /> Mode Instructeur
                                            </span>
                                            <button className="text-xs underline text-gray-400 hover:text-gold">Configurer le prix/sessions</button>
                                        </div>
                                    )}
                                </div>

                                <div className="shrink-0 w-full md:w-auto">
                                    {isOwner ? (
                                        <button className="w-full md:w-auto bg-white/10 text-white font-bold px-8 py-4 rounded-2xl border border-white/20 hover:bg-white/20 transition">
                                            Gérer mes Coachings
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setShowCoachingModal(true)}
                                            className="w-full md:w-auto bg-gold text-primary font-bold px-10 py-4 rounded-2xl hover:bg-gold-hover transition shadow-xl shadow-gold/20 flex items-center justify-center gap-2"
                                        >
                                            Réserver un Coaching
                                        </button>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Instructor & Stats */}
                    <div className="space-y-8">
                        <section className="bg-white/5 border border-white/10 rounded-3xl p-8">
                            <h3 className="text-xl font-heading font-bold mb-8">Votre Instructeur</h3>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-gold/30">
                                    <img
                                        src={course.instructor_avatar || "/avatar-placeholder.jpg"}
                                        alt={course.instructor_name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">{course.instructor_name || "Expert Coaching"}</h4>
                                    <p className="text-sm text-gold font-medium">Expert Lead Developer</p>
                                </div>
                            </div>

                            <p className="text-sm text-gray-400 leading-relaxed mb-8">
                                Passionné par la transmission du savoir avec plus de 10 ans d'expérience dans l'écosystème web et blockchain.
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-primary-dark rounded-2xl p-4 text-center">
                                    <div className="text-gold font-bold text-lg">15k+</div>
                                    <div className="text-[10px] text-gray-500 uppercase font-black">Élèves</div>
                                </div>
                                <div className="bg-primary-dark rounded-2xl p-4 text-center">
                                    <div className="text-gold font-bold text-lg">48</div>
                                    <div className="text-[10px] text-gray-500 uppercase font-black">Cours</div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-gold/10 border border-gold/20 rounded-3xl p-8">
                            <h3 className="text-xl font-heading font-bold mb-6 text-gold">Ce que vous obtiendrez</h3>
                            <ul className="space-y-4">
                                {[
                                    "Certificat de fin de formation",
                                    "Accès illimité à vie",
                                    "Supports de cours téléchargeables",
                                    "Accès à la communauté privée",
                                    "Mises à jour régulières"
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                                        <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="border-t border-white/10 py-20">
                <div className="max-w-4xl mx-auto px-4">
                    <CourseReviews courseId={parseInt(id!)} />
                </div>
            </div>

            {showCoachingModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-primary/90 backdrop-blur-sm" onClick={() => setShowCoachingModal(false)}></div>
                    <div className="relative z-10 w-full max-w-lg">
                        <CoachingSubscribe
                            instructorId={course.instructor_id}
                            instructorName={course.instructor_name || "Expert Coaching"}
                            onCancel={() => setShowCoachingModal(false)}
                            onSuccess={() => {
                                setShowCoachingModal(false);
                                navigate("/academy/coaching");
                            }}
                        />
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default CourseDetails;
