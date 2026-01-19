import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { SUPPORTED_TOKENS } from "../constants/tokens";
import {
  Wallet,
  Info,
  Check,
  ChevronDown,
  Coins,
  ArrowRight,
  ExternalLink,
  AlertCircle,
  History,
  TrendingUp,
} from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useWeb3 } from "../hooks/useWeb3";
import { ERC20_ABI } from "../constants/abis";

type Token = {
  symbol: string;
  name: string;
  address: string;
  balance: number;
  price: number;
  iconColor: string;
};

const Staking = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCooldownChecked, setIsCooldownChecked] = useState(false);
  const { connectWallet, stakeTokens, getTokenBalance, account, isConnected } =
    useWeb3();

  const [tokens, setTokens] = useState(SUPPORTED_TOKENS);
  const [tokenBalances, setTokenBalances] = useState<{ [key: string]: string }>(
    {}
  );

  // 🔥 FONCTION POUR CHARGER LES BALANCES
  const loadBalances = async () => {
    if (!isConnected) return;

    setIsLoading(true);
    const balances: { [key: string]: string } = {};

    for (const token of SUPPORTED_TOKENS) {
      const balance = await getTokenBalance(token.address);
      balances[token.symbol] = balance;
    }

    setTokenBalances(balances);

    // Mettre à jour les tokens avec les vraies balances
    const updatedTokens = SUPPORTED_TOKENS.map((token) => ({
      ...token,
      balance: parseFloat(balances[token.symbol] || "0"),
    }));

    setTokens(updatedTokens);
    setSelectedToken(updatedTokens[0]); // Sélectionne le premier token
    setIsLoading(false);
  };

  // 🔥 USEEFFECT POUR CHARGER LES BALANCES QUAND ON SE CONNECTE
  useEffect(() => {
    if (isConnected) {
      loadBalances();
    } else {
      setIsLoading(false);
    }
  }, [isConnected, account]); // Se déclenche quand le wallet se connecte

  const handleStake = async () => {
    if (!amount) return;
    await stakeTokens(amount);
    // Recharger les balances après le stake
    await loadBalances();
  };

  const stakedAssets = [
    { symbol: "ETH", amount: 2.5, value: 5625, status: "Ready", cooldown: 0 },
    {
      symbol: "USDT",
      amount: 500,
      value: 500,
      status: "Cooldown",
      cooldown: 12,
    },
  ];

  const history = [
    {
      id: 1,
      action: "Staked",
      token: "ETH",
      amount: "2.5 ETH",
      date: "2h ago",
      hash: "0x123...abc",
    },
    {
      id: 2,
      action: "Unstaked",
      token: "USDT",
      amount: "100 USDT",
      date: "1 day ago",
      hash: "0x456...def",
    },
    {
      id: 3,
      action: "Claimed",
      token: "GB",
      amount: "50 GB",
      date: "3 days ago",
      hash: "0x789...ghi",
    },
  ];

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
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
              <Coins className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold text-primary">
                Staking Dashboard
              </h1>
              <p className="text-gray-500">
                Manage your assets and earn rewards
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden relative">
                <div className="h-1 w-full bg-gradient-to-r from-primary to-gold"></div>

                <div className="p-6 md:p-8">
                  <h2 className="text-xl font-heading font-bold text-primary mb-6 flex items-center gap-2">
                    Stake Your Tokens
                  </h2>

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
                            className={`w-5 h-5 text-gray-400 group-hover:text-gold transition ${
                              isDropdownOpen ? "rotate-180" : ""
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

                  <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100 mb-6">
                    <h3 className="text-primary font-bold text-sm mb-3 flex items-center gap-2">
                      <Info className="w-4 h-4 text-gold" /> Staking Info
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex justify-between">
                        <span>Minimum stake:</span>
                        <span className="font-mono font-bold">0.01 ETH</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Cooldown period:</span>
                        <span className="font-mono font-bold">24 hours</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Current APY:</span>
                        <span className="font-mono font-bold text-green-600">
                          12.5%
                        </span>
                      </li>
                    </ul>
                  </div>

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
                      I understand there is a{" "}
                      <span className="font-bold">24-hour cooldown period</span>{" "}
                      before unstaking.
                    </span>
                  </label>

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
                        !amount || !isCooldownChecked || parseFloat(amount) <= 0
                      }
                      className="w-full bg-gold hover:bg-gold-hover text-white font-heading font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                      Stake {amount ? amount : ""} Tokens
                    </button>
                  )}

                  {isConnected && (
                    <p className="text-xs text-center mt-3 text-green-600 font-mono">
                      Wallet connected: {account?.substring(0, 6)}...
                      {account?.substring(account.length - 4)}
                    </p>
                  )}
                </div>
              </div>
            </div>

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
                          <th className="pb-4 font-medium">Amount</th>
                          <th className="pb-4 font-medium">Value (USD)</th>
                          <th className="pb-4 font-medium">Status</th>
                          <th className="pb-4 font-medium text-right pr-2">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {stakedAssets.map((asset, idx) => (
                          <tr
                            key={idx}
                            className="group hover:bg-gray-50 transition"
                          >
                            <td className="py-4 pl-2">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs text-gray-600">
                                  {asset.symbol[0]}
                                </div>
                                <span className="font-bold text-primary">
                                  {asset.symbol}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 font-mono">{asset.amount}</td>
                            <td className="py-4 font-mono text-gray-500">
                              ${asset.value.toLocaleString()}
                            </td>
                            <td className="py-4">
                              {asset.status === "Ready" ? (
                                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                                  <Check className="w-3 h-3" /> Ready
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">
                                  <History className="w-3 h-3" />{" "}
                                  {asset.cooldown}h left
                                </span>
                              )}
                            </td>
                            <td className="py-4 text-right pr-2">
                              <button
                                disabled={asset.status !== "Ready"}
                                className="text-sm font-bold text-primary border border-gray-200 px-4 py-2 rounded-lg hover:bg-white hover:border-gold hover:text-gold transition disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                Unstake
                              </button>
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
                      You haven't staked any tokens yet
                    </h3>
                    <p className="text-gray-400 text-sm mb-6">
                      Start staking to earn rewards!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

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
                    <th className="p-4">Date</th>
                    <th className="p-4 rounded-r-lg text-right">Explore</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoading
                    ? [1, 2, 3].map((i) => (
                        <tr key={i}>
                          <td colSpan={5} className="p-4">
                            <Skeleton className="h-6 w-full" />
                          </td>
                        </tr>
                      ))
                    : history.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-blue-50/30 transition"
                        >
                          <td className="p-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                item.action === "Staked"
                                  ? "bg-blue-100 text-blue-700"
                                  : item.action === "Unstaked"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {item.action}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-primary">
                            {item.token}
                          </td>
                          <td className="p-4 font-mono text-gray-600">
                            {item.amount}
                          </td>
                          <td className="p-4 text-gray-500 text-sm">
                            {item.date}
                          </td>
                          <td className="p-4 text-right">
                            <a
                              href="#"
                              className="inline-flex items-center text-gold hover:text-gold-hover transition"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center mt-6">
              <div className="flex gap-2">
                <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:border-gold hover:text-gold transition">
                  1
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-white font-bold">
                  2
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:border-gold hover:text-gold transition">
                  3
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Staking;
