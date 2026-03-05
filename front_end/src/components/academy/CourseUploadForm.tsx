import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";
import {
    Plus, Upload, Trash2, ChevronDown, ChevronUp,
    Loader2, CheckCircle2, HelpCircle, Video, BookOpen
} from "lucide-react";
import { modulesApi } from "../../services/api";

interface QuizQuestion {
    text: string;
    choices: string[];
    correct_index: number;
}

interface ChapterDraft {
    id: string; title: string; duration: string;
    content_type: 'video' | 'text' | 'pdf';
    videoFile: File | null;
    text_content: string;
    pdfFile: File | null;
    uploadPct: number;
    hasQuiz: boolean; quiz: QuizQuestion[];
}

interface ModuleDraft {
    id: string; title: string; expanded: boolean; chapters: ChapterDraft[];
}

const uid = () => Math.random().toString(36).slice(2);

const CourseUploadForm = () => {
    const { id } = useParams<{ id: string }>();
    const courseId = parseInt(id!);
    const navigate = useNavigate();

    const [modules, setModules] = useState<ModuleDraft[]>([{
        id: uid(), title: "Module 1", expanded: true, chapters: []
    }]);
    const [saving, setSaving] = useState(false);
    const [savedCount, setSavedCount] = useState(0);

    // ─── Module Helpers ────────────────────────────────────────────────────
    const addModule = () => setModules(prev => [...prev, {
        id: uid(), title: `Module ${prev.length + 1}`, expanded: true, chapters: []
    }]);

    const removeModule = (mid: string) => setModules(prev => prev.filter(m => m.id !== mid));

    const toggleModule = (mid: string) =>
        setModules(prev => prev.map(m => m.id === mid ? { ...m, expanded: !m.expanded } : m));

    const updateModuleTitle = (mid: string, title: string) =>
        setModules(prev => prev.map(m => m.id === mid ? { ...m, title } : m));

    // ─── Chapter Helpers ───────────────────────────────────────────────────
    const addChapter = (mid: string) =>
        setModules(prev => prev.map(m => m.id === mid ? {
            ...m, chapters: [...m.chapters, {
                id: uid(), title: `Chapitre ${m.chapters.length + 1}`, duration: "",
                content_type: 'video',
                videoFile: null, text_content: "", pdfFile: null,
                uploadPct: 0, hasQuiz: false,
                quiz: [{ text: "", choices: ["", "", "", ""], correct_index: 0 }]
            }]
        } : m));

    const removeChapter = (mid: string, cid: string) =>
        setModules(prev => prev.map(m => m.id === mid ? { ...m, chapters: m.chapters.filter(c => c.id !== cid) } : m));

    const updateChapter = (mid: string, cid: string, patch: Partial<ChapterDraft>) =>
        setModules(prev => prev.map(m => m.id === mid ? {
            ...m, chapters: m.chapters.map(c => c.id === cid ? { ...c, ...patch } : c)
        } : m));

    const handleVideoFile = (mid: string, cid: string, file: File) =>
        updateChapter(mid, cid, { videoFile: file });

    // ─── Quiz Helpers ──────────────────────────────────────────────────────
    const addQuestion = (mid: string, cid: string) =>
        setModules(prev => prev.map(m => m.id === mid ? {
            ...m, chapters: m.chapters.map(c => c.id === cid ? {
                ...c, quiz: [...c.quiz, { text: "", choices: ["", "", "", ""], correct_index: 0 }]
            } : c)
        } : m));

    const updateQuestion = (mid: string, cid: string, qi: number, patch: Partial<QuizQuestion>) =>
        setModules(prev => prev.map(m => m.id === mid ? {
            ...m, chapters: m.chapters.map(c => c.id === cid ? {
                ...c, quiz: c.quiz.map((q, i) => i === qi ? { ...q, ...patch } : q)
            } : c)
        } : m));

    // ─── Save ──────────────────────────────────────────────────────────────
    const handleSave = useCallback(async () => {
        setSaving(true);
        let count = 0;
        try {
            for (const mod of modules) {
                const createdMod = await modulesApi.createModule(courseId, { title: mod.title, order: modules.indexOf(mod) });
                for (const ch of mod.chapters) {
                    const chData: any = {
                        title: ch.title,
                        order: mod.chapters.indexOf(ch),
                        content_type: ch.content_type
                    };
                    if (ch.content_type === 'text') chData.text_content = ch.text_content;

                    const createdCh = await modulesApi.createChapter(createdMod.id, chData);

                    if (ch.content_type === 'video' && ch.videoFile) {
                        await modulesApi.uploadVideo(createdCh.id, ch.videoFile, (pct) => {
                            updateChapter(mod.id, ch.id, { uploadPct: pct });
                        });
                    } else if (ch.content_type === 'pdf' && ch.pdfFile) {
                        // Assuming a similar upload endpoint for PDFs or the same one
                        await modulesApi.uploadVideo(createdCh.id, ch.pdfFile, (pct) => {
                            updateChapter(mod.id, ch.id, { uploadPct: pct });
                        });
                    }
                    count++;
                    setSavedCount(count);
                }
            }
            navigate(`/academy/course/${courseId}`);
        } catch (err: any) {
            alert(`Erreur: ${err.message}`);
        } finally {
            setSaving(false);
        }
    }, [modules, courseId]);

    const totalChapters = modules.reduce((s, m) => s + m.chapters.length, 0);
    const totalWithVideo = modules.reduce((s, m) => s + m.chapters.filter(c => c.videoFile).length, 0);

    return (
        <div className="bg-primary min-h-screen font-body text-white flex flex-col">
            <Navbar />
            <main className="flex-1 pt-32 pb-20 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <p className="text-[11px] text-gold uppercase font-bold tracking-widest mb-2">Mode Instructeur</p>
                            <h1 className="text-3xl font-heading font-bold">Structurer le Cours</h1>
                            <p className="text-gray-400 mt-2 text-sm">Créez vos modules, chapitres et uploadez vos vidéos</p>
                        </div>
                        <div className="text-right hidden md:block">
                            <p className="text-xs text-gray-500 mb-1">{totalChapters} chapitres • {totalWithVideo} vidéos</p>
                            <button onClick={handleSave} disabled={saving || totalChapters === 0}
                                className="flex items-center gap-2 bg-gold text-primary font-bold px-6 py-3 rounded-xl hover:bg-gold-hover transition disabled:opacity-50 shadow-lg shadow-gold/20">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                {saving ? `Upload... ${savedCount}/${totalChapters}` : "Sauvegarder"}
                            </button>
                        </div>
                    </div>

                    {/* Modules */}
                    <div className="space-y-4 mb-6">
                        {modules.map((mod, mi) => (
                            <div key={mod.id} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                                {/* Module Header */}
                                <div className="flex items-center gap-3 p-5 border-b border-white/10">
                                    <div className="w-8 h-8 bg-gold/10 rounded-lg flex items-center justify-center text-gold text-sm font-bold flex-shrink-0">
                                        {mi + 1}
                                    </div>
                                    <input value={mod.title} onChange={e => updateModuleTitle(mod.id, e.target.value)}
                                        className="flex-1 bg-transparent text-white font-bold text-lg focus:outline-none placeholder:text-gray-600"
                                        placeholder="Titre du module..." />
                                    <div className="flex gap-2">
                                        <button onClick={() => toggleModule(mod.id)} className="p-2 text-gray-500 hover:text-gold transition">
                                            {mod.expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </button>
                                        {modules.length > 1 && (
                                            <button onClick={() => removeModule(mod.id)} className="p-2 text-gray-600 hover:text-red-400 transition">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Chapters */}
                                {mod.expanded && (
                                    <div className="p-5 space-y-4">
                                        {mod.chapters.map((ch, ci) => (
                                            <div key={ch.id} className="bg-primary/50 border border-white/5 rounded-2xl p-5">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="text-xs font-bold text-gray-500 w-6 text-center">{ci + 1}</div>
                                                    <input value={ch.title} onChange={e => updateChapter(mod.id, ch.id, { title: e.target.value })}
                                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-gold/50 placeholder:text-gray-600"
                                                        placeholder="Titre du chapitre..." />
                                                    <button onClick={() => removeChapter(mod.id, ch.id)} className="text-gray-600 hover:text-red-400 transition p-1.5">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {/* Content Type Selector */}
                                                <div className="mb-4">
                                                    <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2">Type de contenu</label>
                                                    <div className="flex gap-2">
                                                        {(['video', 'text', 'pdf'] as const).map(type => (
                                                            <button key={type} type="button"
                                                                onClick={() => updateChapter(mod.id, ch.id, { content_type: type })}
                                                                className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition ${ch.content_type === type ? "bg-gold/10 border-gold text-gold" : "border-white/10 text-gray-500 hover:border-white/30"}`}>
                                                                {type}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Conditional Content Inputs */}
                                                <div className="mb-4">
                                                    {ch.content_type === 'video' && (
                                                        <>
                                                            <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2">Vidéo</label>
                                                            {ch.videoFile ? (
                                                                <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3 flex items-center gap-3">
                                                                    <Video className="w-4 h-4 text-green-400 flex-shrink-0" />
                                                                    <span className="text-xs text-green-400 truncate flex-1">{ch.videoFile.name}</span>
                                                                    {ch.uploadPct > 0 && <span className="text-xs font-bold text-green-400">{ch.uploadPct}%</span>}
                                                                    <button onClick={() => updateChapter(mod.id, ch.id, { videoFile: null, uploadPct: 0 })}
                                                                        className="text-gray-500 hover:text-red-400 transition flex-shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                                                                </div>
                                                            ) : (
                                                                <label className="border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-gold/30 hover:bg-gold/5 transition">
                                                                    <Upload className="w-6 h-6 text-gray-500" />
                                                                    <span className="text-xs text-gray-500">Glisser la vidéo ou cliquer</span>
                                                                    <input type="file" accept="video/*" className="hidden"
                                                                        onChange={e => { if (e.target.files?.[0]) handleVideoFile(mod.id, ch.id, e.target.files[0]); }} />
                                                                </label>
                                                            )}
                                                        </>
                                                    )}

                                                    {ch.content_type === 'pdf' && (
                                                        <>
                                                            <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2">Document PDF</label>
                                                            {ch.pdfFile ? (
                                                                <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3 flex items-center gap-3">
                                                                    <BookOpen className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                                                    <span className="text-xs text-blue-400 truncate flex-1">{ch.pdfFile.name}</span>
                                                                    <button onClick={() => updateChapter(mod.id, ch.id, { pdfFile: null })}
                                                                        className="text-gray-500 hover:text-red-400 transition flex-shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                                                                </div>
                                                            ) : (
                                                                <label className="border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-blue-500/30 hover:bg-blue-500/5 transition">
                                                                    <Upload className="w-6 h-6 text-gray-500" />
                                                                    <span className="text-xs text-gray-500">Uploader le PDF</span>
                                                                    <input type="file" accept="application/pdf" className="hidden"
                                                                        onChange={e => { if (e.target.files?.[0]) updateChapter(mod.id, ch.id, { pdfFile: e.target.files[0] }); }} />
                                                                </label>
                                                            )}
                                                        </>
                                                    )}

                                                    {ch.content_type === 'text' && (
                                                        <>
                                                            <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2">Contenu Texte (Markdown supporté)</label>
                                                            <textarea value={ch.text_content} onChange={e => updateChapter(mod.id, ch.id, { text_content: e.target.value })}
                                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm min-h-[120px] focus:outline-none focus:border-gold/50 placeholder:text-gray-600"
                                                                placeholder="Écrivez le contenu ici..." />
                                                        </>
                                                    )}
                                                </div>

                                                {/* Quiz Toggle */}
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => updateChapter(mod.id, ch.id, { hasQuiz: !ch.hasQuiz })}
                                                        className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border transition ${ch.hasQuiz ? "bg-purple-500/10 border-purple-500/30 text-purple-300" : "border-white/10 text-gray-500 hover:border-purple-500/30 hover:text-purple-300"
                                                            }`}>
                                                        <HelpCircle className="w-3.5 h-3.5" />
                                                        {ch.hasQuiz ? "Quiz activé" : "Ajouter un quiz"}
                                                    </button>
                                                </div>

                                                {/* Quiz Editor */}
                                                {ch.hasQuiz && (
                                                    <div className="mt-4 space-y-4 p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                                                        <p className="text-xs font-bold text-purple-300 uppercase tracking-widest">Questions du quiz</p>
                                                        {ch.quiz.map((q, qi) => (
                                                            <div key={qi} className="space-y-3">
                                                                <input value={q.text} onChange={e => updateQuestion(mod.id, ch.id, qi, { text: e.target.value })}
                                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500/50 placeholder:text-gray-600"
                                                                    placeholder={`Question ${qi + 1}...`} />
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {q.choices.map((c, ci) => (
                                                                        <div key={ci} className="flex items-center gap-2">
                                                                            <button type="button" onClick={() => updateQuestion(mod.id, ch.id, qi, { correct_index: ci })}
                                                                                className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition ${q.correct_index === ci ? "border-green-500 bg-green-500" : "border-gray-600"}`} />
                                                                            <input value={c} onChange={e => {
                                                                                const newChoices = [...q.choices];
                                                                                newChoices[ci] = e.target.value;
                                                                                updateQuestion(mod.id, ch.id, qi, { choices: newChoices });
                                                                            }}
                                                                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-white/30 placeholder:text-gray-600"
                                                                                placeholder={`Choix ${ci + 1}${q.correct_index === ci ? " ✓" : ""}`} />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <button onClick={() => addQuestion(mod.id, ch.id)}
                                                            className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition">
                                                            <Plus className="w-3.5 h-3.5" /> Ajouter une question
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        <button onClick={() => addChapter(mod.id)}
                                            className="w-full flex items-center justify-center gap-2 py-3.5 border border-dashed border-white/10 rounded-2xl text-xs font-bold text-gray-500 hover:border-gold/30 hover:text-gold hover:bg-gold/5 transition">
                                            <Plus className="w-4 h-4" /> Ajouter un chapitre
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Add Module */}
                    <button onClick={addModule}
                        className="w-full flex items-center justify-center gap-3 py-4 border-2 border-dashed border-gold/20 rounded-3xl text-sm font-bold text-gold/60 hover:border-gold/50 hover:text-gold hover:bg-gold/5 transition mb-10">
                        <BookOpen className="w-5 h-5" /> Ajouter un module
                    </button>

                    {/* Mobile Save */}
                    <div className="md:hidden">
                        <button onClick={handleSave} disabled={saving || totalChapters === 0}
                            className="w-full flex items-center justify-center gap-2 bg-gold text-primary font-bold py-4 rounded-2xl hover:bg-gold-hover transition disabled:opacity-50">
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                            {saving ? `Upload... ${savedCount}/${totalChapters}` : "Sauvegarder le cours"}
                        </button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CourseUploadForm;
