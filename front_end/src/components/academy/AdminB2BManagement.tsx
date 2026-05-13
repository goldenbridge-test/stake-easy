import React, { useState } from 'react';
import { Briefcase, CheckCircle, XCircle, Clock, Eye, Users } from 'lucide-react';

const mockOffers = [
    {
        id: 1,
        enterprise: "TechCorp Industries",
        programTitle: "Formation Web3 et Sécurité DeFi",
        status: "PENDING_ASSIGNMENT",
        applications: [
            { id: 1, instructor: "Sarah Johnson", motivation: "Expert en sécurité DeFi avec 5 ans d'expérience.", status: "PENDING" },
            { id: 2, instructor: "Mike Ross", motivation: "Formateur certifié, disponible immédiatement.", status: "PENDING" }
        ]
    },
    {
        id: 2,
        enterprise: "Fintech Solutions",
        programTitle: "Introduction à la Blockchain pour Managers",
        status: "ASSIGNED",
        applications: [
            { id: 3, instructor: "David Chen", motivation: "Habitué à former des comités de direction.", status: "ACCEPTED" }
        ]
    }
];

const AdminB2BManagement = () => {
    const [offers, setOffers] = useState(mockOffers);

    const handleAction = (offerId: number, appId: number, action: 'ACCEPTED' | 'REJECTED') => {
        if (!confirm(`Voulez-vous vraiment ${action === 'ACCEPTED' ? 'accepter' : 'rejeter'} cette candidature ?`)) return;

        setOffers(prev => prev.map(offer => {
            if (offer.id === offerId) {
                const updatedApps = offer.applications.map(app => 
                    app.id === appId ? { ...app, status: action } : app
                );
                
                // Si on accepte, on peut éventuellement changer le statut de l'offre
                const isAssigned = updatedApps.some(a => a.status === 'ACCEPTED');
                
                return {
                    ...offer,
                    status: isAssigned ? 'ASSIGNED' : offer.status,
                    applications: updatedApps
                };
            }
            return offer;
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-gold" />
                        Gestion B2B & Délégations
                    </h2>
                    <p className="text-gray-500 mt-1">Gérez les offres d'entreprises et assignez les coachs qualifiés.</p>
                </div>
            </div>

            <div className="grid gap-8">
                {offers.map(offer => (
                    <div key={offer.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* En-tête de l'offre */}
                        <div className="bg-gray-50 p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">{offer.programTitle}</h3>
                                <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                    <span className="font-bold text-gray-700">{offer.enterprise}</span>
                                    <span>•</span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                        offer.status === 'ASSIGNED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                        {offer.status}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-200">
                                <Users className="w-4 h-4" />
                                {offer.applications.length} candidatures
                            </div>
                        </div>

                        {/* Candidatures */}
                        <div className="p-6">
                            <h4 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wider">Candidatures des instructeurs</h4>
                            
                            {offer.applications.length === 0 ? (
                                <div className="text-gray-400 italic text-sm">Aucune candidature pour le moment.</div>
                            ) : (
                                <div className="space-y-4">
                                    {offer.applications.map(app => (
                                        <div key={app.id} className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center p-4 border border-gray-100 rounded-xl hover:border-gold/30 transition">
                                            <div className="flex-grow">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-gray-800">{app.instructor}</span>
                                                    {app.status === 'ACCEPTED' && <span className="bg-green-100 text-green-600 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Assigné</span>}
                                                    {app.status === 'REJECTED' && <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Rejeté</span>}
                                                    {app.status === 'PENDING' && <span className="bg-orange-100 text-orange-600 text-[10px] px-2 py-0.5 rounded font-bold uppercase">En attente</span>}
                                                </div>
                                                <p className="text-sm text-gray-600 italic">"{app.motivation}"</p>
                                            </div>
                                            
                                            {app.status === 'PENDING' && (
                                                <div className="flex gap-2 shrink-0">
                                                    <button 
                                                        onClick={() => handleAction(offer.id, app.id, 'ACCEPTED')}
                                                        className="flex items-center gap-1 bg-green-50 text-green-600 hover:bg-green-100 px-3 py-1.5 rounded-lg text-sm font-bold transition"
                                                    >
                                                        <CheckCircle className="w-4 h-4" /> Accepter
                                                    </button>
                                                    <button 
                                                        onClick={() => handleAction(offer.id, app.id, 'REJECTED')}
                                                        className="flex items-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg text-sm font-bold transition"
                                                    >
                                                        <XCircle className="w-4 h-4" /> Rejeter
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminB2BManagement;
