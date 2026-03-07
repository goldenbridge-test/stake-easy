import { useState, useEffect } from "react";
import { Star, Loader2 } from "lucide-react";
import { reviewsApi, getUser } from "../../services/api";

const StarRating = ({ value, onChange }: { value: number; onChange?: (v: number) => void }) => (
    <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
            <button key={n} type="button" onClick={() => onChange?.(n)} className={onChange ? "cursor-pointer" : "cursor-default"}>
                <Star className={`w-5 h-5 transition ${n <= value ? "fill-gold text-gold" : "text-gray-600"}`} />
            </button>
        ))}
    </div>
);

const CourseReviews = ({ courseId }: { courseId: number }) => {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");
    const currentUser = getUser();

    useEffect(() => {
        reviewsApi.list(courseId)
            .then(setReviews)
            .catch(() => setReviews([]))
            .finally(() => setLoading(false));
    }, [courseId]);

    const avgRating = reviews.length
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : "—";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) { setError("Veuillez écrire un commentaire."); return; }
        setSubmitting(true);
        setError("");
        try {
            const newReview = await reviewsApi.create(courseId, { rating, comment });
            setReviews(prev => [newReview, ...prev]);
            setComment("");
            setRating(5);
            setShowForm(false);
        } catch (e: any) {
            setError(e.message || "Une erreur est survenue");
        } finally {
            setSubmitting(false);
        }
    };

    const initials = (name: string) =>
        name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-2xl font-heading font-bold text-white mb-1">Notes & Avis</h2>
                    <p className="text-sm text-gray-400">Ce que pensent nos étudiants</p>
                </div>
                {currentUser && !showForm && (
                    <button onClick={() => setShowForm(true)}
                        className="self-start sm:self-auto bg-gold text-primary text-xs font-bold px-6 py-3 rounded-xl hover:bg-gold-hover transition flex items-center gap-2">
                        <Star className="w-3.5 h-3.5" /> Laisser un avis
                    </button>
                )}
            </div>

            {/* Average Rating Banner */}
            {reviews.length > 0 && !showForm && (
                <div className="flex items-center gap-6 bg-primary-dark border border-gold/20 rounded-2xl p-6 mb-8">
                    <div className="text-center shrink-0 pr-6 border-r border-white/10">
                        <div className="text-5xl font-heading font-bold text-gold leading-none">{avgRating}</div>
                        <div className="mt-2"><StarRating value={Math.round(Number(avgRating))} /></div>
                        <p className="text-[11px] text-gray-400 mt-1">{reviews.length} avis</p>
                    </div>
                    <div className="flex-1 space-y-2.5">
                        {[5, 4, 3, 2, 1].map(star => {
                            const count = reviews.filter(r => r.rating === star).length;
                            const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
                            return (
                                <div key={star} className="flex items-center gap-3">
                                    <span className="text-[11px] text-gray-400 w-4 shrink-0">{star}</span>
                                    <Star className="w-3 h-3 fill-gold text-gold shrink-0" />
                                    <div className="flex-1 bg-primary rounded-full h-1.5">
                                        <div className="bg-gold h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className="text-[11px] text-gray-400 w-8 text-right">{pct}%</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-primary-dark border border-gold/20 rounded-2xl p-8 mb-8">
                    <h3 className="font-heading font-bold text-lg text-white mb-6">Partagez votre expérience</h3>
                    <div className="mb-6">
                        <label className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-3 block">Votre note</label>
                        <StarRating value={rating} onChange={setRating} />
                    </div>
                    <div className="mb-6">
                        <label className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-3 block">Commentaire</label>
                        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4}
                            placeholder="Partagez ce que vous avez appris, ce qui vous a plu..."
                            className="w-full bg-primary border border-white/20 rounded-xl p-4 text-gray-200 placeholder-gray-500 resize-none focus:outline-none focus:border-gold text-sm transition" />
                    </div>
                    {error && <p className="text-red-400 text-xs mb-4">{error}</p>}
                    <div className="flex gap-3">
                        <button type="submit" disabled={submitting}
                            className="flex items-center gap-2 bg-gold text-primary font-bold px-6 py-2.5 rounded-xl hover:bg-gold-hover transition disabled:opacity-50">
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
                            Publier l'avis
                        </button>
                        <button type="button" onClick={() => setShowForm(false)}
                            className="px-6 py-2.5 rounded-xl border border-white/20 text-gray-300 hover:text-white transition text-sm font-bold">
                            Annuler
                        </button>
                    </div>
                </form>
            )}

            {/* Reviews List */}
            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-16 bg-primary-dark border border-white/10 rounded-2xl">
                    <div className="w-14 h-14 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Star className="w-7 h-7 text-gold" />
                    </div>
                    <p className="font-bold text-white mb-1">Aucun avis pour l'instant</p>
                    <p className="text-sm text-gray-400">Soyez le premier à partager votre expérience !</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((r, i) => {
                        const name = r.student_name || "Étudiant";
                        return (
                            <div key={r.id || i} className="bg-primary-dark border border-white/10 rounded-2xl p-6">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gold/10 border border-gold/20 rounded-xl flex items-center justify-center text-gold font-bold text-sm flex-shrink-0">
                                            {initials(name)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{name}</p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">
                                                {r.created_at ? new Date(r.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : ""}
                                            </p>
                                        </div>
                                    </div>
                                    <StarRating value={r.rating} />
                                </div>
                                <p className="text-sm text-gray-300 leading-relaxed pl-[52px]">{r.comment}</p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CourseReviews;
