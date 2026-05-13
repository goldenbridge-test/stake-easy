import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";
import {
    Plus, BookOpen, Target, Upload, Edit3, Trash2, Eye,
    BarChart2, Users, Award, Loader2, ChevronRight, Video,
    Star, TrendingUp, Settings, X, CheckCircle2
} from "lucide-react";
import { coursesApi, coachingApi, analyticsApi, getUser } from "../../services/api";
import B2bOpportunities from "./B2bOpportunities";

const LEVELS = ["beginner", "intermediate", "advanced"];

interface CourseForm {
    title: string;
    description: string;
    price: string;
    level: string;
    category: number;
    is_free: boolean;
    has_coaching: boolean;
    coaching_price_per_session: string;
    image_url: string;
}

const defaultForm: CourseForm = {
    title: "",
    description: "",
    price: "0",
    level: "beginner",
    category: 1,
    is_free: false,
    has_coaching: false,
    coaching_price_per_session: "50",
    image_url: "",
};

const InstructorDashboard = () => {
    const navigate = useNavigate();
    const currentUser = getUser();

    const [courses, setCourses] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<CourseForm>(defaultForm);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<"courses" | "coaching" | "stats" | "b2b">("courses");

    // Check role
    if (!currentUser || (currentUser.role !== "instructor" && currentUser.role !== "admin")) {
        return (
            <div className="bg-primary min-h-screen flex items-center justify-center font-body text-white">
                <div className="text-center">
                    <p className="text-red-400 mb-4">Accès réservé aux instructeurs.</p>
                    <Link to="/" className="text-gold underline">Retour à l'accueil</Link>
                </div>
            </div>
        );
    }

    useEffect(() => {
        const load = async () => {
            try {
                const [myCourses, cats, stats] = await Promise.all([
                    coursesApi.myCourses().catch(() => []),
                    coursesApi.categories().catch(() => []),
                    analyticsApi.mySummary().catch(() => null),
                ]);
                setCourses(myCourses.results || myCourses);
                setCategories(cats);
                setStats(stats);
            } catch {
                /* silent */
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const patchForm = (patch: Partial<CourseForm>) => setForm(prev => ({ ...prev, ...patch }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        setSaving(true);
        try {
            if (editingId) {
                const updated = await coursesApi.update(editingId, form);
                setCourses(prev => prev.map(c => c.id === editingId ? updated : c));
            } else {
                const created = await coursesApi.create(form);
                setCourses(prev => [created, ...prev]);
                // Redirect to upload page after creation
                navigate(`/academy/course/${created.id}/upload`);
                return;
            }
            setShowForm(false);
            setEditingId(null);
            setForm(defaultForm);
        } catch (err: any) {
            alert(err.message || "Erreur lors de la sauvegarde");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (course: any) => {
        setEditingId(course.id);
        setForm({
            title: course.title || "",
            description: course.description || "",
            price: course.price || "0",
            level: course.level || "beginner",
            category: course.category || 1,
            is_free: course.is_free || false,
            has_coaching: course.has_coaching || false,
            coaching_price_per_session: course.coaching_price_per_session || "50",
            image_url: course.image_url || "",
        });
        setShowForm(true);
    };

    const handleTogglePublish = async (course: any) => {
        const isPublished = course.status === "published";
        if (!confirm(isPublished ? "Dépublier ce cours ?" : "Publier ce cours ?")) return;
        try {
            await (isPublished ? coursesApi.unpublish(course.id) : coursesApi.publish(course.id));
            setCourses((prev) =>
                prev.map((c) => c.id === course.id ? { ...c, status: isPublished ? "draft" : "published" } : c)
            );
        } catch {
            alert("Action failed. Please try again.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Supprimer ce cours définitivement ?")) return;
        try {
            await coursesApi.delete(id);
            setCourses(prev => prev.filter(c => c.id !== id));
        } catch { alert("Impossible de supprimer ce cours"); }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setForm(defaultForm);
    };

    const TABS = [
        { key: "courses", label: "Mes Cours", icon: <BookOpen className="w-4 h-4" /> },
        { key: "coaching", label: "Coaching", icon: <Target className="w-4 h-4" /> },
        { key: "b2b", label: "Opportunités B2B", icon: <Briefcase className="w-4 h-4" /> },
        { key: "stats", label: "Statistiques", icon: <BarChart2 className="w-4 h-4" /> },
    ] as const;

    return (
        <div className="bg-primary min-h-screen font-body text-white flex flex-col">
            <Navbar />

            <main className="flex-1 pt-32 pb-20 px-4">
                <div className="max-w-6xl mx-auto">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-gold/10 rounded-2xl flex items-center justify-center text-gold">
                                    <Settings className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[11px] text-gold uppercase font-bold tracking-widest">Portail Instructeur</p>
                                    <h1 className="text-2xl font-heading font-bold">Bonjour, {currentUser.username} 👋</h1>
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm mt-1">Créez, gérez et optimisez vos formations.</p>
                        </div>
                        <button
                            onClick={() => { setShowForm(true); setEditingId(null); setForm(defaultForm); }}
                            className="flex items-center gap-3 bg-gold text-primary font-bold px-6 py-3 rounded-2xl hover:bg-gold-hover transition shadow-xl shadow-gold/20"
                        >
                            <Plus className="w-5 h-5" /> Créer un cours
                        </button>
                    </div>

                    {/* Quick Stats */}
                    {stats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                            {[
                                { icon: <BookOpen />, label: "Cours actifs", value: courses.length },
                                { icon: <Users />, label: "Étudiants", value: stats.total_students || 0 },
                                { icon: <TrendingUp />, label: "Revenu", value: `$${stats.total_revenue || 0}` },
                                { icon: <Star />, label: "Note moy.", value: (stats.avg_rating || "—") },
                            ].map((s, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                                    <div className="text-gold mb-3 w-5 h-5">{s.icon}</div>
                                    <p className="text-2xl font-heading font-bold text-white">{s.value}</p>
                                    <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex gap-1 bg-white/5 p-1 rounded-2xl border border-white/5 mb-8 w-fit">
                        {TABS.map(t => (
                            <button key={t.key} onClick={() => setActiveTab(t.key)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${activeTab === t.key ? "bg-white text-primary" : "text-gray-400 hover:text-white"}`}>
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>

                    {/* ── TAB: COURSES ── */}
                    {activeTab === "courses" && (
                        <>
                            {/* Course Creation / Edit Form */}
                            {showForm && (
                                <div className="bg-[#0d1a2d] border border-white/10 rounded-3xl p-8 mb-8 shadow-2xl">
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-xl font-heading font-bold">{editingId ? "Modifier le cours" : "Nouveau cours"}</h2>
                                        <button onClick={handleCancel} className="text-gray-500 hover:text-white transition"><X className="w-6 h-6" /></button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {/* Title */}
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2">Titre du cours *</label>
                                                <input
                                                    value={form.title} onChange={e => patchForm({ title: e.target.value })} required
                                                    placeholder="ex: Introduction à la Blockchain"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white font-bold text-lg focus:outline-none focus:border-gold/50 placeholder:text-gray-600"
                                                />
                                            </div>

                                            {/* Description */}
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2">Description</label>
                                                <textarea
                                                    value={form.description} onChange={e => patchForm({ description: e.target.value })} rows={4}
                                                    placeholder="Décrivez ce que les étudiants vont apprendre..."
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-gray-200 resize-none focus:outline-none focus:border-gold/50 placeholder:text-gray-600 text-sm"
                                                />
                                            </div>

                                            {/* Category */}
                                            <div>
                                                <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2">Catégorie</label>
                                                <select value={form.category} onChange={e => patchForm({ category: Number(e.target.value) })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-gold/50 text-sm">
                                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                </select>
                                            </div>

                                            {/* Level */}
                                            <div>
                                                <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2">Niveau</label>
                                                <div className="flex gap-2">
                                                    {LEVELS.map(l => (
                                                        <button type="button" key={l} onClick={() => patchForm({ level: l })}
                                                            className={`flex-1 py-3 rounded-xl text-xs font-bold capitalize border transition ${form.level === l ? "bg-gold/10 border-gold text-gold" : "border-white/10 text-gray-400 hover:border-white/30"}`}>
                                                            {l}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Prix (FCFA)</label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <div className={`w-10 h-5 rounded-full transition ${form.is_free ? "bg-gold" : "bg-white/10"}`}
                                                            onClick={() => patchForm({ is_free: !form.is_free, price: !form.is_free ? "0" : form.price })}>
                                                            <div className={`w-4 h-4 bg-white rounded-full m-0.5 transition-transform ${form.is_free ? "translate-x-5" : ""}`} />
                                                        </div>
                                                        <span className="text-xs text-gray-400">Gratuit</span>
                                                    </label>
                                                </div>
                                                <input type="number" value={form.price} onChange={e => patchForm({ price: e.target.value })}
                                                    disabled={form.is_free} min="0"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-gold/50 text-sm disabled:opacity-30"
                                                />
                                            </div>

                                            {/* Image URL */}
                                            <div>
                                                <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2">URL de l'image de couverture</label>
                                                <input value={form.image_url} onChange={e => patchForm({ image_url: e.target.value })}
                                                    placeholder="https://..."
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-gray-200 focus:outline-none focus:border-gold/50 text-sm placeholder:text-gray-600"
                                                />
                                            </div>

                                            {/* Coaching Toggle */}
                                            <div className="md:col-span-2 bg-gold/5 border border-gold/10 rounded-2xl p-5">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                                        <p className="font-bold text-white">Activer le Coaching</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">Proposez des sessions 1-on-1 en complément de ce cours</p>
                                                    </div>
                                                    <div className={`w-12 h-6 rounded-full cursor-pointer transition ${form.has_coaching ? "bg-gold" : "bg-white/10"}`}
                                                        onClick={() => patchForm({ has_coaching: !form.has_coaching })}>
                                                        <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition-transform ${form.has_coaching ? "translate-x-6" : ""}`} />
                                                    </div>
                                                </div>
                                                {form.has_coaching && (
                                                    <div>
                                                        <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2">Prix par session (FCFA)</label>
                                                        <input type="number" value={form.coaching_price_per_session}
                                                            onChange={e => patchForm({ coaching_price_per_session: e.target.value })} min="0"
                                                            className="w-full md:w-80 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-gold/50 text-sm"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-4 border-t border-white/10">
                                            <button type="submit" disabled={saving}
                                                className="flex items-center gap-3 bg-gold text-primary font-bold px-8 py-3.5 rounded-2xl hover:bg-gold-hover transition disabled:opacity-50 shadow-lg shadow-gold/20">
                                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                                {saving ? "Enregistrement..." : editingId ? "Sauvegarder" : "Créer & Ajouter les vidéos →"}
                                            </button>
                                            <button type="button" onClick={handleCancel}
                                                className="px-8 py-3.5 rounded-2xl border border-white/10 text-gray-400 hover:text-white font-bold transition text-sm">
                                                Annuler
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Course List */}
                            {loading ? (
                                <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 text-gold animate-spin" /></div>
                            ) : courses.length === 0 ? (
                                <div className="py-20 text-center border-2 border-dashed border-white/10 rounded-3xl">
                                    <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-white mb-2">Aucun cours pour l'instant</h3>
                                    <p className="text-gray-500 mb-8">Créez votre premier cours et commencez à enseigner.</p>
                                    <button onClick={() => setShowForm(true)}
                                        className="bg-gold text-primary font-bold px-8 py-3 rounded-2xl hover:bg-gold-hover transition shadow-lg shadow-gold/20">
                                        <Plus className="w-4 h-4 inline mr-2" /> Créer mon premier cours
                                    </button>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-5">
                                    {courses.map(course => (
                                        <div key={course.id} className="bg-[#0d1a2d] border border-white/10 rounded-3xl overflow-hidden hover:border-gold/20 transition group">
                                            {/* Thumbnail */}
                                            <div className="relative h-44 bg-gradient-to-br from-primary to-[#0d1a2d] overflow-hidden">
                                                {course.image_url ? (
                                                    <img src={course.image_url} alt={course.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition" />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <BookOpen className="w-12 h-12 text-gold/20" />
                                                    </div>
                                                )}
                                                <div className="absolute top-4 left-4">
                                                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase tracking-widest ${course.status === "Published" ? "bg-green-500/10 border-green-500/30 text-green-400"
                                                            : "bg-gray-500/10 border-gray-500/30 text-gray-400"
                                                        }`}>{course.status || "Draft"}</span>
                                                </div>
                                                <div className="absolute top-4 right-4">
                                                    <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold">
                                                        {course.is_free ? "Free" : `${Number(course.price).toLocaleString("fr-FR")} FCFA`}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-6">
                                                <h3 className="font-heading font-bold text-lg text-white mb-1 line-clamp-1">{course.title}</h3>
                                                <p className="text-xs text-gray-500 line-clamp-2 mb-5">{course.description || "Aucune description."}</p>

                                                {/* Stats Row */}
                                                <div className="flex gap-4 mb-5">
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                        <Users className="w-3.5 h-3.5" /> {course.students_count || 0} étudiants
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                        <Star className="w-3.5 h-3.5 fill-gold text-gold" /> {course.avg_rating || "—"}
                                                    </div>
                                                    {course.has_coaching && (
                                                        <div className="flex items-center gap-1.5 text-xs text-gold">
                                                            <Target className="w-3.5 h-3.5" /> Coaching actif
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-2">
                                                    <Link to={`/academy/course/${course.id}/upload`}
                                                        className="flex-1 flex items-center justify-center gap-2 bg-gold/10 border border-gold/20 text-gold font-bold py-2.5 rounded-xl hover:bg-gold/20 transition text-xs">
                                                        <Video className="w-3.5 h-3.5" /> Vidéos
                                                    </Link>
                                                    <button
                                                        onClick={() => handleTogglePublish(course)}
                                                        title={course.status === "published" ? "Dépublier" : "Publier"}
                                                        className={`p-2.5 border rounded-xl transition text-xs font-bold ${
                                                            course.status === "published"
                                                                ? "bg-green-500/10 border-green-500/20 text-green-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400"
                                                                : "bg-white/5 border-white/10 text-gray-400 hover:border-green-500/30 hover:text-green-400"
                                                        }`}>
                                                        {course.status === "published" ? "Live" : "Draft"}
                                                    </button>
                                                    <button onClick={() => handleEdit(course)}
                                                        className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:border-white/30 transition text-gray-400 hover:text-white">
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <Link to={`/academy/course/${course.id}`}
                                                        className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:border-white/30 transition text-gray-400 hover:text-white">
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <button onClick={() => handleDelete(course.id)}
                                                        className="p-2.5 bg-red-500/5 border border-red-500/10 rounded-xl hover:border-red-500/30 transition text-gray-600 hover:text-red-400">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* ── TAB: COACHING ── */}
                    {activeTab === "coaching" && (
                        <div className="space-y-6">
                            <div className="bg-[#0d1a2d] border border-white/10 rounded-3xl p-8 text-center">
                                <Target className="w-12 h-12 text-gold mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2">Gérez vos programmes de coaching</h3>
                                <p className="text-gray-400 mb-6">Accédez à vos sessions, validessions et demandes actives.</p>
                                <Link to="/academy/coaching" className="inline-flex items-center gap-2 bg-gold text-primary font-bold px-8 py-3 rounded-2xl hover:bg-gold-hover transition shadow-lg shadow-gold/20">
                                    <Target className="w-5 h-5" /> Voir les programmes <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* ── TAB: B2B OPPORTUNITIES ── */}
                    {activeTab === "b2b" && (
                        <div className="bg-[#0d1a2d] border border-white/10 rounded-3xl p-8">
                            <B2bOpportunities />
                        </div>
                    )}

                    {/* ── TAB: STATS ── */}
                    {activeTab === "stats" && (
                        <div className="bg-[#0d1a2d] border border-white/10 rounded-3xl p-8 text-center">
                            <BarChart2 className="w-12 h-12 text-gold mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">Statistiques détaillées</h3>
                            <p className="text-gray-400">Les analytics avancées seront disponibles dès que le backend sera connecté.</p>
                        </div>
                    )}

                </div>
            </main>
            <Footer />
        </div>
    );
};

export default InstructorDashboard;
