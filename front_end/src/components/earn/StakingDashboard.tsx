import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { useWeb3 } from "../../hooks/useWeb3";
import { portfolioApi, rewardsApi, stakingApi } from "../../services/blockchainApi";
import {
  Coins,
  TrendingUp,
  Award,
  ArrowLeft,
  Loader2,
  Wallet,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

const StakingDashboard = () => {
  const { account, isConnected, connectWallet } = useWeb3();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Données depuis Django
  const [totalValue, setTotalValue] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [distributions, setDistributions] = useState<any[]>([]);

  const loadDashboard = async () => {
    try {
      const [valueData, posData, rewardData, distData] = await Promise.all([
        portfolioApi.totalValue().catch(() => null),
        stakingApi.myPositions().catch(() => ({ results: [] })),
        rewardsApi.myRewards().catch(() => ({ results: [] })),
        rewardsApi.myDistributions().catch(() => ({ results: [] })),
      ]);

      setTotalValue(valueData);
      setPositions(posData?.results || posData || []);
      setRewards(rewardData?.results || rewardData || []);
      setDistributions(distData?.results || distData || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isConnected) loadDashboard();
    else setLoading(false);
  }, [isConnected, account]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
  };

  const truncateHash = (hash: string) =>
    hash ? `${hash.slice(0, 10)}...${hash.slice(-6)}` : "—";

  const formatAmount = (val: any) => {
    const n = parseFloat(val || 0);
    return isNaN(n) ? "0.00" : n.toFixed(4);
  };

  return (
    <div className="bg-gray-50 min-h-screen font-body text-dark flex flex-col">
      <Navbar />

      <main className="flex-grow pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <div>
            <Link to="/earn" className="inline-flex items-center gap-2 text-gray-400 hover:text-gold transition mb-6 group text-sm font-medium">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
              Golden Earn
            </Link>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                  <TrendingUp className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h1 className="text-3xl font-heading font-bold text-primary">Mon Dashboard</h1>
                  <p className="text-gray-500">Suivi de vos positions et récompenses</p>
                </div>
              </div>
              {isConnected && (
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-primary transition border border-gray-200 bg-white px-4 py-2 rounded-lg"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                  Actualiser
                </button>
              )}
            </div>
          </div>

          {/* Non connecté */}
          {!isConnected ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Wallet className="w-8 h-8 text-blue-300" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">Connectez votre wallet</h3>
              <p className="text-gray-400 mb-6 text-sm">Connectez MetaMask pour voir votre dashboard de staking</p>
              <button
                onClick={connectWallet}
                className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-900 transition"
              >
                Connecter MetaMask
              </button>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-gold animate-spin" />
            </div>
          ) : (
            <>
              {/* ── Stat Cards ── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Value */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden relative">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-gold" />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-primary">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Valeur Totale</span>
                  </div>
                  <div className="text-3xl font-heading font-bold text-primary">
                    {totalValue?.total_value_eth
                      ? `${parseFloat(totalValue.total_value_eth).toFixed(4)} ETH`
                      : totalValue?.total_value_usd
                      ? `$${parseFloat(totalValue.total_value_usd).toLocaleString()}`
                      : "—"}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Portfolio on-chain total</p>
                </div>

                {/* Positions actives */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden relative">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold to-yellow-400" />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                      <Coins className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Positions</span>
                  </div>
                  <div className="text-3xl font-heading font-bold text-primary">{positions.length}</div>
                  <p className="text-xs text-gray-400 mt-1">Positions de staking actives</p>
                </div>

                {/* Rewards */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden relative">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-emerald-500" />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                      <Award className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Rewards</span>
                  </div>
                  <div className="text-3xl font-heading font-bold text-primary">{rewards.length}</div>
                  <p className="text-xs text-gray-400 mt-1">Récompenses reçues</p>
                </div>
              </div>

              {/* ── Positions de staking ── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                  <h2 className="text-lg font-heading font-bold text-primary flex items-center gap-2">
                    <Coins className="w-5 h-5 text-gold" /> Mes Positions
                  </h2>
                  <Link to="/earn/staking" className="text-sm text-gold hover:text-gold-hover font-bold transition">
                    + Staker
                  </Link>
                </div>
                {positions.length === 0 ? (
                  <div className="p-12 text-center text-gray-400">
                    <Coins className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                    <p className="text-sm">Aucune position de staking enregistrée</p>
                    <Link to="/earn/staking" className="text-gold text-sm font-bold mt-2 inline-block hover:underline">
                      Commencer à staker →
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider">
                          <th className="p-4 text-left">Farm</th>
                          <th className="p-4 text-left">Montant</th>
                          <th className="p-4 text-left">Statut</th>
                          <th className="p-4 text-left">Date</th>
                          <th className="p-4 text-right">Tx</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {positions.map((pos: any, i: number) => (
                          <tr key={pos.id || i} className="hover:bg-gray-50 transition">
                            <td className="p-4 font-bold text-primary">
                              {pos.token_farm?.name || pos.token_farm || "GLD Pool"}
                            </td>
                            <td className="p-4 font-mono text-gray-700">
                              {formatAmount(pos.amount)} GLD
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                pos.is_active !== false
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}>
                                {pos.is_active !== false ? "Actif" : "Terminé"}
                              </span>
                            </td>
                            <td className="p-4 text-gray-400 text-xs">
                              {pos.staked_at
                                ? new Date(pos.staked_at).toLocaleDateString("fr-FR")
                                : pos.created_at
                                ? new Date(pos.created_at).toLocaleDateString("fr-FR")
                                : "—"}
                            </td>
                            <td className="p-4 text-right">
                              {pos.tx_hash ? (
                                <a
                                  href={`https://sepolia.etherscan.io/tx/${pos.tx_hash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-gold hover:text-gold-hover text-xs font-mono"
                                >
                                  {truncateHash(pos.tx_hash)}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ── Récompenses ── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50">
                  <h2 className="text-lg font-heading font-bold text-primary flex items-center gap-2">
                    <Award className="w-5 h-5 text-green-500" /> Mes Récompenses
                  </h2>
                </div>
                {rewards.length === 0 ? (
                  <div className="p-12 text-center text-gray-400">
                    <Award className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                    <p className="text-sm">Aucune récompense reçue pour l'instant</p>
                    <p className="text-xs text-gray-300 mt-1">Les rewards sont distribués périodiquement par le contrat</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider">
                          <th className="p-4 text-left">Montant</th>
                          <th className="p-4 text-left">Token</th>
                          <th className="p-4 text-left">Date</th>
                          <th className="p-4 text-right">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {rewards.map((r: any, i: number) => (
                          <tr key={r.id || i} className="hover:bg-gray-50 transition">
                            <td className="p-4 font-mono font-bold text-green-600">
                              +{formatAmount(r.amount || r.reward_amount)}
                            </td>
                            <td className="p-4 text-gray-700">
                              {r.token?.symbol || r.token_symbol || "GLD"}
                            </td>
                            <td className="p-4 text-gray-400 text-xs">
                              {r.created_at
                                ? new Date(r.created_at).toLocaleDateString("fr-FR")
                                : r.distributed_at
                                ? new Date(r.distributed_at).toLocaleDateString("fr-FR")
                                : "—"}
                            </td>
                            <td className="p-4 text-right">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                r.status === "distributed" || r.is_distributed
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}>
                                {r.status === "distributed" || r.is_distributed ? "Distribué" : "En attente"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ── Distributions reçues ── */}
              {distributions.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-50">
                    <h2 className="text-lg font-heading font-bold text-primary">Historique des Distributions</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider">
                          <th className="p-4 text-left">Batch</th>
                          <th className="p-4 text-left">Montant</th>
                          <th className="p-4 text-left">Date</th>
                          <th className="p-4 text-right">Tx</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {distributions.map((d: any, i: number) => (
                          <tr key={d.id || i} className="hover:bg-gray-50 transition">
                            <td className="p-4 text-gray-700 font-mono text-xs">
                              {d.batch || d.batch_id || `#${i + 1}`}
                            </td>
                            <td className="p-4 font-mono font-bold text-green-600">
                              +{formatAmount(d.amount)}
                            </td>
                            <td className="p-4 text-gray-400 text-xs">
                              {d.distributed_at
                                ? new Date(d.distributed_at).toLocaleDateString("fr-FR")
                                : d.created_at
                                ? new Date(d.created_at).toLocaleDateString("fr-FR")
                                : "—"}
                            </td>
                            <td className="p-4 text-right">
                              {d.tx_hash ? (
                                <a
                                  href={`https://sepolia.etherscan.io/tx/${d.tx_hash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-gold hover:text-gold-hover text-xs font-mono"
                                >
                                  {truncateHash(d.tx_hash)}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StakingDashboard;
