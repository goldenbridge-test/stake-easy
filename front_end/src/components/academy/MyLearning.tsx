import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import CourseCard from "../../components/academy/CourseCard";
import { enrollmentsApi, analyticsApi, coursesApi, getUser } from "../../services/api";
import {
  Trophy,
  Flame,
  Clock,
  Loader2,
  Target,
  BookOpen,
  Settings
} from "lucide-react";

const MyLearning = () => {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"learning" | "teaching">("learning");
  const currentUser = getUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const isInstructor = currentUser?.role === 'instructor' || currentUser?.role === 'admin';
        const [enrolledData, statsData, coursesData] = await Promise.all([
          enrollmentsApi.list().catch(() => []),
          analyticsApi.mySummary().catch(() => null),
          isInstructor ? coursesApi.myCourses().catch(() => []) : Promise.resolve([]),
        ]);
        setEnrollments(enrolledData || []);
        if (statsData) setStats(statsData);
        setMyCourses(coursesData.results || coursesData);

        if (isInstructor) {
          setActiveTab("teaching");
        }
      } catch (error) {
        console.error("Error fetching learning data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-body text-dark">
      <Navbar />
      <main className="pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-heading font-bold text-primary mb-2">
                {activeTab === 'learning' ? 'Mon Apprentissage' : 'Tableau de Bord Instructeur'}
              </h1>
              <p className="text-gray-500">
                {activeTab === 'learning'
                  ? 'Continuez votre progression et atteignez vos objectifs.'
                  : 'Gérez vos cours et suivez les performances de vos élèves.'}
              </p>
            </div>

            {currentUser?.role === 'instructor' && (
              <div className="bg-gray-100 p-1 rounded-xl flex border border-gray-200">
                <button
                  onClick={() => setActiveTab("learning")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === "learning" ? "bg-gold text-primary shadow-sm" : "text-gray-500 hover:text-dark"}`}
                >
                  Espace Étudiant
                </button>
                <button
                  onClick={() => setActiveTab("teaching")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === "teaching" ? "bg-gold text-primary shadow-sm" : "text-gray-500 hover:text-dark"}`}
                >
                  Espace Instructeur
                </button>
              </div>
            )}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 bg-white border border-gray-100 shadow-sm p-8 rounded-3xl">
            {activeTab === 'learning' ? (
              <>
                <div className="text-center md:border-r md:border-gray-100">
                  <div className="text-3xl font-heading font-bold text-gold flex justify-center items-center gap-2">
                    <Flame className="w-6 h-6 fill-gold" /> {stats?.streak || 0}
                  </div>
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">Série de jours</p>
                </div>
                <div className="text-center md:border-r md:border-gray-100">
                  <div className="text-3xl font-heading font-bold text-green-500 flex justify-center items-center gap-2">
                    <Target className="w-6 h-6" /> {Math.round(stats?.coaching_progression_avg || 0)}%
                  </div>
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">Coaching Prog.</p>
                </div>
                <div className="text-center md:border-r md:border-gray-100">
                  <div className="text-3xl font-heading font-bold text-primary flex justify-center items-center gap-2">
                    <Trophy className="w-6 h-6" /> {stats?.certificates || 0}
                  </div>
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">Certificats</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-heading font-bold text-purple-500 flex justify-center items-center gap-2">
                    <Clock className="w-6 h-6" /> {stats?.completed_coaching_sessions || 0}
                  </div>
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">Sessions Finies</p>
                </div>
              </>
            ) : (
              <>
                <div className="text-center md:border-r md:border-gray-100">
                  <div className="text-3xl font-heading font-bold text-gold">
                    ${stats?.instructor_metrics?.total_revenue || 0}
                  </div>
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">Revenu Total</p>
                </div>
                <div className="text-center md:border-r md:border-gray-100">
                  <div className="text-3xl font-heading font-bold text-green-500">
                    {stats?.instructor_metrics?.coaching_completion_rate || 0}%
                  </div>
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">Taux Complétion</p>
                </div>
                <div className="text-center md:border-r md:border-gray-100">
                  <div className="text-3xl font-heading font-bold text-primary">
                    {stats?.instructor_metrics?.total_students || 0}
                  </div>
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">Total Élèves</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-heading font-bold text-purple-500 flex justify-center items-center gap-2">
                    <Target className="w-6 h-6" /> {stats?.instructor_metrics?.active_coachings || 0}
                  </div>
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">Coachings Actifs</p>
                </div>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col md:flex-row justify-between items-center bg-gold/10 border border-gold/20 p-8 rounded-3xl mb-12">
            <div className="mb-6 md:mb-0 text-center md:text-left">
              <h3 className="text-xl font-heading font-bold text-primary mb-2">
                {activeTab === 'learning' ? 'Prêt à continuer ?' : 'Gérez vos sessions'}
              </h3>
              <p className="text-gray-500">
                {activeTab === 'learning'
                  ? 'Accédez à vos sessions de coaching personnalisé en un clic.'
                  : 'Validez les progrès de vos élèves et confirmez les sessions.'}
              </p>
            </div>
            <a
              href="/academy/coaching"
              className="inline-flex items-center gap-3 bg-gold text-primary font-black px-8 py-4 rounded-2xl hover:bg-gold-hover transition shadow-xl shadow-gold/20"
            >
              <Target className="w-5 h-5" /> {activeTab === 'learning' ? 'Mes Coachings' : 'Espace Coaching'}
            </a>
          </div>

          {/* Content Sections */}
          {activeTab === 'learning' ? (
            <section>
              <h2 className="text-2xl font-heading font-bold text-primary mb-8 flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-gold" /> Vos Cours
              </h2>
              {enrollments.length === 0 ? (
                <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-16 text-center">
                  <p className="text-gray-500 mb-6">Vous n'êtes inscrit à aucun cours.</p>
                  <a href="/academy/catalog" className="text-gold font-bold underline">Parcourir le catalogue</a>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {enrollments.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </section>
          ) : (
            <section className="bg-white border border-gray-100 shadow-sm rounded-3xl p-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-heading font-bold text-primary flex items-center gap-3">
                  <Settings className="w-6 h-6 text-gold" /> Vos Formations
                </h2>
                <a href="/instructor" className="text-sm font-bold text-gold hover:underline">Gérer mes cours</a>
              </div>
              {myCourses.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 mb-4">Vous n'avez pas encore créé de cours.</p>
                  <a href="/instructor" className="text-gold font-bold underline">Créer mon premier cours</a>
                </div>
              ) : (
                <div className="grid gap-4">
                  {myCourses.map((course: any) => (
                    <div key={course.id} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-lg text-primary">{course.title}</h4>
                        <p className="text-xs text-gray-400">{course.students_count || 0} élèves inscrits</p>
                      </div>
                      <div className="flex gap-3">
                        <a href={`/academy/course/${course.id}/upload`} className="text-xs bg-gray-100 text-dark px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition">Modifier</a>
                        <a href={`/academy/course/${course.id}`} className="text-xs bg-gold text-primary px-4 py-2 rounded-lg font-bold shadow-lg shadow-gold/10 hover:bg-gold-hover transition">Voir</a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyLearning;
