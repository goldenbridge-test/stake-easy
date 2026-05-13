import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { CheckCircle2, Star, Zap, Shield, Crown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const plans = [
    {
        id: 'freemium',
        name: 'Freemium',
        price: '0',
        duration: 'A vie',
        description: 'Parfait pour découvrir l\'univers du Web3 et commencer votre apprentissage sans frais.',
        icon: Zap,
        features: [
            'Accès à tous les cours gratuits',
            'Support communautaire',
            'Certificats d\'achèvement de base',
            'Accès aux forums publics',
        ],
        buttonText: 'Commencer Gratuitement',
        isPopular: false,
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-200'
    },
    {
        id: 'semestriel',
        name: 'Semestriel',
        price: '25 000',
        duration: '6 mois',
        description: 'L\'idéal pour vous plonger sérieusement dans la blockchain avec un accompagnement sur le moyen terme.',
        icon: Shield,
        features: [
            'Accès illimité à TOUS les cours (Gratuits & Payants)',
            'Support prioritaire 24/7',
            'Certificats vérifiés sur la blockchain',
            'Accès à la communauté privée (Discord/Telegram)',
            'Réduction sur les sessions de coaching privé',
        ],
        buttonText: 'Choisir le plan Semestriel',
        isPopular: true,
        color: 'text-gold',
        bgColor: 'bg-gold/10',
        borderColor: 'border-gold'
    },
    {
        id: 'annuel',
        name: 'Annuel',
        price: '40 000',
        duration: '1 an',
        description: 'La meilleure valeur pour un engagement total. Devenez un expert Web3 avec tous les avantages.',
        icon: Crown,
        features: [
            'Tous les avantages du plan Semestriel',
            '2 Sessions de coaching privé offertes',
            'Accès anticipé aux nouveaux cours',
            'Événements exclusifs en ligne',
            'Badge "Pro" sur votre profil',
        ],
        buttonText: 'Choisir le plan Annuel',
        isPopular: false,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        borderColor: 'border-purple-200'
    }
];

const AcademySubscriptions = () => {
    const { currentUser } = useAuth() as any;
    const navigate = useNavigate();
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const handleSubscribe = async (planId: string) => {
        if (!currentUser) {
            navigate('/signin');
            return;
        }

        if (planId === 'freemium') {
            navigate('/academy/catalog');
            return;
        }

        // Pour l'instant on simule le paiement de l'abonnement
        setLoadingPlan(planId);
        setTimeout(() => {
            setLoadingPlan(null);
            alert(`Simulation : Redirection vers la page de paiement pour le plan ${planId.toUpperCase()}...`);
            // Ici, à l'avenir, appel à paymentsApi.createCheckout({ type: 'subscription', plan: planId })
        }, 1500);
    };

    return (
        <div className="bg-gray-50 min-h-screen font-body text-dark flex flex-col">
            <Navbar />

            <main className="flex-grow pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    
                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="inline-block bg-gold/10 text-gold font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-wider border border-gold/20 mb-6">
                            Investissez en vous-même
                        </span>
                        <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-6">
                            Choisissez le plan adapté à vos ambitions
                        </h1>
                        <p className="text-lg text-gray-500">
                            Débloquez votre potentiel avec nos programmes de formation en Web3, DeFi et investissement crypto. Passez à la vitesse supérieure avec un accès illimité.
                        </p>
                    </div>

                    {/* Pricing Grid */}
                    <div className="grid md:grid-cols-3 gap-8 items-stretch">
                        {plans.map((plan) => (
                            <div 
                                key={plan.id}
                                className={`relative bg-white rounded-3xl p-8 shadow-sm border-2 transition-all duration-300 hover:shadow-xl ${plan.isPopular ? 'border-gold scale-105 md:-mt-4 md:mb-4 z-10 shadow-gold/10' : 'border-transparent hover:border-gray-200'}`}
                            >
                                {plan.isPopular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-gold to-orange-400 text-white font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
                                        <Star className="w-3 h-3 fill-white" />
                                        Le plus choisi
                                    </div>
                                )}

                                <div className="mb-6">
                                    <div className={`w-14 h-14 rounded-2xl ${plan.bgColor} flex items-center justify-center mb-6`}>
                                        <plan.icon className={`w-7 h-7 ${plan.color}`} />
                                    </div>
                                    <h3 className="text-2xl font-heading font-bold text-primary mb-2">{plan.name}</h3>
                                    <p className="text-sm text-gray-500 min-h-[60px]">{plan.description}</p>
                                </div>

                                <div className="mb-8">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-heading font-bold text-primary">
                                            {plan.price === '0' ? 'Gratuit' : `${plan.price} FCFA`}
                                        </span>
                                    </div>
                                    <span className="text-sm text-gray-400 font-medium">/ {plan.duration}</span>
                                </div>

                                <button
                                    onClick={() => handleSubscribe(plan.id)}
                                    disabled={loadingPlan !== null}
                                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                                        plan.isPopular 
                                            ? 'bg-gold text-primary hover:bg-gold-hover shadow-lg shadow-gold/20' 
                                            : 'bg-primary text-white hover:bg-primary-dark shadow-md'
                                    }`}
                                >
                                    {loadingPlan === plan.id ? (
                                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        plan.buttonText
                                    )}
                                </button>

                                <div className="mt-8 pt-8 border-t border-gray-100">
                                    <p className="font-bold text-sm text-primary mb-4">Ce qui est inclus :</p>
                                    <ul className="space-y-4">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-3">
                                                <CheckCircle2 className={`w-5 h-5 shrink-0 ${plan.isPopular ? 'text-gold' : 'text-green-500'}`} />
                                                <span className="text-sm text-gray-600 leading-tight">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* FAQ ou Assurance */}
                    <div className="mt-20 text-center max-w-2xl mx-auto">
                        <Shield className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                        <h4 className="text-xl font-heading font-bold text-primary mb-2">Paiement sécurisé et garanti</h4>
                        <p className="text-gray-500 text-sm">
                            Tous nos paiements sont traités de manière sécurisée. Vous pouvez annuler le renouvellement de votre abonnement à tout moment depuis votre tableau de bord.
                        </p>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AcademySubscriptions;
