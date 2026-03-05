import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Award, Download, CheckCircle2, Loader2, ExternalLink } from "lucide-react";
import { certificateApi, getUser } from "../../services/api";
import Navbar from "../Navbar";
import Footer from "../Footer";

const CourseCertificate = () => {
    const { id } = useParams<{ id: string }>();
    const courseId = parseInt(id!);
    const currentUser = getUser();

    const [cert, setCert] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        certificateApi.get(courseId)
            .then(setCert)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [courseId]);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const blob = await certificateApi.downloadPdf(courseId);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `certificat-${cert?.course_title?.replace(/\s+/g, "-").toLowerCase()}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            alert("Erreur lors du téléchargement du PDF");
        } finally {
            setDownloading(false);
        }
    };

    if (loading) return (
        <div className="bg-primary min-h-screen flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-gold animate-spin" />
        </div>
    );

    if (error) return (
        <div className="bg-primary min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center flex-col gap-6 px-4 text-center pt-32">
                <Award className="w-16 h-16 text-gray-600" />
                <h1 className="text-2xl font-heading font-bold text-white">Certificat Non Disponible</h1>
                <p className="text-gray-400 max-w-md">{error}</p>
                <Link to={`/academy/course/${courseId}/player`}
                    className="bg-gold text-primary font-bold px-8 py-3 rounded-xl hover:bg-gold-hover transition">
                    Continuer le cours
                </Link>
            </div>
        </div>
    );

    const issuedDate = cert?.issued_at
        ? new Date(cert.issued_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
        : "—";

    return (
        <div className="bg-primary min-h-screen font-body text-white flex flex-col">
            <Navbar />
            <main className="flex-1 pt-32 pb-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-heading font-bold mb-3">Votre Certificat</h1>
                        <p className="text-gray-400">Félicitations pour avoir complété ce cours !</p>
                    </div>

                    {/* Certificate Card */}
                    <div className="relative bg-gradient-to-br from-[#0d1a2d] to-[#050f1e] border border-gold/30 rounded-3xl p-12 md:p-16 shadow-[0_0_80px_rgba(212,175,55,0.1)] overflow-hidden mb-8">
                        {/* Background decoration */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-60" />
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-60" />
                        <div className="absolute -top-20 -left-20 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />

                        {/* Logo */}
                        <div className="flex justify-center mb-10">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gold rounded-2xl flex items-center justify-center text-primary font-heading font-bold text-lg">GB</div>
                                <span className="text-xl font-heading font-bold text-gold tracking-tight">GoldenBridge Academy</span>
                            </div>
                        </div>

                        {/* Title */}
                        <div className="text-center mb-10">
                            <p className="text-[11px] uppercase font-bold tracking-[0.3em] text-gold/60 mb-4">Certificat d'Accomplissement</p>
                            <p className="text-gray-400 text-lg mb-2">Décerné à</p>
                            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6 tracking-wide">
                                {cert?.student_name || currentUser?.username}
                            </h2>
                            <p className="text-gray-400 mb-3">Pour avoir complété avec succès</p>
                            <h3 className="text-2xl md:text-3xl font-heading font-bold text-gold">
                                {cert?.course_title}
                            </h3>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-10">
                            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-gold/30" />
                            <Award className="w-6 h-6 text-gold" />
                            <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-gold/30" />
                        </div>

                        {/* Footer Info */}
                        <div className="grid grid-cols-3 text-center gap-6">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-gray-600 tracking-widest mb-1">Date</p>
                                <p className="text-sm font-medium text-white">{issuedDate}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-gray-600 tracking-widest mb-1">Code</p>
                                <p className="text-xs font-mono text-gold">{cert?.verification_code || "GB-XXXX"}</p>
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

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button onClick={handleDownload} disabled={downloading}
                            className="flex items-center justify-center gap-3 bg-gold text-primary font-bold px-10 py-4 rounded-2xl hover:bg-gold-hover transition shadow-xl shadow-gold/20 disabled:opacity-50">
                            {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                            Télécharger en PDF
                        </button>
                        <a href={`/verify/${cert?.verification_code}`} target="_blank" rel="noreferrer"
                            className="flex items-center justify-center gap-3 bg-white/5  border border-white/10 font-bold px-10 py-4 rounded-2xl hover:bg-white/10 transition">
                            <ExternalLink className="w-5 h-5" />
                            Vérifier le certificat
                        </a>
                    </div>

                    {/* Back to My Courses */}
                    <div className="text-center mt-8">
                        <Link to="/academy/my-learning" className="text-sm text-gray-500 hover:text-gold underline transition">
                            Retour à mes formations
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CourseCertificate;
