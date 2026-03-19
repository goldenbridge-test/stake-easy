import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SUPPORTED_TOKENS } from "../../constants/tokens";
import {
  Wallet,
  Info,
  Check,
  ChevronDown,
  Coins,
  ExternalLink,
  ArrowLeft,
  Clock,
  CalendarCheck,
} from "lucide-react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { useWeb3 } from "../../hooks/useWeb3";
import { stakingApi, tokenPricesApi } from "../../services/blockchainApi";
import { isAuthenticated } from "../../services/api";

type Token = {
  symbol: string;
  name: string;
  address: string;
  balance: number;
  price: number;
  iconColor: string;
};

type StakedAsset = {
  symbol: string;
  address: string;
  amount: number;
  value: number;
  iconColor: string;
  duration_years?: number;
  end_date?: string;
  status?: string;
  staked_at?: string;
};

type HistoryItem = {
  action: "Staked" | "Unstaked";
  token: string;
  amount: string;
  blockNumber: number;
  hash: string;
};

const DURATION_OPTIONS = [
  { years: 1, label: "1 an",  apy: "8%" },
  { years: 2, label: "2 ans", apy: "10%" },
  { years: 3, label: "3 ans", apy: "12%" },
  { years: 4, label: "4 ans", apy: "15%" },
];

const Staking = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCooldownChecked, setIsCooldownChecked] = useState(false);
  const [durationYears, setDurationYears] = useState(1);
  const {
    connectWallet,
    stakeTokens,
    unstakeTokens,
    getTokenBalance,
    getStakingBalance,
    getStakingEvents,
    getAllowedTokens,
    account,
    isConnected,
    loading,
    chainId,
  } = useWeb3();

  const [tokens, setTokens] = useState(SUPPORTED_TOKENS);
  const [tokenBalances, setTokenBalances] = useState<{
    [key: string]: string;
  }>({});
  // Données réelles depuis la blockchain
  const [stakedAssets, setStakedAssets] = useState<StakedAsset[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Charger les balances wallet + balances stakées + historique
  const loadAllData = async () => {
    if (!isConnected) return;

    setIsLoading(true);
    const balances: { [key: string]: string } = {};
    const staked: StakedAsset[] = [];

    // Charger les positions API (duration, end_date, status)
    let apiPositions: any[] = [];
    try {
      const res = await stakingApi.myPositions();
      apiPositions = Array.isArray(res) ? res : (res.results || []);
      console.log("📦 API positions:", JSON.stringify(apiPositions, null, 2));
    } catch (e) {
      console.warn("myPositions() failed:", e);
    }

    for (const token of tokens) {
      // 1. Balance dans le wallet (combien tu possèdes)
      const balance = await getTokenBalance(token.address);
      balances[token.symbol] = balance;

      // 2. Balance stakée (combien tu as mis en staking)
      const stakingBal = await getStakingBalance(token.address);
      const stakedAmount = parseFloat(stakingBal);

      if (stakedAmount > 0) {
        // Merger avec les données API — essai par adresse, puis par symbole
        const apiPos = apiPositions.find(
          (p: any) => p.token_address?.toLowerCase() === token.address.toLowerCase()
        ) || apiPositions.find(
          (p: any) => p.token_symbol?.toUpperCase() === token.symbol.toUpperCase()
        ) || apiPositions.find(
          (p: any) => p.token?.symbol?.toUpperCase() === token.symbol.toUpperCase()
        );
        console.log(`🔍 Merge [${token.symbol}]:`, apiPos ?? "no match");
        staked.push({
          symbol: token.symbol,
          address: token.address,
          amount: stakedAmount,
          value: stakedAmount * token.price,
          iconColor: token.iconColor,
          duration_years: apiPos?.duration_years,
          end_date: apiPos?.end_date,
          status: apiPos?.status,
          staked_at: apiPos?.staked_at,
        });
      }
    }

    setTokenBalances(balances);
    setStakedAssets(staked);

    // Mettre à jour les tokens avec les vraies balances
    const updatedTokens = tokens.map((token) => ({
      ...token,
      balance: parseFloat(balances[token.symbol] || "0"),
    }));
    setTokens(updatedTokens);
    if (updatedTokens.length > 0) {
      setSelectedToken(updatedTokens[0]);
    }

    // 3. Charger l'historique des événements
    const events = await getStakingEvents();
    setHistory(events);

    setIsLoading(false);
  };

  // Helper : charge tokens autorisés depuis le contrat + prix
  const loadTokensFromChain = async () => {
    const [onchainTokens, priceData] = await Promise.all([
      getAllowedTokens(),
      tokenPricesApi.list().catch(() => []),
    ]);
    const apiPrices = Array.isArray(priceData) ? priceData : ((priceData as any).results || []);
    // Dédupliquer par adresse (le contrat peut avoir des doublons)
    const seen = new Set<string>();
    const unique = onchainTokens.filter((t: any) => {
      const addr = t.address.toLowerCase();
      if (seen.has(addr)) return false;
      seen.add(addr);
      return true;
    });
    if (unique.length === 0) return;
    const mapped = unique.map((t: any) => {
      const priceEntry = (apiPrices as any[]).find(
        (p: any) => p.token_symbol?.toUpperCase() === t.symbol?.toUpperCase()
      );
      const price = priceEntry?.price_usd ? parseFloat(priceEntry.price_usd) : 2000;
      return {
        symbol: t.symbol,
        name: t.name,
        address: t.address,
        balance: 0,
        price,
        iconColor: "bg-gradient-to-br from-yellow-400 to-yellow-600",
      };
    });
    setTokens(mapped);
    setSelectedToken(mapped[0]);
  };


  // Recharger les tokens depuis le contrat à chaque fois que le provider change
  // (au mount avec RPC public, puis avec le vrai provider MetaMask une fois connecté)
  useEffect(() => {
    loadTokensFromChain();
  }, [isConnected]);

  useEffect(() => {
    if (isConnected) {
      loadAllData();
    } else {
      setIsLoading(false);
    }
  }, [isConnected, account]);

  const handleStake = async () => {
    if (!amount || !selectedToken) return;
    if (!isAuthenticated()) {
      alert("You must be signed in to record your stake. The on-chain transaction will still proceed.");
    }
    const { success, txHash } = await stakeTokens(amount, selectedToken.address);
    if (success) {
      if (txHash && isAuthenticated()) {
        try {
          const recorded = await stakingApi.recordStake({
            token_address: selectedToken.address,
            token_symbol: selectedToken.symbol,
            chain_id: chainId ?? 11155111,
            amount,
            tx_hash: txHash,
            duration_years: durationYears,
          });
          console.log("✅ recordStake:", recorded);
        } catch (e: any) {
          console.warn("❌ recordStake failed:", e);
          alert(`Stake on-chain successful (tx: ${txHash.slice(0, 10)}...) but backend recording failed.`);
        }
      }
      alert("Tokens stakés avec succès !");
      setAmount("");
      // Attendre que le nœud RPC reflète le nouvel état
      await new Promise(r => setTimeout(r, 2000));
      await loadAllData();
    }
  };

  const handleUnstake = async (tokenAddress: string) => {
    // Vérifier si l'utilisateur unstake avant la fin de sa période
    const asset = stakedAssets.find(a => a.address.toLowerCase() === tokenAddress.toLowerCase());
    const isEarly = asset?.end_date && new Date(asset.end_date) > new Date();

    if (isEarly) {
      const endDateFormatted = new Date(asset!.end_date!).toLocaleDateString("en-GB", {
        day: "2-digit", month: "long", year: "numeric"
      });
      const confirmed = window.confirm(
        `⚠️ WARNING — Early Unstake\n\n` +
        `Your staking period ends on ${endDateFormatted}.\n\n` +
        `By unstaking now, you will lose ALL accumulated rewards for this position.\n\n` +
        `Do you still want to proceed?`
      );
      if (!confirmed) return;
    } else {
      if (!window.confirm("Unstake all tokens for this asset?")) return;
    }
    const { success, txHash } = await unstakeTokens(tokenAddress);
    if (success) {
      // Enregistrer l'unstake en base Django
      if (txHash) {
        stakingApi.recordUnstake({
          tx_hash: txHash,
          amount: "0", // montant retiré — on n'a pas la valeur exacte ici
        }).catch((e) => console.warn("Enregistrement unstake Django échoué:", e));
      }
      alert("Tokens unstakés avec succès !");
      await loadAllData();
    }
  };

  // Trouver le symbole d'un token à partir de son adresse
  const getSymbolFromAddress = (address: string) => {
    const token = tokens.find(
      (t) => t.address.toLowerCase() === address.toLowerCase()
    );
    return token?.symbol || `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const truncateHash = (hash: string) =>
    `${hash.slice(0, 10)}...${hash.slice(-6)}`;

  const usdValue =
    amount && selectedToken
      ? (parseFloat(amount) * selectedToken.price).toLocaleString()
      : "0.00";

  const Skeleton = ({ className }: { className: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );

  return (
    <div className="bg-gray-50 min-h-screen font-body text-dark flex flex-col">
      <Navbar />

      <main className="flex-grow pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="mb-8">
            <Link to="/earn" className="inline-flex items-center gap-2 text-gray-400 hover:text-gold transition mb-6 group text-sm font-medium">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
              Golden Earn
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                <Coins className="w-6 h-6 text-gold" />
              </div>
              <div>
                <h1 className="text-3xl font-heading font-bold text-primary">
                  GLD Staking
                </h1>
                <p className="text-gray-500">
                  Stakez vos GLD et gagnez des récompenses — APY 12.5%
                </p>
              </div>
            </div>
          </div>

          {/* SECTION PRINCIPALE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* GAUCHE : FORMULAIRE */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden relative">
                <div className="h-1 w-full bg-gradient-to-r from-primary to-gold"></div>

                <div className="p-6 md:p-8">
                  <h2 className="text-xl font-heading font-bold text-primary mb-6 flex items-center gap-2">
                    Stake Your Tokens
                  </h2>

                  {/* SELECT TOKEN */}
                  <div className="mb-6 relative">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Select Token
                    </label>

                    {isLoading ? (
                      <Skeleton className="h-16 w-full" />
                    ) : (
                      <>
                        <button
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 flex justify-between items-center hover:border-gold transition group text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full ${selectedToken?.iconColor} flex items-center justify-center text-white font-bold text-xs`}
                            >
                              {selectedToken?.symbol[0]}
                            </div>
                            <div>
                              <div className="font-bold text-primary">
                                {selectedToken?.symbol}
                              </div>
                              <div className="text-xs text-gray-500">
                                Balance:{" "}
                                {tokenBalances[selectedToken?.symbol || ""] ||
                                  "0.00"}{" "}
                                {selectedToken?.symbol}
                              </div>
                            </div>
                          </div>
                          <ChevronDown
                            className={`w-5 h-5 text-gray-400 group-hover:text-gold transition ${isDropdownOpen ? "rotate-180" : ""
                              }`}
                          />
                        </button>

                        {isDropdownOpen && (
                          <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden">
                            {tokens.map((token) => (
                              <div
                                key={token.symbol}
                                onClick={() => {
                                  setSelectedToken(token);
                                  setIsDropdownOpen(false);
                                }}
                                className="p-4 flex items-center gap-3 hover:bg-blue-50 cursor-pointer transition"
                              >
                                <div
                                  className={`w-6 h-6 rounded-full ${token.iconColor} flex items-center justify-center text-white text-[10px]`}
                                >
                                  {token.symbol[0]}
                                </div>
                                <span className="font-bold text-gray-700">
                                  {token.symbol}
                                </span>
                                <span className="ml-auto text-sm text-gray-400">
                                  {tokenBalances[token.symbol] || "0.00"}{" "}
                                  available
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* AMOUNT INPUT */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Amount to Stake
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-4 pr-20 py-4 rounded-xl border border-gray-200 bg-gray-50 text-xl font-mono font-bold text-primary focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition"
                      />
                      <button
                        onClick={() =>
                          setAmount(
                            tokenBalances[selectedToken?.symbol || ""] || "0"
                          )
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white border border-gray-200 text-xs font-bold text-primary px-3 py-1.5 rounded-lg hover:bg-gold hover:text-white hover:border-gold transition"
                      >
                        MAX
                      </button>
                    </div>
                    <div className="text-right text-sm text-gray-400 mt-2 font-mono">
                      ≈ ${usdValue} USD
                    </div>
                  </div>

                  {/* DURATION SELECTOR */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Durée du staking
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {DURATION_OPTIONS.map((opt) => (
                        <button
                          key={opt.years}
                          type="button"
                          onClick={() => setDurationYears(opt.years)}
                          className={`flex flex-col items-center py-3 px-2 rounded-xl border-2 transition font-heading ${
                            durationYears === opt.years
                              ? "border-gold bg-gold/10 text-primary"
                              : "border-gray-200 bg-white text-gray-500 hover:border-gold/50"
                          }`}
                        >
                          <span className="text-base font-bold">{opt.label}</span>
                          <span className={`text-xs font-semibold mt-0.5 ${durationYears === opt.years ? "text-green-600" : "text-gray-400"}`}>
                            {opt.apy} APY
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* INFO BOX */}
                  <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100 mb-6">
                    <h3 className="text-primary font-bold text-sm mb-3 flex items-center gap-2">
                      <Info className="w-4 h-4 text-gold" /> Staking Info
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex justify-between">
                        <span>Minimum stake:</span>
                        <span className="font-mono font-bold">0.01 GLD</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Durée choisie:</span>
                        <span className="font-mono font-bold">{durationYears} an{durationYears > 1 ? "s" : ""}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>APY estimé:</span>
                        <span className="font-mono font-bold text-green-600">
                          {DURATION_OPTIONS.find(o => o.years === durationYears)?.apy}
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* CHECKBOX */}
                  <label className="flex items-start gap-3 mb-8 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={isCooldownChecked}
                        onChange={(e) => setIsCooldownChecked(e.target.checked)}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 shadow-sm checked:border-gold checked:bg-gold hover:border-gold focus:outline-none transition"
                      />
                      <Check className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                    </div>
                    <span className="text-sm text-gray-500 group-hover:text-primary transition select-none">
                      Je comprends que mes tokens seront bloqués pendant{" "}
                      <span className="font-bold">{durationYears} an{durationYears > 1 ? "s" : ""}</span>{" "}
                      (durée maximale : 4 ans).
                    </span>
                  </label>

                  {/* MAIN BUTTON */}
                  {!isConnected ? (
                    <button
                      onClick={connectWallet}
                      className="w-full bg-primary hover:bg-blue-900 text-white font-heading font-bold py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                    >
                      Connect Wallet to Stake
                    </button>
                  ) : (
                    <button
                      onClick={handleStake}
                      disabled={
                        !amount ||
                        !isCooldownChecked ||
                        parseFloat(amount) <= 0 ||
                        loading
                      }
                      className="w-full bg-gold hover:bg-gold-hover text-white font-heading font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                      {loading
                        ? "Transaction en cours..."
                        : `Stake ${amount || ""} Tokens`}
                    </button>
                  )}

                  {isConnected && (
                    <p className="text-xs text-center mt-3 text-green-600 font-mono">
                      Wallet connected: {account?.substring(0, 6)}...
                      {account?.substring(account!.length - 4)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* DROITE : STAKED ASSETS */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 min-h-[500px] flex flex-col">
                <h2 className="text-xl font-heading font-bold text-primary mb-6 flex items-center gap-2">
                  Your Staked Assets
                </h2>

                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : stakedAssets.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-gray-400 text-sm border-b border-gray-100">
                          <th className="pb-4 font-medium pl-2">Token</th>
                          <th className="pb-4 font-medium">Montant</th>
                          <th className="pb-4 font-medium">Valeur (USD)</th>
                          <th className="pb-4 font-medium">Durée</th>
                          <th className="pb-4 font-medium">Fin le</th>
                          <th className="pb-4 font-medium">Statut</th>
                          <th className="pb-4 font-medium text-right pr-2">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {stakedAssets.map((asset) => (
                          <tr key={asset.symbol} className="group hover:bg-gray-50 transition">
                            <td className="py-4 pl-2">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full ${asset.iconColor} flex items-center justify-center font-bold text-xs text-white`}>
                                  {asset.symbol[0]}
                                </div>
                                <span className="font-bold text-primary">{asset.symbol}</span>
                              </div>
                            </td>
                            <td className="py-4 font-mono">{asset.amount.toFixed(4)}</td>
                            <td className="py-4 font-mono text-gray-500">${asset.value.toLocaleString()}</td>
                            <td className="py-4">
                              {asset.duration_years ? (
                                <div className="flex items-center gap-1 text-primary font-semibold text-sm">
                                  <Clock className="w-3.5 h-3.5 text-gold" />
                                  {asset.duration_years} an{asset.duration_years > 1 ? "s" : ""}
                                </div>
                              ) : (
                                <span className="text-gray-300 text-xs">—</span>
                              )}
                            </td>
                            <td className="py-4">
                              {asset.end_date ? (
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <CalendarCheck className="w-3.5 h-3.5 text-green-500" />
                                  {new Date(asset.end_date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                                </div>
                              ) : (
                                <span className="text-gray-300 text-xs">—</span>
                              )}
                            </td>
                            <td className="py-4">
                              {asset.status === "active" ? (
                                <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                  Actif
                                </span>
                              ) : asset.status ? (
                                <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-500 text-xs font-bold px-2.5 py-1 rounded-full border border-gray-200">
                                  {asset.status}
                                </span>
                              ) : (
                                <span className="text-gray-300 text-xs">—</span>
                              )}
                            </td>
                            <td className="py-4 text-right pr-2">
                              {(() => {
                                const isEarly = asset.end_date && new Date(asset.end_date) > new Date();
                                return (
                                  <div className="flex flex-col items-end gap-1">
                                    <button
                                      onClick={() => handleUnstake(asset.address)}
                                      disabled={loading}
                                      className={`text-sm font-bold px-4 py-2 rounded-lg border transition disabled:opacity-40 disabled:cursor-not-allowed ${
                                        isEarly
                                          ? "text-red-600 border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-400"
                                          : "text-primary border-gray-200 hover:border-gold hover:text-gold"
                                      }`}
                                    >
                                      {loading ? "..." : "Unstake"}
                                    </button>
                                    {isEarly && (
                                      <span className="text-[10px] text-red-400 font-semibold">
                                        ⚠️ Rewards will be lost
                                      </span>
                                    )}
                                  </div>
                                );
                              })()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex-grow flex flex-col items-center justify-center text-center py-10">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                      <Wallet className="w-8 h-8 text-blue-300" />
                    </div>
                    <h3 className="text-lg font-bold text-primary mb-1">
                      {isConnected
                        ? "You haven't staked any tokens yet"
                        : "Connect your wallet to see staked assets"}
                    </h3>
                    <p className="text-gray-400 text-sm mb-6">
                      {isConnected
                        ? "Start staking to earn rewards!"
                        : "Click Connect Wallet to get started"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* STAKING HISTORY */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8">
            <h2 className="text-xl font-heading font-bold text-primary mb-6 flex items-center gap-2">
              Staking History
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                    <th className="p-4 rounded-l-lg">Action</th>
                    <th className="p-4">Token</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Block</th>
                    <th className="p-4 rounded-r-lg text-right">Tx</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoading ? (
                    [1, 2, 3].map((i) => (
                      <tr key={i}>
                        <td colSpan={5} className="p-4">
                          <Skeleton className="h-6 w-full" />
                        </td>
                      </tr>
                    ))
                  ) : history.length > 0 ? (
                    history.map((item, idx) => (
                      <tr
                        key={`${item.hash}-${idx}`}
                        className="hover:bg-blue-50/30 transition"
                      >
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${item.action === "Staked"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-orange-100 text-orange-700"
                              }`}
                          >
                            {item.action}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-primary">
                          {getSymbolFromAddress(item.token)}
                        </td>
                        <td className="p-4 font-mono text-gray-600">
                          {parseFloat(item.amount).toFixed(4)}{" "}
                          {getSymbolFromAddress(item.token)}
                        </td>
                        <td className="p-4 text-gray-500 text-sm font-mono">
                          #{item.blockNumber}
                        </td>
                        <td className="p-4 text-right">
                          <a
                            href={`https://sepolia.etherscan.io/tx/${item.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-gold hover:text-gold-hover transition text-xs font-mono"
                          >
                            {truncateHash(item.hash)}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-8 text-center text-gray-400"
                      >
                        {isConnected
                          ? "No staking history yet"
                          : "Connect your wallet to see history"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Staking;
