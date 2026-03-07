import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import {
    CheckCircle2, Lock, Play, ChevronRight, ChevronDown, ChevronLeft,
    BookOpen, StickyNote, HelpCircle, Award, X, AlertCircle,
    Loader2, SkipForward, Menu, Star
} from "lucide-react";
import { modulesApi, progressApi, quizApi, notesApi, certificateApi, getUser } from "../../services/api";

// ─── Types ─────────────────────────────────────────────────────────────────
interface Choice { id: number; text: string; }
interface Question { id: number; text: string; choices: Choice[]; }
interface Quiz { id: number; questions: Question[]; }
interface Chapter {
    id: number; title: string; duration: string; order: number;
    content_type: 'video' | 'text' | 'pdf';
    text_content?: string;
    pdf_url?: string;
    has_quiz: boolean; is_free_preview: boolean;
}
interface Module {
    id: number; title: string; order: number; chapters: Chapter[];
}
interface Progress {
    percentage: number; completed_chapters: number[]; last_chapter_id: number | null;
}

// ─── QuizPanel Component ──────────────────────────────────────────────────
const QuizPanel = ({ quiz, onClose, onPass }: { quiz: Quiz; onClose: () => void; onPass: () => void }) => {
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (Object.keys(answers).length < quiz.questions.length) {
            alert("Veuillez répondre à toutes les questions");
            return;
        }
        setLoading(true);
        try {
            const formatted = Object.entries(answers).map(([qid, cid]) => ({
                question_id: Number(qid), choice_id: cid
            }));
            const res = await quizApi.submit(quiz.id, formatted);
            setResult(res);
            if (res.passed) setTimeout(() => onPass(), 2000);
        } catch {
            alert("Erreur lors de la soumission");
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-primary/95 backdrop-blur-sm px-4 py-8">
            <div className="bg-[#0d1a2d] border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="p-8 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold">
                            <HelpCircle className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-heading font-bold text-white">Quiz du chapitre</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition"><X className="w-6 h-6" /></button>
                </div>

                {result ? (
                    <div className="p-10 text-center">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl font-bold ${result.passed ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                            {result.score}%
                        </div>
                        <h3 className={`text-2xl font-bold mb-3 ${result.passed ? "text-green-400" : "text-red-400"}`}>
                            {result.passed ? "🎉 Réussi !" : "❌ Échoué"}
                        </h3>
                        <p className="text-gray-400 mb-8">
                            {result.passed ? "Vous avez passé le quiz avec succès. Passage au chapitre suivant..." : "Score insuffisant. Révisez le chapitre et réessayez."}
                        </p>
                        {!result.passed && (
                            <button onClick={() => { setResult(null); setAnswers({}); }}
                                className="bg-gold text-primary font-bold px-8 py-3 rounded-xl hover:bg-gold-hover transition">
                                Réessayer
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="p-8 space-y-8">
                        {quiz.questions.map((q, qi) => (
                            <div key={q.id}>
                                <p className="font-medium text-white mb-4 flex gap-3">
                                    <span className="text-gold font-bold">{qi + 1}.</span> {q.text}
                                </p>
                                <div className="space-y-3 pl-6">
                                    {q.choices.map(c => (
                                        <button key={c.id} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: c.id }))}
                                            className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition ${answers[q.id] === c.id
                                                ? "bg-gold/10 border-gold text-gold"
                                                : "bg-white/5 border-white/10 text-gray-300 hover:border-white/30"
                                                }`}>
                                            {c.text}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <div className="pt-4">
                            <button onClick={handleSubmit} disabled={loading}
                                className="w-full bg-gold text-primary font-bold py-4 rounded-xl hover:bg-gold-hover transition disabled:opacity-50 flex items-center justify-center gap-2">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><HelpCircle className="w-5 h-5" /> Valider les réponses</>}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Main CoursePlayer ────────────────────────────────────────────────────
const CoursePlayer = () => {
    const { id, chapterId: initialChapterId } = useParams<{ id: string; chapterId?: string }>();
    const navigate = useNavigate();
    const currentUser = getUser();
    const videoRef = useRef<HTMLVideoElement>(null);
    const savePositionRef = useRef<NodeJS.Timeout | null>(null);

    const [modules, setModules] = useState<Module[]>([]);
    const [progress, setProgress] = useState<Progress>({ percentage: 0, completed_chapters: [], last_chapter_id: null });
    const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
    const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
    const [videoUrl, setVideoUrl] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [videoLoading, setVideoLoading] = useState(false);
    const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
    const [noteContent, setNoteContent] = useState("");
    const [notesSaved, setNotesSaved] = useState(false);
    const [activeTab, setActiveTab] = useState<"content" | "notes">("content");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [courseTitle, setCourseTitle] = useState("");

    const courseId = parseInt(id!);

    // Load curriculum & progress
    useEffect(() => {
        const load = async () => {
            try {
                const [curriculum, prog] = await Promise.all([
                    modulesApi.getCurriculum(courseId),
                    progressApi.get(courseId),
                ]);
                setModules(curriculum.modules || []);
                setCourseTitle(curriculum.course_title || "Cours");
                setProgress(prog);

                // Expand all modules by default
                const ids = new Set<number>((curriculum.modules || []).map((m: Module) => m.id));
                setExpandedModules(ids);

                // Select chapter: URL param or last watched or first
                const targetId = initialChapterId
                    ? parseInt(initialChapterId)
                    : prog.last_chapter_id || curriculum.modules?.[0]?.chapters?.[0]?.id;

                if (targetId) {
                    const allChapters = (curriculum.modules || []).flatMap((m: Module) => m.chapters);
                    const ch = allChapters.find((c: Chapter) => c.id === targetId);
                    if (ch) pickChapter(ch, curriculum.modules || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [courseId]);

    const pickChapter = useCallback(async (chapter: Chapter, modulesList?: Module[]) => {
        const mods = modulesList || modules;
        const mod = mods.find(m => m.chapters.some(c => c.id === chapter.id));
        const modId = mod?.id || null;
        setActiveChapter(chapter);
        setActiveModuleId(modId);
        setVideoUrl("");
        setVideoLoading(true);
        setShowQuiz(false);
        setNoteContent("");

        try {
            if (chapter.content_type === 'video' && modId) {
                const { url } = await modulesApi.getVideoUrl(courseId, modId, chapter.id);
                setVideoUrl(url);
            } else if (chapter.content_type === 'pdf') {
                setVideoUrl(chapter.pdf_url || "");
            }
        } catch {
            setVideoUrl("");
        } finally {
            setVideoLoading(false);
        }
    }, [modules, courseId]);

    // Auto-save position every 15s
    const handleTimeUpdate = useCallback(() => {
        if (!videoRef.current || !activeChapter) return;
        if (savePositionRef.current) clearTimeout(savePositionRef.current);
        savePositionRef.current = setTimeout(() => {
            if (activeModuleId) {
                progressApi.savePosition(courseId, activeModuleId, activeChapter.id, Math.floor(videoRef.current!.currentTime));
            }
        }, 15000);
    }, [activeChapter, activeModuleId, courseId]);

    const handleVideoEnded = useCallback(async () => {
        if (!activeChapter || !activeModuleId) return;
        // Mark complete
        try {
            await modulesApi.completeChapter(courseId, activeModuleId, activeChapter.id);
            setProgress(prev => ({
                ...prev,
                completed_chapters: [...new Set([...prev.completed_chapters, activeChapter.id])],
            }));
            // Check for quiz
            if (activeChapter.has_quiz) {
                const quiz = await quizApi.getForChapter(courseId, activeModuleId, activeChapter.id);
                if (quiz) { setCurrentQuiz(quiz); setShowQuiz(true); return; }
            }
        } catch { /* silent */ }
        goNextChapter();
    }, [activeChapter, activeModuleId, courseId, modules]);

    const goNextChapter = useCallback(() => {
        const allChapters = modules.flatMap(m => m.chapters);
        const idx = allChapters.findIndex(c => c.id === activeChapter?.id);
        if (idx < allChapters.length - 1) pickChapter(allChapters[idx + 1]);
    }, [activeChapter, modules, pickChapter]);

    const goPrevChapter = useCallback(() => {
        const allChapters = modules.flatMap(m => m.chapters);
        const idx = allChapters.findIndex(c => c.id === activeChapter?.id);
        if (idx > 0) pickChapter(allChapters[idx - 1]);
    }, [activeChapter, modules, pickChapter]);

    const handleSaveNote = async () => {
        if (!activeChapter || !noteContent.trim()) return;
        try {
            await notesApi.save(courseId, activeChapter.id, noteContent);
            setNotesSaved(true);
            setTimeout(() => setNotesSaved(false), 2500);
        } catch { alert("Impossible de sauvegarder la note"); }
    };

    const completedPct = progress.percentage;
    const isCompleted = completedPct === 100;
    const allChapters = modules.flatMap(m => m.chapters);
    const currentIdx = allChapters.findIndex(c => c.id === activeChapter?.id);

    if (loading) return (
        <div className="bg-primary min-h-screen flex items-center justify-center">
            <div className="text-center text-gold">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
                <p className="font-heading font-bold tracking-widest text-sm uppercase">Chargement du cours...</p>
            </div>
        </div>
    );

    return (
        <div className="bg-primary min-h-screen font-body text-white flex flex-col">
            {/* Top Bar */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-[#050f1e]/95 backdrop-blur-xl border-b border-white/5 h-16 flex items-center justify-between px-4 md:px-8 gap-4">
                <div className="flex items-center gap-4 min-w-0">
                    <Link to={`/academy/course/${courseId}`} className="text-gray-400 hover:text-gold transition flex-shrink-0">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <button onClick={() => setSidebarOpen(v => !v)} className="text-gray-400 hover:text-gold transition flex-shrink-0 hidden md:block">
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="min-w-0">
                        <p className="text-[11px] text-gray-500 uppercase font-bold tracking-widest truncate">{courseTitle}</p>
                        <p className="text-sm font-medium text-white truncate">{activeChapter?.title}</p>
                    </div>
                </div>

                {/* Progress */}
                <div className="hidden md:flex items-center gap-4 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-40 bg-white/10 rounded-full h-1.5">
                            <div className="bg-gold h-1.5 rounded-full transition-all" style={{ width: `${completedPct}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-gold">{completedPct}%</span>
                    </div>
                    {isCompleted && (
                        <Link to={`/academy/course/${courseId}/certificate`}
                            className="flex items-center gap-2 bg-gold text-primary text-xs font-bold px-4 py-2 rounded-xl hover:bg-gold-hover transition shadow-lg shadow-gold/20">
                            <Award className="w-4 h-4" /> Certificat
                        </Link>
                    )}
                </div>

                {/* Chapter nav */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={goPrevChapter} disabled={currentIdx <= 0}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 disabled:opacity-30 hover:bg-white/10 transition">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={goNextChapter} disabled={currentIdx >= allChapters.length - 1}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 disabled:opacity-30 hover:bg-white/10 transition">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex flex-1 pt-16 h-screen overflow-hidden">
                {/* Sidebar Curriculum */}
                <aside className={`${sidebarOpen ? "w-80" : "w-0"} flex-shrink-0 bg-[#050f1e] border-r border-white/5 overflow-y-auto transition-all duration-300 hidden md:block`}>
                    <div className="p-5">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-heading font-bold text-sm uppercase tracking-widest text-gray-400">Curriculum</h3>
                            <span className="text-[10px] font-bold text-gold bg-gold/10 px-2 py-1 rounded-lg">
                                {progress.completed_chapters.length}/{allChapters.length}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {modules.map((mod) => (
                                <div key={mod.id}>
                                    <button onClick={() => setExpandedModules(prev => {
                                        const n = new Set(prev);
                                        n.has(mod.id) ? n.delete(mod.id) : n.add(mod.id);
                                        return n;
                                    })}
                                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition group">
                                        <span className="text-sm font-bold text-white truncate">{mod.title}</span>
                                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${expandedModules.has(mod.id) ? "rotate-180" : ""}`} />
                                    </button>

                                    {expandedModules.has(mod.id) && (
                                        <div className="ml-3 border-l border-white/5 pl-3 space-y-1 mt-1">
                                            {mod.chapters.map(ch => {
                                                const done = progress.completed_chapters.includes(ch.id);
                                                const active = activeChapter?.id === ch.id;
                                                return (
                                                    <button key={ch.id} onClick={() => pickChapter(ch)}
                                                        className={`w-full text-left p-3 rounded-xl flex items-start gap-3 transition ${active ? "bg-gold/10 border border-gold/20" : "hover:bg-white/5"
                                                            }`}>
                                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${done ? "bg-green-500 text-white" : active ? "border-2 border-gold" : "border-2 border-white/20"
                                                            }`}>
                                                            {done ? <CheckCircle2 className="w-3 h-3" /> : active && <Play className="w-2.5 h-2.5 fill-gold text-gold" />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className={`text-xs font-medium truncate ${active ? "text-gold" : done ? "text-gray-400" : "text-white"}`}>
                                                                {ch.title}
                                                            </p>
                                                            <p className="text-[10px] text-gray-600 mt-0.5">{ch.duration}</p>
                                                        </div>
                                                        {ch.has_quiz && <HelpCircle className="w-3 h-3 text-purple-400 flex-shrink-0 mt-0.5" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Video + Content */}
                <main className="flex-1 overflow-y-auto flex flex-col">
                    <div className="relative bg-[#050f1e] w-full overflow-hidden" style={{ aspectRatio: "16/9", maxHeight: "calc(100vh - 64px - 200px)" }}>
                        {videoLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="w-12 h-12 text-gold animate-spin" />
                            </div>
                        ) : activeChapter?.content_type === 'video' ? (
                            videoUrl ? (
                                <video
                                    ref={videoRef}
                                    key={videoUrl}
                                    src={videoUrl}
                                    controls
                                    controlsList="nodownload"
                                    disablePictureInPicture
                                    onContextMenu={e => e.preventDefault()}
                                    onTimeUpdate={handleTimeUpdate}
                                    onEnded={handleVideoEnded}
                                    className="w-full h-full"
                                />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-gray-500">
                                    <AlertCircle className="w-12 h-12 text-gold/50" />
                                    <p className="text-sm">Vidéo non disponible</p>
                                </div>
                            )
                        ) : activeChapter?.content_type === 'pdf' ? (
                            videoUrl ? (
                                <iframe src={`${videoUrl}#toolbar=0`} className="w-full h-full border-none" title="PDF Viewer" />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-gray-500">
                                    <BookOpen className="w-12 h-12 text-gold/50" />
                                    <p className="text-sm">Document PDF non disponible</p>
                                </div>
                            )
                        ) : activeChapter?.content_type === 'text' ? (
                            <div className="w-full h-full bg-[#0d1a2d] overflow-y-auto p-10">
                                <div className="max-w-3xl mx-auto">
                                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
                                        <div className="w-8 h-8 bg-gold/10 rounded-lg flex items-center justify-center text-gold">
                                            <BookOpen className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Support de cours écrit</span>
                                    </div>
                                    <div className="prose prose-invert prose-gold max-w-none">
                                        <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-lg">
                                            {activeChapter.text_content || "Aucun contenu texte disponible pour ce chapitre."}
                                        </div>
                                    </div>
                                    <div className="mt-20 flex justify-center">
                                        <button
                                            onClick={handleVideoEnded}
                                            className="px-8 py-4 bg-gold text-primary font-black rounded-2xl flex items-center gap-3 hover:bg-gold-hover transition shadow-xl shadow-gold/20"
                                        >
                                            <CheckCircle2 className="w-5 h-5" /> J'ai fini de lire
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-gray-500">
                                <AlertCircle className="w-12 h-12 text-gold/50" />
                                <p className="text-sm">Contenu non trouvé</p>
                            </div>
                        )}

                        {/* Anti-watermark overlay */}
                        <div className="absolute top-4 right-4 text-white/5 text-xs font-mono select-none pointer-events-none">
                            {currentUser?.username}
                        </div>
                    </div>

                    {/* Chapter Info & Tabs */}
                    <div className="flex-1 p-6 md:p-8 max-w-4xl mx-auto w-full">
                        {/* Chapter Title */}
                        <div className="flex items-start justify-between gap-6 mb-8">
                            <div>
                                <p className="text-[11px] text-gray-500 uppercase font-bold tracking-widest mb-2">
                                    {modules.find(m => m.chapters.some(c => c.id === activeChapter?.id))?.title}
                                </p>
                                <h1 className="text-2xl font-heading font-bold text-white">{activeChapter?.title}</h1>
                            </div>
                            <div className="flex gap-3 flex-shrink-0">
                                {activeChapter && !progress.completed_chapters.includes(activeChapter.id) && (
                                    <button
                                        onClick={async () => {
                                            if (!activeChapter || !activeModuleId) return;
                                            await modulesApi.completeChapter(courseId, activeModuleId, activeChapter.id);
                                            setProgress(prev => ({ ...prev, completed_chapters: [...new Set([...prev.completed_chapters, activeChapter.id])] }));
                                        }}
                                        className="flex items-center gap-2 bg-white/10 border border-white/10 text-xs font-bold px-4 py-2 rounded-xl hover:border-green-500/30 hover:text-green-400 transition">
                                        <CheckCircle2 className="w-4 h-4" /> Marquer terminé
                                    </button>
                                )}
                                {activeChapter?.has_quiz && (
                                    <button onClick={async () => {
                                        if (!activeModuleId) return;
                                        const quiz = await quizApi.getForChapter(courseId, activeModuleId, activeChapter.id);
                                        if (quiz) { setCurrentQuiz(quiz); setShowQuiz(true); }
                                    }}
                                        className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold px-4 py-2 rounded-xl hover:bg-purple-500/20 transition">
                                        <HelpCircle className="w-4 h-4" /> Quiz
                                    </button>
                                )}
                                <button onClick={goNextChapter} disabled={currentIdx >= allChapters.length - 1}
                                    className="flex items-center gap-2 bg-gold text-primary text-xs font-bold px-4 py-2 rounded-xl hover:bg-gold-hover transition disabled:opacity-30">
                                    <SkipForward className="w-4 h-4" /> Suivant
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/5 mb-8 w-fit">
                            <button onClick={() => setActiveTab("content")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === "content" ? "bg-white text-primary" : "text-gray-400 hover:text-white"}`}>
                                <BookOpen className="w-3.5 h-3.5" /> Description
                            </button>
                            <button onClick={() => setActiveTab("notes")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === "notes" ? "bg-white text-primary" : "text-gray-400 hover:text-white"}`}>
                                <StickyNote className="w-3.5 h-3.5" /> Mes Notes
                            </button>
                        </div>

                        {/* Tab Content */}
                        {activeTab === "content" ? (
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <p className="text-gray-400 leading-relaxed">
                                    Dans ce chapitre, vous apprendrez les concepts clés de <strong className="text-white">{activeChapter?.title}</strong>.
                                    Suivez attentivement la vidéo et prenez des notes pour maximiser votre apprentissage.
                                </p>
                                {activeChapter?.has_quiz && (
                                    <div className="mt-6 p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl flex items-center gap-4">
                                        <HelpCircle className="w-5 h-5 text-purple-400 flex-shrink-0" />
                                        <p className="text-xs text-purple-300">Ce chapitre se termine par un quiz. Vous devez le réussir pour passer au chapitre suivant.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <textarea
                                    value={noteContent}
                                    onChange={e => setNoteContent(e.target.value)}
                                    placeholder="Prenez vos notes ici pour ce chapitre..."
                                    rows={8}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-gray-200 placeholder:text-gray-600 resize-none focus:outline-none focus:border-gold/50 text-sm leading-relaxed"
                                />
                                <div className="flex justify-between items-center">
                                    <p className="text-[11px] text-gray-600">Notes privées — visibles uniquement par vous</p>
                                    <button onClick={handleSaveNote}
                                        className={`text-xs font-bold px-6 py-2 rounded-xl transition ${notesSaved ? "bg-green-500 text-white" : "bg-gold text-primary hover:bg-gold-hover"}`}>
                                        {notesSaved ? "✓ Sauvegardé" : "Sauvegarder"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Completion Banner */}
                        {isCompleted && (
                            <div className="mt-10 bg-gold/5 border border-gold/20 rounded-3xl p-8 text-center">
                                <Award className="w-14 h-14 text-gold mx-auto mb-4" />
                                <h3 className="text-2xl font-heading font-bold text-gold mb-2">🎉 Cours Terminé !</h3>
                                <p className="text-gray-400 mb-6">Félicitations ! Vous avez complété 100% du cours.</p>
                                <Link to={`/academy/course/${courseId}/certificate`}
                                    className="inline-flex items-center gap-3 bg-gold text-primary font-bold px-10 py-4 rounded-2xl hover:bg-gold-hover transition shadow-xl shadow-gold/20">
                                    <Award className="w-5 h-5" /> Télécharger mon Certificat
                                </Link>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Quiz Modal */}
            {showQuiz && currentQuiz && (
                <QuizPanel
                    quiz={currentQuiz}
                    onClose={() => setShowQuiz(false)}
                    onPass={() => { setShowQuiz(false); goNextChapter(); }}
                />
            )}
        </div>
    );
};

export default CoursePlayer;
