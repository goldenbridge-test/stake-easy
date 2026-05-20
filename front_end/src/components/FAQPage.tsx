import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown, ChevronUp, Search, HelpCircle,
  Layers, BookOpen, Briefcase, ShieldCheck, Wallet, Users,
} from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface FAQItem {
  q: string;
  a: string | React.ReactNode;
}

interface FAQCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
  items: FAQItem[];
}

const CATEGORIES: FAQCategory[] = [
  {
    id: "about",
    label: "À propos de GoldenBridge",
    icon: <Users className="w-5 h-5" />,
    color: "text-gold",
    bg: "bg-gold/10",
    border: "border-gold/20",
    items: [
      {
        q: "Qu'est-ce que GoldenBridge ?",
        a: "GoldenBridge est une startup DeFi (finance décentralisée) basée au Bénin, dont la mission est de démocratiser l'accès aux services financiers décentralisés pour les utilisateurs africains. Nous combinons la technologie blockchain avec une expérience utilisateur accessible pour permettre à chacun d'investir, d'apprendre et de faire fructifier son patrimoine.",
      },
      {
        q: "Qui est derrière GoldenBridge ?",
        a: "GoldenBridge est fondé par Hospice KAKE, visionnaire en fintech africaine. La plateforme est construite par une équipe pluridisciplinaire alliant expertise blockchain, développement backend (Django/Python) et frontend (React/TypeScript).",
      },
      {
        q: "GoldenBridge est-il réglementé ?",
        a: "GoldenBridge opère en conformité avec les réglementations locales en vigueur. Nos services de paiement sont assurés par FedaPay, opérateur de paiement mobile agréé (MTN MoMo, Moov Money). Pour toute question réglementaire, contactez notre équipe.",
      },
      {
        q: "Quels services propose GoldenBridge ?",
        a: (
          <span>
            GoldenBridge propose trois grandes offres :{" "}
            <strong>Golden Earn</strong> (staking et rendements on-chain),{" "}
            <strong>Golden Academy</strong> (formation en crypto/DeFi), et{" "}
            <strong>Golden Services</strong> (Advisory, Copy-Trading, OTC Desk) pour les investisseurs qualifiés.
          </span>
        ),
      },
      {
        q: "Comment contacter l'équipe GoldenBridge ?",
        a: "Vous pouvez nous joindre via le formulaire de contact sur chaque page de service, ou directement sur WhatsApp. Notre équipe répond dans un délai de 24 à 48 heures ouvrables.",
      },
    ],
  },
  {
    id: "earn",
    label: "Earn & Staking",
    icon: <Layers className="w-5 h-5" />,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    items: [
      {
        q: "Qu'est-ce que le Golden Earn ?",
        a: "Golden Earn est notre programme de staking de tokens ERC-20. Il vous permet de bloquer vos tokens GLD (GoldenToken) dans un smart contract pendant une durée définie afin de générer des rendements annuels (APY) progressifs.",
      },
      {
        q: "Quels sont les taux de rendement disponibles ?",
        a: (
          <div className="space-y-2">
            <p>Les rendements annuels varient selon la durée de blocage choisie :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>1 an</strong> — 8% APY</li>
              <li><strong>2 ans</strong> — 10% APY</li>
              <li><strong>3 ans</strong> — 12% APY</li>
              <li><strong>4 ans</strong> — 15% APY</li>
            </ul>
            <p className="text-sm text-gray-500 mt-2">Plus la durée est longue, plus le rendement est élevé.</p>
          </div>
        ),
      },
      {
        q: "De quel wallet ai-je besoin pour staker ?",
        a: "Vous avez besoin de MetaMask, le portefeuille Ethereum le plus répandu. Téléchargez l'extension MetaMask sur votre navigateur, créez ou importez votre wallet, puis connectez-le à GoldenBridge via le bouton « Link Wallet » dans la barre de navigation.",
      },
      {
        q: "Sur quel réseau blockchain fonctionne le staking ?",
        a: "Le staking GoldenBridge fonctionne actuellement sur le réseau Sepolia (testnet Ethereum). Ce réseau est utilisé pour garantir la sécurité et tester les fonctionnalités. La migration vers le mainnet Ethereum est planifiée.",
      },
      {
        q: "Comment staker mes tokens step by step ?",
        a: (
          <ol className="list-decimal pl-5 space-y-2">
            <li>Connectez votre wallet MetaMask sur GoldenBridge.</li>
            <li>Accédez à la page <strong>Earn → Staking GLD</strong>.</li>
            <li>Sélectionnez le token à staker et la durée (1 à 4 ans).</li>
            <li>Entrez le montant souhaité.</li>
            <li>Approuvez la dépense ERC-20 (première confirmation MetaMask).</li>
            <li>Confirmez la transaction de staking (deuxième confirmation MetaMask).</li>
            <li>Votre position est enregistrée et visible dans votre tableau de bord.</li>
          </ol>
        ),
      },
      {
        q: "Que se passe-t-il si je retire avant la fin de la période ?",
        a: "Le retrait anticipé (unstaking) entraîne la perte de la totalité des récompenses accumulées. Seul le capital initial vous est restitué. Il existe également un délai de cooldown de 24 heures avant de pouvoir restaker après un unstake.",
      },
      {
        q: "Qu'est-ce que le token GLD ?",
        a: "GLD (GoldenToken) est le token ERC-20 natif de l'écosystème GoldenBridge. Il est utilisé comme token de récompense dans le programme de staking. Ses caractéristiques (supply, tokenomics) sont définies dans le smart contract GoldenToken déployé sur Sepolia.",
      },
      {
        q: "Comment voir mes récompenses en cours ?",
        a: "Dans votre tableau de bord Earn, la section « Mes Positions » affiche votre capital staké, les récompenses accumulées en temps réel et la date de déblocage prévue.",
      },
      {
        q: "L'accès à Golden Earn est-il ouvert à tous ?",
        a: "Non, Golden Earn est actuellement sur invitation. Vous devez soumettre une demande d'accès, passer un appel de démonstration avec notre équipe, puis être approuvé dans un délai de 48 heures. Cliquez sur « Demander l'accès » sur la page Earn pour commencer.",
      },
    ],
  },
  {
    id: "academy",
    label: "Academy & Formations",
    icon: <BookOpen className="w-5 h-5" />,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    items: [
      {
        q: "Qu'est-ce que la Golden Academy ?",
        a: "La Golden Academy est notre plateforme d'apprentissage dédiée à la crypto et à la finance décentralisée. Vous y trouverez des formations vidéo structurées, des programmes de coaching personnalisé et des certificats vérifiables sur la blockchain.",
      },
      {
        q: "Quels types de formations sont disponibles ?",
        a: "Nos formations couvrent l'introduction à la blockchain, le trading crypto, le DeFi (staking, liquidity pools), l'analyse technique, et des modules avancés sur les smart contracts. Les cours sont organisés en chapitres avec vidéos et exercices.",
      },
      {
        q: "Y a-t-il des cours gratuits ?",
        a: "Oui, certains cours d'initiation sont accessibles gratuitement. Les formations avancées et les programmes de coaching sont payants.",
      },
      {
        q: "Comment payer une formation ?",
        a: (
          <span>
            Les paiements sont sécurisés via <strong>FedaPay</strong>, notre partenaire de paiement agréé. Vous pouvez payer par :{" "}
            <strong>Mobile Money MTN (MoMo)</strong>, <strong>Moov Money</strong>, ou <strong>carte bancaire</strong>. Tous les montants sont en FCFA. Après confirmation du paiement, l'accès à la formation est automatiquement activé.
          </span>
        ),
      },
      {
        q: "Le paiement par Mobile Money est-il sécurisé ?",
        a: "Oui. FedaPay est un opérateur de paiement agréé qui gère les transactions MoMo et Moov Money en toute sécurité. Vous recevrez une notification de confirmation sur votre téléphone. Si le paiement ne s'affiche pas immédiatement, patientez quelques secondes — notre système vérifie automatiquement l'état toutes les 2 secondes.",
      },
      {
        q: "Comment obtenir mon certificat ?",
        a: "Après avoir complété tous les chapitres d'une formation, le bouton « Obtenir mon certificat » s'active. Votre certificat est généré avec un code unique et peut être vérifié publiquement via le lien de vérification GoldenBridge.",
      },
      {
        q: "Quelqu'un peut-il vérifier l'authenticité de mon certificat ?",
        a: "Oui. Chaque certificat dispose d'un code de vérification unique accessible via l'URL /verify/{code}. Toute personne (recruteur, partenaire) peut y accéder pour confirmer l'authenticité de votre certification.",
      },
      {
        q: "Puis-je devenir formateur sur la plateforme ?",
        a: "Oui, si vous êtes expert en crypto/DeFi, vous pouvez soumettre une candidature via la page « Devenir Formateur ». Après examen, vous aurez accès à un espace formateur pour créer et gérer vos cours.",
      },
    ],
  },
  {
    id: "services",
    label: "Services (Advisory, Copy-Trading, OTC)",
    icon: <Briefcase className="w-5 h-5" />,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    items: [
      {
        q: "Qu'est-ce que le Golden Advisory ?",
        a: "Golden Advisory est un service d'accompagnement personnalisé pour les investisseurs souhaitant déléguer la gestion de leur portefeuille crypto à des experts GoldenBridge. Un conseiller dédié analyse les marchés et gère votre allocation selon vos objectifs.",
      },
      {
        q: "Qu'est-ce que le Golden Copy-Trading ?",
        a: "Le Copy-Trading vous permet de répliquer automatiquement les trades de nos stratèges performants. Vous investissez un capital, et les positions sont copiées en temps réel selon des règles de gestion du risque définies.",
      },
      {
        q: "Qu'est-ce que le Golden OTC Desk ?",
        a: "L'OTC (Over-The-Counter) Desk est un service de trading de gré à gré pour les transactions de grande taille (achat/vente de USDT, USDC, BTC, ETH) sans impact sur les marchés publics. Idéal pour les entreprises et les investisseurs institutionnels.",
      },
      {
        q: "Comment accéder aux services GoldenBridge ?",
        a: "Cliquez sur « Prendre contact » sur la page Services, remplissez le formulaire correspondant à votre besoin, et notre équipe vous recontactera via WhatsApp dans les 24-48h pour qualifier votre demande.",
      },
      {
        q: "Quelles informations fournir pour l'OTC Desk ?",
        a: (
          <span>
            Pour une demande OTC, précisez : le <strong>type d'opération</strong> (achat ou vente), l'<strong>actif concerné</strong> (USDT, USDC, BTC, ETH), la <strong>quantité</strong>, le <strong>type de prix</strong> (spot ou futur) et si applicable, votre <strong>prix cible</strong> et le <strong>délai souhaité</strong>.
          </span>
        ),
      },
      {
        q: "Quelles informations fournir pour l'Advisory ou le Copy-Trading ?",
        a: (
          <span>
            Nous avons besoin de comprendre votre profil d'investisseur : votre <strong>niveau en crypto</strong> (débutant, intermédiaire, avancé), <strong>depuis combien de temps</strong> vous investissez, et votre <strong>tranche d'investissement</strong> (moins de 10 000 $, 10 000–100 000 $, etc.).
          </span>
        ),
      },
      {
        q: "Comment suivre mon contrat de service ?",
        a: "Une fois votre service activé, connectez-vous et accédez à « Mes Services » dans la navigation. Vous y verrez votre apport, le taux de rendement attendu, les dates du contrat et la progression de celui-ci.",
      },
      {
        q: "Quel est le capital minimum pour les services ?",
        a: "Les conditions d'investissement minimum varient selon le service. Elles sont précisées lors de l'appel de qualification avec votre conseiller GoldenBridge.",
      },
    ],
  },
  {
    id: "account",
    label: "Compte & Sécurité",
    icon: <ShieldCheck className="w-5 h-5" />,
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-200",
    items: [
      {
        q: "Comment créer un compte GoldenBridge ?",
        a: "Cliquez sur « Connexion » puis « Créer un compte ». Renseignez votre nom d'utilisateur, email et mot de passe. Votre compte est actif immédiatement.",
      },
      {
        q: "Comment GoldenBridge sécurise-t-il mes données ?",
        a: "Vos données sont protégées par authentification JWT (JSON Web Tokens) avec rotation automatique des tokens. Les mots de passe sont hachés côté serveur (Django). Les communications sont chiffrées via HTTPS.",
      },
      {
        q: "Que faire si j'oublie mon mot de passe ?",
        a: "Sur la page de connexion, cliquez sur « Mot de passe oublié ». Entrez votre email, vous recevrez un lien de réinitialisation valable 1 heure.",
      },
      {
        q: "GoldenBridge a-t-il accès à mes clés privées MetaMask ?",
        a: "Non, jamais. GoldenBridge n'a accès à aucune clé privée. Toutes les transactions blockchain sont signées localement dans votre MetaMask. Nous ne voyons que les adresses publiques et les hash de transactions.",
      },
      {
        q: "Que se passe-t-il si je perd accès à mon wallet MetaMask ?",
        a: "Votre phrase de récupération MetaMask (seed phrase) est le seul moyen de restaurer l'accès à votre wallet. GoldenBridge ne peut pas récupérer votre wallet à votre place. Conservez votre seed phrase en lieu sûr, hors ligne.",
      },
      {
        q: "Les smart contracts GoldenBridge ont-ils été audités ?",
        a: "Nos smart contracts (TokenFarm, GoldenToken) sont déployés sur le réseau Sepolia. Des audits de sécurité sont prévus avant le déploiement en mainnet. Le code source sera publié pour vérification publique.",
      },
    ],
  },
  {
    id: "wallet",
    label: "Wallet & Transactions",
    icon: <Wallet className="w-5 h-5" />,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    items: [
      {
        q: "Comment connecter mon wallet à GoldenBridge ?",
        a: "Installez MetaMask (extension navigateur), puis cliquez sur « Link Wallet » dans la barre de navigation. MetaMask vous demandera de confirmer la connexion. Une fois connecté, votre adresse apparaît dans la navbar.",
      },
      {
        q: "Quels réseaux blockchain sont supportés ?",
        a: "GoldenBridge supporte actuellement le réseau Sepolia (testnet Ethereum). D'autres réseaux pourront être ajoutés à mesure que la plateforme évolue.",
      },
      {
        q: "Les frais de gas sont-ils élevés ?",
        a: "Sur le réseau Sepolia (testnet), les transactions sont gratuites — vous avez besoin de SepoliaETH de test, disponible via des faucets publics. Sur mainnet, des frais de gas Ethereum s'appliqueront selon la congestion du réseau.",
      },
      {
        q: "Combien de temps prend une transaction de staking ?",
        a: "Les deux transactions requises (approbation ERC-20 + staking) prennent généralement 15 à 30 secondes chacune sur Sepolia. GoldenBridge attend la confirmation on-chain avant d'enregistrer votre position.",
      },
      {
        q: "Puis-je lier plusieurs wallets ?",
        a: "Oui, vous pouvez enregistrer plusieurs adresses wallet associées à votre compte GoldenBridge. Chaque wallet peut être lié à un réseau et un actif spécifiques.",
      },
      {
        q: "Où puis-je voir l'historique de mes transactions ?",
        a: "Dans votre tableau de bord Earn, la section « Historique » liste toutes vos transactions (stakes, unstakes, rewards) avec les hash de transactions pour vérification sur les explorateurs blockchain.",
      },
    ],
  },
];

const FAQItem = ({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) => (
  <div className={`border rounded-xl overflow-hidden transition-all ${isOpen ? "border-primary/20 shadow-sm" : "border-gray-100"}`}>
    <button
      className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-gray-50 transition"
      onClick={onToggle}
    >
      <span className="font-semibold text-primary text-sm leading-snug">{item.q}</span>
      <div className="shrink-0 text-gray-400">
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>
    </button>
    {isOpen && (
      <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-4">
        {item.a}
      </div>
    )}
  </div>
);

const FAQPage = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredCategories = CATEGORIES
    .filter(cat => activeCategory === "all" || cat.id === activeCategory)
    .map(cat => ({
      ...cat,
      items: cat.items.filter(
        item =>
          !search ||
          item.q.toLowerCase().includes(search.toLowerCase()) ||
          (typeof item.a === "string" && item.a.toLowerCase().includes(search.toLowerCase()))
      ),
    }))
    .filter(cat => cat.items.length > 0);

  const totalResults = filteredCategories.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <div className="bg-gray-50 min-h-screen font-body text-dark">
      <Navbar />

      {/* Hero */}
      <div className="bg-white border-b border-gray-100 pt-28 pb-14 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 text-gold text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-widest mb-5">
            <HelpCircle className="w-3.5 h-3.5" /> Centre d'aide
          </div>
          <h1 className="text-4xl font-heading font-bold text-primary mb-4">
            Questions fréquentes
          </h1>
          <p className="text-gray-500 text-base mb-8 max-w-xl mx-auto">
            Retrouvez les réponses aux questions les plus posées sur GoldenBridge — Earn, Academy, Services, Wallet et sécurité.
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une question…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition border ${
              activeCategory === "all"
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:border-primary/30"
            }`}
          >
            Tout voir
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition border flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? `${cat.bg} ${cat.color} ${cat.border} shadow-sm`
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        {search && (
          <p className="text-sm text-gray-500 mb-6">
            {totalResults} résultat{totalResults !== 1 ? "s" : ""} pour «{" "}
            <span className="font-semibold text-dark">{search}</span> »
          </p>
        )}

        {/* FAQ sections */}
        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <HelpCircle className="w-10 h-10 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-heading font-bold text-primary mb-2">Aucun résultat</h3>
            <p className="text-gray-400 text-sm">Essayez d'autres mots-clés ou parcourez toutes les catégories.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {filteredCategories.map(cat => (
              <div key={cat.id}>
                <div className={`flex items-center gap-3 mb-5 pb-3 border-b ${cat.border}`}>
                  <div className={`w-9 h-9 rounded-xl ${cat.bg} flex items-center justify-center ${cat.color}`}>
                    {cat.icon}
                  </div>
                  <h2 className="font-heading font-bold text-primary text-lg">{cat.label}</h2>
                  <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full ${cat.bg} ${cat.color}`}>
                    {cat.items.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {cat.items.map((item, i) => {
                    const key = `${cat.id}-${i}`;
                    return (
                      <FAQItem
                        key={key}
                        item={item}
                        isOpen={!!openItems[key]}
                        onToggle={() => toggleItem(key)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact strip */}
        <div className="mt-16 bg-primary rounded-2xl p-8 text-center text-white">
          <h2 className="text-xl font-heading font-bold mb-2">Vous n'avez pas trouvé votre réponse ?</h2>
          <p className="text-blue-200 text-sm mb-6 max-w-md mx-auto">
            Notre équipe est disponible pour répondre à toutes vos questions spécifiques.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/services"
              className="px-6 py-3 rounded-xl bg-gold text-white font-bold text-sm hover:bg-gold-hover transition shadow-lg shadow-gold/20"
            >
              Contacter un conseiller
            </Link>
            <a
              href="https://wa.me/22901441348420"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl border border-white/20 text-white font-bold text-sm hover:bg-white/10 transition"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FAQPage;
