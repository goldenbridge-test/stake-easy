import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Users,
  Gift,
  Coins,
  Trash2,
  Plus,
  Copy,
  CheckCircle,
  Wrench,
  ArrowLeft,
  Loader2,
  Zap,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useWeb3 } from "../hooks/useWeb3";
import { SUPPORTED_TOKENS } from "../constants/tokens";

// Types pour l'affichage
type TokenStatus = {
  address: string;
  symbol: string;
  name: string;
  priceFeed: string;
  isAllowed: boolean;
  isConfigured: boolean;
};

const AdminDashboard = () => {
  // --- 1. HOOKS WEB3 ---
  const {
    account,
    isConnected,
    checkIsAdmin,
    addAllowedToken,
    distributeRewardsToAll,
    issueRewardToUser,
    getAllowedTokens,
    checkTokenIsAllowed,
    setPriceFeed,
  } = useWeb3();

  // --- 2. ÉTATS LOCAUX ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [distributeLoading, setDistributeLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Inputs Formulaires
  const [newTokenAddress, setNewTokenAddress] = useState("");
  const [newPriceFeed, setNewPriceFeed] = useState("");
  const [userAddressForReward, setUserAddressForReward] = useState("");

  // Liste des tokens avec leur statut réel
  const [tokenStatuses, setTokenStatuses] = useState<TokenStatus[]>([]);

  // --- 3. VÉRIFICATION ADMIN ---
  useEffect(() => {
    const verify = async () => {
      if (!isConnected || !account) {
        setIsAdmin(false);
        setIsCheckingAdmin(false);
        return;
      }

      console.log("Vérification admin pour:", account);
      const adminStatus = await checkIsAdmin();
      setIsAdmin(adminStatus);
      setIsCheckingAdmin(false);

      // Si admin, charger les tokens
      if (adminStatus) {
        await loadTokenStatuses();
      }
    };

    verify();
  }, [account, isConnected]);

  // --- 4. CHARGER LES STATUTS DES TOKENS ---
  const loadTokenStatuses = async () => {
    setIsRefreshing(true);
    try {
      const statuses: TokenStatus[] = [];

      for (const token of SUPPORTED_TOKENS) {
        const isAllowed = await checkTokenIsAllowed(token.address);
        statuses.push({
          address: token.address,
          symbol: token.symbol,
          name: token.name,
          priceFeed: token.priceFeed || "",
          isAllowed,
          isConfigured: true,
        });
      }

      setTokenStatuses(statuses);
    } catch (error) {
      console.error("Erreur chargement statuts:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // --- 5. INITIALISATION AUTOMATIQUE ---
  const handleAutoInitialize = async () => {
    if (
      !window.confirm(
        `🚀 Initialiser automatiquement ${SUPPORTED_TOKENS.length} tokens configurés ?\n\nCela va :\n1. Ajouter chaque token aux tokens autorisés\n2. Configurer leur price feed\n\n⚠️ Cela peut prendre plusieurs minutes et coûter du gas.`
      )
    ) {
      return;
    }

    setIsInitializing(true);
    let successCount = 0;
    let errorCount = 0;

    for (const token of SUPPORTED_TOKENS) {
      try {
        // Vérifier si déjà autorisé
        const isAllowed = await checkTokenIsAllowed(token.address);

        if (isAllowed) {
          console.log(`✅ ${token.symbol} déjà autorisé`);
          successCount++;
          continue;
        }

        console.log(`🔄 Ajout de ${token.symbol}...`);

        // Ajouter le token et configurer le price feed
        const success = await addAllowedToken(
          token.address,
          token.priceFeed || ""
        );

        if (success) {
          console.log(`✅ ${token.symbol} ajouté avec succès`);
          successCount++;
        } else {
          console.error(`❌ Échec pour ${token.symbol}`);
          errorCount++;
        }

        // Petit délai entre chaque transaction
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ Erreur avec ${token.symbol}:`, error);
        errorCount++;
      }
    }

    setIsInitializing(false);
    await loadTokenStatuses();

    alert(
      `✅ Initialisation terminée !\n\n` +
        `Succès : ${successCount}/${SUPPORTED_TOKENS.length}\n` +
        `Erreurs : ${errorCount}`
    );
  };

  // --- 6. AJOUTER UN TOKEN MANUELLEMENT ---
  const handleAddToken = async () => {
    if (!newTokenAddress || !newPriceFeed) {
      alert("⚠️ Remplis tous les champs");
      return;
    }

    if (!newTokenAddress.startsWith("0x") || newTokenAddress.length !== 42) {
      alert("❌ Adresse token invalide");
      return;
    }

    if (!newPriceFeed.startsWith("0x") || newPriceFeed.length !== 42) {
      alert("❌ Adresse price feed invalide");
      return;
    }

    setIsLoading(true);

    const success = await addAllowedToken(newTokenAddress, newPriceFeed);

    if (success) {
      setNewTokenAddress("");
      setNewPriceFeed("");
      alert("✅ Token ajouté avec succès sur la Blockchain !");
      await loadTokenStatuses();
    }

    setIsLoading(false);
  };

  // --- 7. DISTRIBUTION REWARDS ---
  const handleDistributeAll = async () => {
    if (
      !window.confirm(
        "⚠️ ATTENTION : Distribuer les rewards à TOUS les stakers ?\n\nCela va coûter des frais de gaz."
      )
    ) {
      return;
    }

    setDistributeLoading(true);
    const success = await distributeRewardsToAll();

    if (success) {
      alert("✅ Rewards distribués à tous !");
    }

    setDistributeLoading(false);
  };

  const handleIssueRewardToUser = async () => {
    if (!userAddressForReward || !userAddressForReward.startsWith("0x")) {
      alert("❌ Adresse invalide");
      return;
    }

    if (
      !window.confirm(
        `Distribuer reward manuellement à ${userAddressForReward} ?`
      )
    ) {
      return;
    }

    const success = await issueRewardToUser(userAddressForReward);

    if (success) {
      alert("✅ Reward individuel distribué !");
      setUserAddressForReward("");
    }
  };

  // --- 8. HELPERS ---
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("📋 Copié !");
  };

  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  // --- 9. AFFICHAGE LOADING ---
  if (isCheckingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-body">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-gold animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-heading font-bold">
            Vérification des droits Admin...
          </p>
        </div>
      </div>
    );
  }

  // --- 10. AFFICHAGE ACCÈS REFUSÉ ---
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-body">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full text-center border-t-4 border-red-500">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-gray-800 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-500 mb-8">
            Cette zone est réservée à l'administrateur du contrat.
            <br />
            <span className="font-mono text-sm">
              {account ? truncateAddress(account) : "Non connecté"}
            </span>
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-700 transition w-full"
          >
            <ArrowLeft className="w-4 h-4" /> Retour Accueil
          </Link>
        </div>
      </div>
    );
  }

  // --- 11. STATISTIQUES ---
  const tokensAllowed = tokenStatuses.filter((t) => t.isAllowed).length;
  const tokensPending = tokenStatuses.filter((t) => !t.isAllowed).length;

  return (
    <div className="bg-gray-50 min-h-screen font-body text-dark flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Wrench className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-heading font-bold text-primary flex items-center gap-3">
                  Admin Dashboard
                  <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded border border-red-200 uppercase tracking-wider font-bold">
                    Admin Mode
                  </span>
                </h1>
                <p className="text-gray-500 text-sm">
                  Gestion du contrat TokenFarm
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 font-mono">
                Connecté en tant que:
              </p>
              <p className="text-sm font-bold text-primary font-mono">
                {account ? truncateAddress(account) : "..."}
              </p>
            </div>
          </div>

          {/* BOUTON INITIALISATION RAPIDE */}
          <div className="bg-gradient-to-r from-gold to-orange-500 p-6 rounded-xl shadow-lg border border-orange-300">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div className="text-white">
                  <h3 className="text-xl font-heading font-bold">
                    Initialisation Automatique
                  </h3>
                  <p className="text-sm text-white/80">
                    Ajouter automatiquement tous les tokens configurés (
                    {SUPPORTED_TOKENS.length} tokens)
                  </p>
                  <p className="text-xs text-white/60 mt-1">
                    {tokensAllowed} déjà autorisés • {tokensPending} en attente
                  </p>
                </div>
              </div>
              <button
                onClick={handleAutoInitialize}
                disabled={isInitializing || tokensPending === 0}
                className="bg-white text-gold hover:bg-gray-100 font-bold px-8 py-4 rounded-xl shadow-lg transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isInitializing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Initialisation...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    {tokensPending === 0
                      ? "Tous les tokens sont autorisés"
                      : `Initialiser ${tokensPending} token(s)`}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Tokens Autorisés"
              value={tokensAllowed.toString()}
              sub={`Sur ${SUPPORTED_TOKENS.length} configurés`}
              icon={<CheckCircle />}
              color="border-green-500"
              iconColor="text-green-500 bg-green-50"
            />
            <StatCard
              title="Tokens en Attente"
              value={tokensPending.toString()}
              sub="À initialiser"
              icon={<AlertCircle />}
              color="border-orange-500"
              iconColor="text-orange-500 bg-orange-50"
            />
            <StatCard
              title="Active Stakers"
              value="--"
              sub="Coming soon"
              icon={<Users />}
              color="border-blue-500"
              iconColor="text-blue-500 bg-blue-50"
            />
          </div>

          {/* MANAGE TOKENS */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h2 className="text-lg font-heading font-bold text-primary">
                🪙 Tokens Configurés
              </h2>
              <button
                onClick={loadTokenStatuses}
                disabled={isRefreshing}
                className="text-gray-500 hover:text-primary transition flex items-center gap-2 text-sm"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Actualiser
              </button>
            </div>

            {/* Table Responsive */}
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                  <tr>
                    <th className="px-6 py-4">Token</th>
                    <th className="px-6 py-4">Adresse</th>
                    <th className="px-6 py-4">Price Feed</th>
                    <th className="px-6 py-4">Statut Blockchain</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tokenStatuses.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center">
                        <Loader2 className="w-6 h-6 text-gray-400 animate-spin mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">
                          Chargement des tokens...
                        </p>
                      </td>
                    </tr>
                  ) : (
                    tokenStatuses.map((token) => (
                      <tr key={token.address} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-primary">
                              {token.symbol}
                            </p>
                            <p className="text-xs text-gray-500">
                              {token.name}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 font-mono text-xs text-gray-600">
                            {truncateAddress(token.address)}
                            <button
                              onClick={() => copyToClipboard(token.address)}
                              className="text-gray-400 hover:text-gold"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 font-mono text-xs text-gray-500">
                            {token.priceFeed
                              ? truncateAddress(token.priceFeed)
                              : "Non configuré"}
                            {token.priceFeed && (
                              <button
                                onClick={() => copyToClipboard(token.priceFeed)}
                                className="text-gray-400 hover:text-gold"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {token.isAllowed ? (
                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                              <CheckCircle className="w-3 h-3" /> Autorisé
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
                              <AlertCircle className="w-3 h-3" /> En attente
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Formulaire Ajout Token Manuel */}
            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Ajouter un Token Manuellement
              </h3>
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Adresse du Token (0x...)"
                  value={newTokenAddress}
                  onChange={(e) => setNewTokenAddress(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:border-gold outline-none font-mono text-sm"
                />
                <input
                  type="text"
                  placeholder="Adresse Price Feed (0x...)"
                  value={newPriceFeed}
                  onChange={(e) => setNewPriceFeed(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:border-gold outline-none font-mono text-sm"
                />
                <button
                  onClick={handleAddToken}
                  disabled={isLoading}
                  className="bg-gold hover:bg-gold-hover text-white font-bold px-6 py-2 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Ajouter
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* DISTRIBUTION REWARDS */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-heading font-bold text-primary flex items-center gap-2">
                🎁 Distribution des Récompenses
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
              {/* Distribution Massive */}
              <div className="p-8">
                <h3 className="font-bold text-lg text-primary mb-2">
                  Distribuer à TOUS
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  Envoie les récompenses accumulées à tous les stakers actifs.
                </p>
                <button
                  onClick={handleDistributeAll}
                  disabled={distributeLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {distributeLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Gift className="w-5 h-5" /> Distribuer Tout
                    </>
                  )}
                </button>
              </div>

              {/* Distribution Individuelle */}
              <div className="p-8">
                <h3 className="font-bold text-lg text-primary mb-2">
                  Récompense Individuelle
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  Forcer l'envoi de récompense pour un utilisateur spécifique.
                </p>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Adresse Utilisateur (0x...)"
                    value={userAddressForReward}
                    onChange={(e) => setUserAddressForReward(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-gold outline-none font-mono text-sm"
                  />
                  <button
                    onClick={handleIssueRewardToUser}
                    className="w-full bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold py-3 rounded-lg transition"
                  >
                    Envoyer Reward Unique
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Composant Helper StatCard
const StatCard = ({ title, value, sub, icon, color, iconColor }: any) => (
  <div className={`bg-white p-5 rounded-xl shadow-sm border-l-4 ${color}`}>
    <div className="flex justify-between items-start mb-2">
      <div>
        <p className="text-gray-500 text-xs font-bold uppercase">{title}</p>
        <h3 className="text-3xl font-heading font-bold text-primary mt-1">
          {value}
        </h3>
      </div>
      <div className={`p-2 rounded-lg ${iconColor} shrink-0`}>
        {React.cloneElement(icon, { className: "w-6 h-6" })}
      </div>
    </div>
    <p className="text-xs text-gray-400">{sub}</p>
  </div>
);

export default AdminDashboard;
