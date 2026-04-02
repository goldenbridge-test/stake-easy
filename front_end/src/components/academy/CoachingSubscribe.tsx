import React, { useState } from "react";
import { paymentsApi } from "../../services/api";
import { Loader2, Calendar, Target, CheckCircle } from "lucide-react";

interface CoachingSubscribeProps {
    instructorId: number;
    instructorName: string;
    onCancel: () => void;
}

const CoachingSubscribe: React.FC<CoachingSubscribeProps> = ({
    instructorId,
    instructorName,
    onCancel,
}) => {
    const [sessions, setSessions] = useState(8);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success] = useState(false);

    const pricePerSession = 50;
    const totalPrice = sessions * pricePerSession;

    const handleSubscribe = async () => {
        try {
            setLoading(true);
            setError("");
            const { checkout_url, transaction_id } = await paymentsApi.createCheckout({
                type: "coaching",
                item_id: instructorId,
                provider: "fedapay",
            });
            localStorage.setItem("pending_transaction_id", transaction_id);
            localStorage.setItem("payment_redirect", "/academy/coaching");
            window.location.href = checkout_url;
        } catch (err: any) {
            setError(err.message || "Failed to initiate payment");
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-green-100 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-primary mb-2">Inscription Réussie !</h2>
                <p className="text-gray-500">Votre programme de coaching avec {instructorName} a été créé.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-gold" />
                </div>
                <div>
                    <h2 className="text-xl font-heading font-bold text-primary">Coaching Personnel</h2>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Avec {instructorName}</p>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nombre de sessions</label>
                    <div className="grid grid-cols-4 gap-2">
                        {[4, 8, 12, 16].map((num) => (
                            <button
                                key={num}
                                onClick={() => setSessions(num)}
                                className={`py-2 rounded-lg text-sm font-bold transition ${sessions === num
                                        ? "bg-primary text-white shadow-md shadow-primary/20"
                                        : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                                    }`}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-500">Prix par session</span>
                        <span className="text-sm font-bold text-primary">{pricePerSession}€</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Total pour {sessions} sessions</span>
                        <span className="text-lg font-heading font-bold text-gold">{totalPrice}€</span>
                    </div>
                </div>

                {error && (
                    <p className="text-xs text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-500 font-bold hover:bg-gray-50 transition"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubscribe}
                        disabled={loading}
                        className="flex-[2] bg-gold hover:bg-gold-hover text-primary font-bold py-3 rounded-xl shadow-lg shadow-gold/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />}
                        Confirmer l'inscription
                    </button>
                </div>
            </div>

            <p className="text-[10px] text-center text-gray-400 mt-6 uppercase tracking-widest font-bold">
                Accès direct • Aucune vérification de solde requise
            </p>
        </div>
    );
};

export default CoachingSubscribe;
