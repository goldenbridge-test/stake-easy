import React, { useState } from "react";
import {
  ShieldAlert,
  Users,
  Gift,
  Coins,
  Trash2,
  Plus,
  Copy,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Wrench,
  ArrowLeft,
<<<<<<< HEAD
  Loader2,
  Zap,
  RefreshCw,
  AlertCircle,
=======
>>>>>>> 222fd1cfc8eab27f6b1ef780a7a212025d605efc
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
<<<<<<< HEAD
import { useWeb3 } from "../hooks/useWeb3";
import { SUPPORTED_TOKENS } from "../constants/tokens";

// Types pour l'affichage
type TokenStatus = {
=======

// Types pour les données
type AllowedToken = {
  id: number;
  name: string;
  symbol: string;
>>>>>>> 222fd1cfc8eab27f6b1ef780a7a212025d605efc
  address: string;
  symbol: string;
  name: string;
  priceFeed: string;
  isAllowed: boolean;
  isConfigured: boolean;
};

<<<<<<< HEAD
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
=======
type AdminLog = {
  id: number;
  date: string;
  admin: string;
  action: string;
  details: string;
  hash: string;
};
>>>>>>> 222fd1cfc8eab27f6b1ef780a7a212025d605efc

const AdminDashboard = () => {
  // --- STATES ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [distributeLoading, setDistributeLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [newTokenAddress, setNewTokenAddress] = useState("");
  const [newPriceFeed, setNewPriceFeed] = useState("");

<<<<<<< HEAD
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
=======
  // --- MOCK DATA ---
  const [tokens, setTokens] = useState<AllowedToken[]>([
    {
      id: 1,
      name: "DAPP Token",
      symbol: "DAPP",
      address: "0x8E29F4A636dE39f8be2b679325e2f1D4556ACc50",
      priceFeed: "0xBf34206d3E102DdEae6125A3e898859f1A5DDB1d",
      status: "Active",
    },
    {
      id: 2,
      name: "Mock DAI",
      symbol: "mDAI",
      address: "0xF0F698C6aa2824Abb7b929823EfDbDf43fe05709",
      priceFeed: "0x7D9aaE58Cc4469e99F1C3d8CC8E92C40406eD1b5",
      status: "Active",
    },
  ]);

  const logs: AdminLog[] = [
    {
      id: 1,
      date: "2h ago",
      admin: "0x12...890",
      action: "Added Token",
      details: "USDC",
      hash: "0xabc...123",
    },
    {
      id: 2,
      date: "5h ago",
      admin: "0x12...890",
      action: "Distribute Rewards",
      details: "12,500 DAPP",
      hash: "0xdef...456",
    },
  ];

  // --- HELPER FUNCTIONS ---
  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Address copied!");
  };

  const handleAddToken = () => {
    if (!newTokenAddress || !newPriceFeed) return;
    setIsLoading(true);
    setTimeout(() => {
      setTokens([
        ...tokens,
        {
          id: Date.now(),
          name: "New Token",
          symbol: "NEW",
          address: newTokenAddress,
          priceFeed: newPriceFeed,
          status: "Active",
        },
      ]);
      setNewTokenAddress("");
      setNewPriceFeed("");
      setIsLoading(false);
      alert("Token added successfully!");
    }, 1500);
  };

  const handleDistributeAll = () => {
    if (window.confirm("⚠️ ARE YOU SURE?")) {
      setDistributeLoading(true);
      setTimeout(() => {
        setDistributeLoading(false);
        alert("Rewards distributed successfully!");
      }, 2000);
    }
  };

  // --- VUE 1 : ACCÈS REFUSÉ ---
>>>>>>> 222fd1cfc8eab27f6b1ef780a7a212025d605efc
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-body">
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl max-w-md w-full text-center border-t-4 border-red-500">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8 md:w-10 md:h-10 text-red-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-800 mb-2">
            Access Denied
          </h1>
<<<<<<< HEAD
          <p className="text-gray-500 mb-8">
            Cette zone est réservée à l'administrateur du contrat.
            <br />
            <span className="font-mono text-sm">
              {account ? truncateAddress(account) : "Non connecté"}
            </span>
=======
          <p className="text-gray-500 mb-8 text-sm md:text-base">
            Restricted area. Administrators only.
>>>>>>> 222fd1cfc8eab27f6b1ef780a7a212025d605efc
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-700 transition w-full"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back Home
          </Link>
<<<<<<< HEAD
=======
          <button
            onClick={() => setIsAdmin(true)}
            className="mt-8 text-xs text-gray-400 hover:text-primary underline"
          >
            [DEV] Simulate Admin Login
          </button>
>>>>>>> 222fd1cfc8eab27f6b1ef780a7a212025d605efc
        </div>
      </div>
    );
  }

<<<<<<< HEAD
  // --- 11. STATISTIQUES ---
  const tokensAllowed = tokenStatuses.filter((t) => t.isAllowed).length;
  const tokensPending = tokenStatuses.filter((t) => !t.isAllowed).length;

=======
  // --- VUE 2 : DASHBOARD ---
>>>>>>> 222fd1cfc8eab27f6b1ef780a7a212025d605efc
  return (
    <div className="bg-gray-50 min-h-screen font-body text-dark flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
          {/* HEADER (Responsive) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                <Wrench className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-heading font-bold text-primary flex flex-wrap items-center gap-2">
                  Admin Dashboard
                  <span className="bg-red-100 text-red-700 text-[10px] md:text-xs px-2 py-1 rounded border border-red-200 uppercase tracking-wider font-bold whitespace-nowrap">
                    Admin Mode
                  </span>
                </h1>
                <p className="text-gray-500 text-xs md:text-sm">
                  Manage platform settings
                </p>
              </div>
            </div>
<<<<<<< HEAD
            <div className="text-right">
              <p className="text-xs text-gray-400 font-mono">
                Connecté en tant que:
              </p>
=======
            {/* Masqué sur mobile pour gagner de la place */}
            <div className="text-right hidden md:block">
              <p className="text-xs text-gray-400 font-mono">Connected as:</p>
>>>>>>> 222fd1cfc8eab27f6b1ef780a7a212025d605efc
              <p className="text-sm font-bold text-primary font-mono">
                0x1234...5678
              </p>
            </div>
          </div>

<<<<<<< HEAD
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
=======
          {/* STATS OVERVIEW (Grid 1 col mobile -> 3 cols desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <StatCard
              title="Total Value Locked"
              value="$1,245,890"
              sub="Across all tokens"
              icon={<Coins />}
              color="border-gold"
              iconColor="text-gold bg-gold/10"
            />
            <StatCard
              title="Active Stakers"
              value="156 users"
              sub="Currently staking"
>>>>>>> 222fd1cfc8eab27f6b1ef780a7a212025d605efc
              icon={<Users />}
              color="border-blue-500"
              iconColor="text-blue-500 bg-blue-50"
            />
<<<<<<< HEAD
=======
            <StatCard
              title="Pending Rewards"
              value="12,450 DAPP"
              sub="Ready to distribute"
              icon={<Gift />}
              color="border-green-500"
              iconColor="text-green-500 bg-green-50"
            />
>>>>>>> 222fd1cfc8eab27f6b1ef780a7a212025d605efc
          </div>

          {/* MANAGE TOKENS */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
<<<<<<< HEAD
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h2 className="text-lg font-heading font-bold text-primary">
                🪙 Tokens Configurés
=======
            <div className="p-4 md:p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-heading font-bold text-primary">
                🪙 Manage Tokens
>>>>>>> 222fd1cfc8eab27f6b1ef780a7a212025d605efc
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

            {/* RESPONSIVE TABLE CONTAINER */}
            <div className="w-full overflow-x-auto">
<<<<<<< HEAD
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
=======
              <table className="w-full text-left min-w-[600px]">
                {" "}
                {/* min-w force le scroll si trop petit */}
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                  <tr>
                    <th className="px-4 md:px-6 py-3">Token</th>
                    <th className="px-4 md:px-6 py-3 hidden md:table-cell">
                      Symbol
                    </th>
                    <th className="px-4 md:px-6 py-3">Address</th>
                    <th className="px-4 md:px-6 py-3 hidden lg:table-cell">
                      Price Feed
                    </th>
                    <th className="px-4 md:px-6 py-3">Status</th>
                    <th className="px-4 md:px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tokens.map((token) => (
                    <tr key={token.id}>
                      <td className="px-4 md:px-6 py-3 font-bold text-primary text-sm">
                        {token.name}
                      </td>
                      <td className="px-4 md:px-6 py-3 text-xs font-mono hidden md:table-cell">
                        {token.symbol}
                      </td>
                      <td className="px-4 md:px-6 py-3">
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
                      <td className="px-4 md:px-6 py-3 font-mono text-xs text-gray-500 hidden lg:table-cell">
                        {truncateAddress(token.priceFeed)}
                      </td>
                      <td className="px-4 md:px-6 py-3">
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-[4px] text-[10px] md:text-xs font-bold">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-3 text-right">
                        <button className="text-red-500 hover:bg-red-50 p-1.5 rounded transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
>>>>>>> 222fd1cfc8eab27f6b1ef780a7a212025d605efc
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

<<<<<<< HEAD
            {/* Formulaire Ajout Token Manuel */}
            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Ajouter un Token Manuellement
=======
            {/* Formulaire Responsive (Stacké sur mobile) */}
            <div className="p-4 md:p-6 bg-gray-50 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-700 mb-3">
                Add New Token
>>>>>>> 222fd1cfc8eab27f6b1ef780a7a212025d605efc
              </h3>
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Contract Address (0x...)"
                  value={newTokenAddress}
                  onChange={(e) => setNewTokenAddress(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:border-gold outline-none font-mono text-xs md:text-sm"
                />
                <input
                  type="text"
                  placeholder="Price Feed (0x...)"
                  value={newPriceFeed}
                  onChange={(e) => setNewPriceFeed(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:border-gold outline-none font-mono text-xs md:text-sm"
                />
                <button
                  onClick={handleAddToken}
<<<<<<< HEAD
                  disabled={isLoading}
                  className="bg-gold hover:bg-gold-hover text-white font-bold px-6 py-2 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
=======
                  disabled={isLoading || !newTokenAddress}
                  className="bg-gold hover:bg-gold-hover text-white font-bold px-6 py-2 rounded-lg transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
>>>>>>> 222fd1cfc8eab27f6b1ef780a7a212025d605efc
                >
                  {isLoading ? (
                    "Adding..."
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Add
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* REWARD DISTRIBUTION (Grid 1 col mobile -> 2 cols desktop) */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-heading font-bold text-primary flex items-center gap-2">
                🎁 Reward Distribution
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
              {/* GAUCHE */}
              <div className="p-6 md:p-8">
                <h3 className="font-bold text-base md:text-lg text-primary mb-2">
                  Distribute to All
                </h3>
                <p className="text-gray-500 text-xs md:text-sm mb-4">
                  Issue rewards to all stakers.
                </p>
                <button
                  onClick={handleDistributeAll}
                  disabled={distributeLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 md:py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm md:text-base disabled:opacity-50"
                >
                  {distributeLoading ? (
                    "Processing..."
                  ) : (
                    <>
                      <Gift className="w-5 h-5" /> Distribute All
                    </>
                  )}
                </button>
              </div>
              {/* DROITE */}
              <div className="p-6 md:p-8">
                <h3 className="font-bold text-base md:text-lg text-primary mb-2">
                  Individual Reward
                </h3>
                <p className="text-gray-500 text-xs md:text-sm mb-4">
                  Send to specific user.
                </p>
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="User Address (0x...)"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 font-mono text-xs md:text-sm"
                  />
                  <button className="w-full bg-white border border-primary text-primary hover:bg-primary hover:text-white font-bold py-2 rounded-lg transition text-sm">
                    Issue Reward
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

// Composant Helper pour les cartes Stats (pour éviter la répétition)
const StatCard = ({ title, value, sub, icon, color, iconColor }: any) => (
  <div className={`bg-white p-5 rounded-xl shadow-sm border-l-4 ${color}`}>
    <div className="flex justify-between items-start mb-2">
      <div>
        <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase">
          {title}
        </p>
        <h3 className="text-2xl md:text-3xl font-heading font-bold text-primary mt-1">
          {value}
        </h3>
      </div>
      <div className={`p-2 rounded-lg ${iconColor} shrink-0`}>
        {React.cloneElement(icon, { className: "w-5 h-5 md:w-6 md:h-6" })}
      </div>
    </div>
    <p className="text-[10px] md:text-xs text-gray-400">{sub}</p>
  </div>
);

export default AdminDashboard;
