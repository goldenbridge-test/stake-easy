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
            navigate("/signin");
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
            <div className="bg-gray-50 min-h-screen flex items-center justify-center">
                <Navbar />
                <div className="text-gold flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-bold tracking-widest text-sm uppercase text-dark">Chargement...</span>
                </div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="bg-gray-50 min-h-screen">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 pt-32 pb-20 text-center">
                    <h2 className="text-2xl font-heading font-bold text-primary mb-4">Oups !</h2>
                    <p className="text-gray-500 mb-8">{error || "Cours non trouvé."}</p>
                    <Link to="/academy/catalog" className="bg-gold text-primary font-bold px-8 py-3 rounded-xl hover:bg-gold-hover transition">
                        Retour au catalogue
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    const isOwner = currentUser?.id === course.instructor_id || currentUser?.role === 'admin';

    return (
        <div className="bg-gray-50 min-h-screen font-body text-dark">
            <Navbar />

            {/* Hero — fond blanc avec bordure basse */}
            <div className="bg-white border-b border-gray-100 pt-32 pb-16 shadow-sm">
                <div className="max-w-7xl mx-auto px-6">
                    <Link to="/academy/catalog" className="inline-flex items-center gap-2 text-gray-400 hover:text-gold transition mb-8 group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
                        <span className="text-sm font-medium">Retour au catalogue</span>
                    </Link>

                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="flex items-center gap-3 mb-5">
                                <span className="bg-gold/10 text-gold text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-gold/20">
                                    {course.category || "Formation"}
                                </span>
                                <div className="flex items-center gap-1 text-gold">
                                    <Star className="w-4 h-4 fill-gold" />
                                    <span className="text-sm font-bold text-dark">{course.rating || "4.9"}</span>
                                </div>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-5 leading-tight">
                                {course.title}
                            </h1>

                            <p className="text-lg text-gray-500 mb-8 leading-relaxed max-w-xl">
                                {course.description}
                            </p>

                            <div className="flex flex-wrap gap-6">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Users className="w-4 h-4 text-gold" />
                                    <span className="text-sm font-medium">{course.enrolled_count || 120} Étudiants</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Clock className="w-4 h-4 text-gold" />
                                    <span className="text-sm font-medium">{course.duration || "8h 30min"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500">
                                    <BookOpen className="w-4 h-4 text-gold" />
                                    <span className="text-sm font-medium">{course.lessons_count || 24} Leçons</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="aspect-video rounded-2xl overflow-hidden border border-gray-100 shadow-lg relative group">
                                <img
                                    src={course.image_url || "/course-placeholder.jpg"}
                                    alt={course.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-primary/30 flex items-center justify-center group-hover:bg-primary/10 transition">
                                    <button className="w-16 h-16 bg-gold text-primary rounded-full flex items-center justify-center shadow-xl shadow-gold/30 hover:scale-110 transition">
                                        <Play className="w-6 h-6 fill-primary ml-1" />
                                    </button>
                                </div>
                            </div>

                            {/* Floating Card */}
                            <div className="absolute -bottom-8 -right-4 lg:-right-8 bg-white rounded-2xl p-6 shadow-xl border border-gray-100 max-w-xs hidden sm:block">
                                <div className="text-2xl font-heading font-bold text-primary mb-4">
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
                                            className="w-full bg-gold text-primary font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-gold/20 hover:bg-gold-hover transition text-sm">
                                            <Play className="w-4 h-4 fill-primary" />
                                            {courseProgress > 0 ? "Reprendre le cours" : "Commencer le cours"}
                                        </Link>
                                        {courseProgress === 100 && (
                                            <Link to={`/academy/course/${id}/certificate`}
                                                className="w-full border border-gold/30 text-gold font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gold/5 transition text-xs">
                                                <Award className="w-4 h-4" /> Voir mon certificat
                                            </Link>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleEnroll}
                                        className="w-full bg-primary text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-dark transition shadow-md text-sm"
                                    >
                                        <ShoppingBag className="w-4 h-4" /> Commencer maintenant
                                    </button>
                                )}

                                {isOwner && (
                                    <Link to={`/academy/course/${id}/upload`}
                                        className="mt-2 w-full border border-gray-200 text-gray-400 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:border-gold/30 hover:text-gold transition text-xs">
                                        <Settings className="w-4 h-4" /> Gérer les vidéos
                                    </Link>
                                )}

                                <p className="text-center text-xs text-gray-400 mt-4 leading-relaxed">
                                    Accès à vie • Certificat • Support 24/7
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-10">

                        {/* Curriculum */}
                        <section>
                            <h2 className="text-2xl font-heading font-bold text-primary mb-6 flex items-center gap-3">
                                <span className="bg-gold/10 p-2 rounded-xl text-gold">
                                    <BookOpen className="w-5 h-5" />
                                </span>
                                Programme de la formation
                            </h2>

                            <div className="space-y-3">
                                {(course.modules || []).map((module: any, idx: number) => (
                                    <div key={idx} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:border-gold/30 hover:shadow-md transition">
                                        <button className="w-full p-5 flex items-center justify-between text-left group">
                                            <div className="flex items-center gap-4">
                                                <span className="text-gold font-bold text-sm">{String(idx + 1).padStart(2, '0')}</span>
                                                <h3 className="font-bold text-dark group-hover:text-gold transition">{module.title}</h3>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-gray-400 uppercase font-bold tracking-widest">{module.lessons?.length || 0} Leçons</span>
                                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gold transition" />
                                            </div>
                                        </button>
                                    </div>
                                ))}
                                {(!course.modules || course.modules.length === 0) && (
                                    <div className="bg-white border border-gray-100 rounded-xl p-8 text-center text-gray-400">
                                        Le programme sera disponible prochainement.
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Coaching */}
                        <section className="bg-white border border-gold/20 rounded-2xl p-8 shadow-sm">
                            <div className="flex flex-col md:flex-row items-center gap-8 justify-between">
                                <div className="flex-grow">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold">
                                            <Target className="w-5 h-5" />
                                        </div>
                                        <h2 className="text-xl font-heading font-bold text-primary">Coaching Privé</h2>
                                    </div>
                                    <p className="text-gray-500 leading-relaxed max-w-lg text-sm">
                                        Boostez votre apprentissage avec des sessions privées en direct avec l'instructeur {course.instructor_name}.
                                    </p>
                                    {isOwner && (
                                        <p className="text-gold font-bold flex items-center gap-2 mt-3 text-sm">
                                            <Settings className="w-4 h-4" /> Mode Instructeur
                                        </p>
                                    )}
                                </div>
                                <div className="shrink-0 w-full md:w-auto">
                                    {isOwner ? (
                                        <button className="w-full md:w-auto bg-gray-100 text-dark font-bold px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-200 transition text-sm">
                                            Gérer mes Coachings
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setShowCoachingModal(true)}
                                            className="w-full md:w-auto bg-gold text-primary font-bold px-8 py-3 rounded-xl hover:bg-gold-hover transition shadow-lg shadow-gold/20 text-sm"
                                        >
                                            Réserver un Coaching
                                        </button>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Instructor */}
                        <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-lg font-heading font-bold text-primary mb-5">Votre Instructeur</h3>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-gold/20 shrink-0">
                                    <img
                                        src={course.instructor_avatar || "/avatar-placeholder.jpg"}
                                        alt={course.instructor_name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-bold text-dark">{course.instructor_name || "Expert Coaching"}</h4>
                                    <p className="text-xs text-gold font-medium">Expert Lead Developer</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 leading-relaxed mb-5">
                                Passionné par la transmission du savoir avec plus de 10 ans d'expérience dans l'écosystème web et blockchain.
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                                    <div className="text-gold font-bold">15k+</div>
                                    <div className="text-[10px] text-gray-400 uppercase font-black mt-0.5">Élèves</div>
                                </div>
                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                                    <div className="text-gold font-bold">48</div>
                                    <div className="text-[10px] text-gray-400 uppercase font-black mt-0.5">Cours</div>
                                </div>
                            </div>
                        </section>

                        {/* Ce que vous obtiendrez */}
                        <section className="bg-white border border-gold/20 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-lg font-heading font-bold text-primary mb-4">Ce que vous obtiendrez</h3>
                            <ul className="space-y-3">
                                {[
                                    "Certificat de fin de formation",
                                    "Accès illimité à vie",
                                    "Supports de cours téléchargeables",
                                    "Accès à la communauté privée",
                                    "Mises à jour régulières"
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                                        <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>
                </div>
            </div>

            {/* Reviews */}
            <div className="border-t border-gray-100 bg-white py-16">
                <div className="max-w-4xl mx-auto px-6">
                    <CourseReviews courseId={parseInt(id!)} />
                </div>
            </div>

            {showCoachingModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={() => setShowCoachingModal(false)}></div>
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
