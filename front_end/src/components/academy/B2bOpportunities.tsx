import React, { useState } from 'react';
import { Briefcase, Building2, Calendar, Users, MapPin, CheckCircle } from 'lucide-react';

const mockOpportunities = [
    {
        id: 1,
        enterprise: "TechCorp Industries",
        title: "Formation Web3 et Sécurité DeFi",
        duration: "4 semaines (8 sessions)",
        participants: 10,
        location: "En ligne",
        price_range: "50 000 - 80 000 FCFA / session",
        description: "Nous recherchons un expert en sécurité DeFi pour former notre équipe technique aux bonnes pratiques de développement de smart contracts.",
        skills: ["Solidity", "Sécurité", "Audit"],
        status: "OPEN"
    },
    {
        id: 2,
        enterprise: "Fintech Solutions",
        title: "Introduction à la Blockchain pour Managers",
        duration: "1 journée intensive",
        participants: 25,
        location: "Présentiel (Abidjan)",
        price_range: "150 000 FCFA",
        description: "Formation de vulgarisation pour notre équipe de direction. L'objectif est de comprendre les enjeux stratégiques de la blockchain.",
        skills: ["Vulgarisation", "Stratégie", "Blockchain"],
        status: "OPEN"
    }
];

const B2bOpportunities = () => {
    const [opportunities] = useState(mockOpportunities);
    const [showApplyModal, setShowApplyModal] = useState<number | null>(null);

    return (
        <div className="space-y-6 text-white">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-gold" />
                        Opportunités B2B (Délégation)
                    </h2>
                    <p className="text-gray-400 mt-2">Postulez pour animer des formations en entreprise au nom de Golden Academy.</p>
                </div>
            </div>

            <div className="grid gap-6">
                {opportunities.map(opp => (
                    <div key={opp.id} className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-white/30 transition">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                            <div>
                                <div className="flex items-center gap-2 text-sm text-gold mb-2 font-bold">
                                    <Building2 className="w-4 h-4" />
                                    {opp.enterprise}
                                </div>
                                <h3 className="text-xl font-bold text-white">{opp.title}</h3>
                            </div>
                            <div className="text-right">
                                <span className="inline-block bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                                    Ouvert aux candidatures
                                </span>
                                <div className="text-gold font-bold">{opp.price_range}</div>
                            </div>
                        </div>

                        <p className="text-gray-400 mb-6">{opp.description}</p>

                        <div className="flex flex-wrap gap-6 mb-6 text-sm text-gray-400 border-t border-b border-white/10 py-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gold" />
                                {opp.duration}
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gold" />
                                {opp.participants} participants
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gold" />
                                {opp.location}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                                {opp.skills.map(skill => (
                                    <span key={skill} className="bg-white/10 text-gray-300 text-xs px-2 py-1 rounded">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                            <button 
                                onClick={() => setShowApplyModal(opp.id)}
                                className="bg-gold text-primary font-bold px-6 py-2 rounded-xl hover:bg-gold-hover transition shadow-md shadow-gold/20"
                            >
                                Postuler
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Candidature */}
            {showApplyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/80 backdrop-blur-sm">
                    <div className="bg-[#0d1a2d] border border-white/10 rounded-3xl w-full max-w-lg p-8 shadow-2xl relative text-white">
                        <h2 className="text-2xl font-bold text-white mb-6">Postuler à cette mission</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-1">Votre motivation</label>
                                <textarea className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gold h-24" placeholder="Pourquoi êtes-vous le candidat idéal pour cette entreprise ?"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-1">Disponibilités</label>
                                <input type="text" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gold" placeholder="Ex: Disponible les soirs et week-ends" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-8">
                            <button onClick={() => setShowApplyModal(null)} className="px-6 py-2 rounded-xl text-gray-400 font-bold hover:bg-white/5">Annuler</button>
                            <button onClick={() => { alert('Candidature envoyée !'); setShowApplyModal(null); }} className="px-6 py-2 rounded-xl bg-gold text-primary font-bold hover:bg-gold-hover shadow-lg shadow-gold/20 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" /> Confirmer la candidature
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default B2bOpportunities;
