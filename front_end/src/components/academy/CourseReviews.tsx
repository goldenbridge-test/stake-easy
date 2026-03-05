import { useState, useEffect } from "react";
import { Star, Loader2, User } from "lucide-react";
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

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-heading font-bold">Notes & Avis</h2>
                    {reviews.length > 0 && (
                        <div className="flex items-center gap-2 bg-gold/10 border border-gold/20 px-4 py-2 rounded-xl">
                            <Star className="w-4 h-4 fill-gold text-gold" />
                            <span className="font-bold text-gold">{avgRating}</span>
                            <span className="text-gray-500 text-sm">({reviews.length} avis)</span>
                        </div>
                    )}
                </div>
                {currentUser && !showForm && (
                    <button onClick={() => setShowForm(true)}
                        className="bg-gold text-primary text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-gold-hover transition shadow-lg shadow-gold/10">
                        Laisser un avis
                    </button>
                )}
            </div>

            {/* Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                    <h3 className="font-bold mb-5">Votre avis</h3>
                    <div className="mb-5">
                        <label className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-3 block">Note</label>
                        <StarRating value={rating} onChange={setRating} />
                    </div>
                    <div className="mb-5">
                        <label className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-3 block">Commentaire</label>
                        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4}
                            placeholder="Partagez votre expérience avec ce cours..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-gray-200 placeholder:text-gray-600 resize-none focus:outline-none focus:border-gold/50 text-sm" />
                    </div>
                    {error && <p className="text-red-400 text-xs mb-4">{error}</p>}
                    <div className="flex gap-3">
                        <button type="submit" disabled={submitting}
                            className="flex items-center gap-2 bg-gold text-primary font-bold px-6 py-2.5 rounded-xl hover:bg-gold-hover transition disabled:opacity-50">
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Publier
                        </button>
                        <button type="button" onClick={() => setShowForm(false)}
                            className="px-6 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white transition text-sm font-bold">
                            Annuler
                        </button>
                    </div>
                </form>
            )}

            {/* Reviews List */}
            {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
                    <Star className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500">Aucun avis pour l'instant. Soyez le premier !</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((r, i) => (
                        <div key={r.id || i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-gold/10 rounded-full flex items-center justify-center text-gold">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">{r.student_name || "Étudiant"}</p>
                                        <p className="text-[10px] text-gray-600 mt-0.5">
                                            {r.created_at ? new Date(r.created_at).toLocaleDateString("fr-FR") : ""}
                                        </p>
                                    </div>
                                </div>
                                <StarRating value={r.rating} />
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed">{r.comment}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CourseReviews;
