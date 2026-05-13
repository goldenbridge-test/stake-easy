import React, { useState } from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { Building2, Plus, Users, BookOpen, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const mockOffers = [
    {
        id: 1,
        title: "Formation Web3 - Équipe Dev",
        status: "ACTIVE",
        programs: [
            { id: 101, title: "Smart Contracts Avancés", status: "ASSIGNED", instructors: ["Sarah Johnson"] },
            { id: 102, title: "Sécurité DeFi", status: "OPEN", instructors: [] }
        ]
    }
];

const EnterpriseDashboard = () => {
    const { currentUser } = useAuth() as any;
    const [offers] = useState(mockOffers);
    const [showCreateModal, setShowCreateModal] = useState(false);

    return (
        <div className="bg-gray-50 min-h-screen font-body text-dark flex flex-col">
            <Navbar />
            
            <main className="flex-grow pt-24 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                        <div>
                            <h1 className="text-3xl font-heading font-bold text-primary mb-2 flex items-center gap-3">
                                <Building2 className="w-8 h-8 text-gold" />
                                Espace Entreprise B2B
                            </h1>
                            <p className="text-gray-500">
                                Gérez vos offres de formation et suivez les coachings de vos équipes.
                            </p>
                        </div>
                        <button 
                            onClick={() => setShowCreateModal(true)}
                            className="bg-gold text-primary font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-gold-hover transition shadow-md"
                        >
                            <Plus className="w-5 h-5" /> Nouvelle Offre
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <BookOpen className="w-6 h-6 text-blue-500 mb-3" />
                            <div className="text-2xl font-bold text-dark">3</div>
                            <div className="text-sm text-gray-500">Programmes Actifs</div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <Users className="w-6 h-6 text-purple-500 mb-3" />
                            <div className="text-2xl font-bold text-dark">15</div>
                            <div className="text-sm text-gray-500">Employés formés</div>
                        </div>
                    </div>

                    {/* Liste des offres */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-primary">Vos Offres de Formation</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {offers.map(offer => (
                                <div key={offer.id} className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-dark text-lg">{offer.title}</h3>
                                            <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded mt-1 inline-block">
                                                {offer.status}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3 mt-4 pl-4 border-l-2 border-gray-100">
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Programmes inclus</h4>
                                        {offer.programs.map(prog => (
                                            <div key={prog.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    {prog.status === 'ASSIGNED' ? (
                                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                    ) : (
                                                        <Clock className="w-5 h-5 text-orange-500" />
                                                    )}
                                                    <span className="font-medium text-dark">{prog.title}</span>
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {prog.status === 'OPEN' ? 'En recherche de coach...' : `Coach : ${prog.instructors.join(', ')}`}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Modale de création (Simulée) */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl relative">
                        <h2 className="text-2xl font-bold text-primary mb-6">Créer une offre de formation</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Titre de l'offre</label>
                                <input type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gold" placeholder="Ex: Formation Onboarding Blockchain" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre d'employés</label>
                                <input type="number" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gold" placeholder="Ex: 10" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Besoins spécifiques / Programme</label>
                                <textarea className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gold h-24" placeholder="Décrivez les compétences attendues..."></textarea>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-8">
                            <button onClick={() => setShowCreateModal(false)} className="px-6 py-2 rounded-xl text-gray-500 font-bold hover:bg-gray-100">Annuler</button>
                            <button onClick={() => { alert('Offre soumise avec succès !'); setShowCreateModal(false); }} className="px-6 py-2 rounded-xl bg-gold text-primary font-bold hover:bg-gold-hover shadow-lg shadow-gold/20">Soumettre la demande</button>
                        </div>
                    </div>
                </div>
            )}
            
            <Footer />
        </div>
    );
};

export default EnterpriseDashboard;
