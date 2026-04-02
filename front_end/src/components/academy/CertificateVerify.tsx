import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Award, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { certificateApi } from "../../services/api";
import Navbar from "../Navbar";
import Footer from "../Footer";

const CertificateVerify = () => {
    const { code } = useParams<{ code: string }>();
    const [cert, setCert] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!code) return;
        certificateApi.verify(code)
            .then(setCert)
            .catch(() => setError("Ce code de certificat est invalide ou inexistant."))
            .finally(() => setLoading(false));
    }, [code]);

    const issuedDate = cert?.issued_at
        ? new Date(cert.issued_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
        : "—";

    return (
        <div className="bg-primary min-h-screen font-body text-white flex flex-col">
            <Navbar />
            <main className="flex-1 pt-32 pb-20 px-4 flex items-center justify-center">
                <div className="max-w-2xl w-full mx-auto">

                    {loading ? (
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 text-gold animate-spin mx-auto mb-4" />
                            <p className="text-gray-400">Vérification en cours...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-12 text-center">
                            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
                            <h1 className="text-2xl font-heading font-bold text-white mb-3">Certificat Introuvable</h1>
                            <p className="text-gray-400 mb-8">{error}</p>
                            <Link to="/" className="inline-block bg-gold text-primary font-bold px-8 py-3 rounded-xl hover:bg-gold-hover transition">
                                Retour à l'accueil
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Status Banner */}
                            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5 flex items-center gap-4">
                                <CheckCircle2 className="w-8 h-8 text-green-400 flex-shrink-0" />
                                <div>
                                    <p className="font-bold text-green-400">Certificat Vérifié</p>
                                    <p className="text-sm text-gray-400">Ce certificat est authentique et a été émis par GoldenBridge Academy.</p>
                                </div>
                            </div>

                            {/* Certificate Card */}
                            <div className="relative bg-gradient-to-br from-[#0d1a2d] to-[#050f1e] border border-gold/30 rounded-3xl p-10 md:p-14 shadow-[0_0_60px_rgba(212,175,55,0.08)] overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-60" />
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-60" />
                                <div className="absolute -top-16 -left-16 w-48 h-48 bg-gold/5 rounded-full blur-3xl" />
                                <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-gold/5 rounded-full blur-3xl" />

                                {/* Logo */}
                                <div className="flex justify-center mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center text-primary font-heading font-bold">GB</div>
                                        <span className="text-lg font-heading font-bold text-gold tracking-tight">GoldenBridge Academy</span>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <p className="text-[11px] uppercase font-bold tracking-[0.3em] text-gold/60 mb-3">Certificat d'Accomplissement</p>
                                    <p className="text-gray-400 mb-2">Décerné à</p>
                                    <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-5">
                                        {cert?.student_name || "—"}
                                    </h2>
                                    <p className="text-gray-400 mb-2">Pour avoir complété avec succès</p>
                                    <h3 className="text-xl md:text-2xl font-heading font-bold text-gold">
                                        {cert?.course_title || "—"}
                                    </h3>
                                </div>

                                <div className="flex items-center gap-4 my-8">
                                    <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-gold/30" />
                                    <Award className="w-5 h-5 text-gold" />
                                    <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-gold/30" />
                                </div>

                                <div className="grid grid-cols-3 text-center gap-4">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-gray-600 tracking-widest mb-1">Date</p>
                                        <p className="text-sm font-medium text-white">{issuedDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-gray-600 tracking-widest mb-1">Code</p>
                                        <p className="text-xs font-mono text-gold">{cert?.verification_code || code}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-gray-600 tracking-widest mb-1">Statut</p>
                                        <div className="flex items-center justify-center gap-1 text-green-400">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            <span className="text-xs font-bold">Vérifié</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center">
                                <Link to="/academy/catalog" className="text-sm text-gray-500 hover:text-gold underline transition">
                                    Explorer nos formations
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CertificateVerify;
