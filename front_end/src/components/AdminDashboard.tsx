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
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
<<<<<<< HEAD
import { useWeb3 } from "../hooks/useWeb3";

// Types pour l'affichage local (visuel)
type AllowedToken = {
  id: number;
  name: string;
  symbol: string;
  address: string;
  priceFeed: string;
  status: "Active" | "Paused";
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

  const [newTokenAddress, setNewTokenAddress] = useState("");
  const [newPriceFeed, setNewPriceFeed] = useState("");

  // Liste locale des tokens (Juste pour l'affichage visuel après ajout)
  const [tokens, setTokens] = useState<AllowedToken[]>([
    {
      id: 1,
      name: "DAPP Token",
      symbol: "DAPP",
      address: "0x8E29...CC50",
      priceFeed: "0xBf34...DB1d",
      status: "Active",
    },
    {
      id: 2,
      name: "Mock DAI",
      symbol: "mDAI",
      address: "0xF0F6...709",
      priceFeed: "0x7D9a...D1b5",
      status: "Active",
    },
  ]);

  useEffect(() => {
    const verify = async () => {
      // On attend un peu que la connexion se stabilise ou on vérifie direct
      if (!isConnected || !account) {
        setIsAdmin(false);
        setIsCheckingAdmin(false);
        return;
      }

      console.log("Vérification admin pour:", account);
      const adminStatus = await checkIsAdmin();
      setIsAdmin(adminStatus);
      setIsCheckingAdmin(false);
    };

    verify();
  }, [account, isConnected]); // Se relance si le compte change

  // --- 4. FONCTIONS D'ACTION ---

  const handleAddToken = async () => {
    if (!newTokenAddress || !newPriceFeed) {
      alert("Remplis tous les champs");
      return;
    }
    // Validation basique
    if (!newTokenAddress.startsWith("0x") || newTokenAddress.length !== 42) {
      alert("Adresse token invalide");
      return;
    }

    setIsLoading(true);
    // Appel au Hook Web3
    const success = await addAllowedToken(newTokenAddress, newPriceFeed);

    if (success) {
      // Mise à jour visuelle du tableau
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
      alert("✅ Token ajouté avec succès sur la Blockchain !");
    }
    setIsLoading(false);
  };

  const handleDistributeAll = async () => {
    if (
      !window.confirm(
        "⚠️ ATTENTION : Distribuer les rewards à TOUS les stakers ? Cela va coûter des frais de gaz."
      )
    ) {
      return;
    }
    setDistributeLoading(true);
    // Appel au Hook Web3
    const success = await distributeRewardsToAll();
    if (success) {
      alert("✅ Rewards distribués à tous !");
    }
    setDistributeLoading(false);
  };

  const handleIssueRewardToUser = async () => {
    if (!userAddressForReward || !userAddressForReward.startsWith("0x")) {
      alert("Adresse invalide");
      return;
    }
    if (
      !window.confirm(
        `Distribuer reward manuellement à ${userAddressForReward} ?`
      )
    ) {
      return;
    }
    // Appel au Hook Web3
    const success = await issueRewardToUser(userAddressForReward);
    if (success) {
      alert("✅ Reward individuel distribué !");
      setUserAddressForReward("");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copié !");
  };

  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

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
            Cette zone est réservée à l'administrateur du contrat (
            {account ? truncateAddress(account) : "Non connecté"}).
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-700 transition w-full"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back Home
          </Link>
          {/* Bouton de secours pour tester si tu n'arrives pas à te connecter en admin */}
          <button
            onClick={() => setIsAdmin(true)}
            className="mt-6 text-xs text-gray-400 hover:text-gold underline"
          >
            [DEV] Forcer l'accès (Simulation)
          </button>
        </div>
      </div>
    );
  }

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
            <div className="text-right hidden md:block">
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

          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Value Locked"
              value="$1.2M"
              sub="Simulation"
              icon={<Coins />}
              color="border-gold"
              iconColor="text-gold bg-gold/10"
            />
            <StatCard
              title="Active Stakers"
              value="156"
              sub="Simulation"
              icon={<Users />}
              color="border-blue-500"
              iconColor="text-blue-500 bg-blue-50"
            />
            <StatCard
              title="Pending Rewards"
              value="12,450"
              sub="Simulation"
              icon={<Gift />}
              color="border-green-500"
              iconColor="text-green-500 bg-green-50"
            />
          </div>

          {/* MANAGE TOKENS */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-heading font-bold text-primary">
                🪙 Gérer les Tokens Autorisés
              </h2>
            </div>

            {/* RESPONSIVE TABLE CONTAINER */}
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                  <tr>
                    <th className="px-6 py-4">Token</th>
                    <th className="px-6 py-4">Adresse</th>
                    <th className="px-6 py-4">Price Feed</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tokens.map((token) => (
                    <tr key={token.id}>
                      <td className="px-6 py-4 font-bold text-primary">
                        {token.name}
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
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">
                        {truncateAddress(token.priceFeed)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-red-500 hover:bg-red-50 p-2 rounded transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Formulaire Ajout Token */}
            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-700 mb-4">
                Ajouter un Token & Price Feed
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
                  className="bg-gold hover:bg-gold-hover text-white font-bold px-6 py-2 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
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
