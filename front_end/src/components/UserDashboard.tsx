import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Briefcase,
  Gift,
  ArrowRight,
  ExternalLink,
  Clock,
  Wallet,
  ChevronRight,
  BarChart3,
  Coins,
  Rocket,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useWeb3 } from "../hooks/useWeb3";

// --- MOCK DATA ---
const performanceData = [
  { date: "Mon", value: 24000 },
  { date: "Tue", value: 24200 },
  { date: "Wed", value: 23800 },
  { date: "Thu", value: 24500 },
  { date: "Fri", value: 24100 },
  { date: "Sat", value: 24800 },
  { date: "Sun", value: 25200 },
];

const stakedAssets = [
  { id: 1, symbol: "ETH", amount: 3.5, value: 7245, apy: 12.5 },
  { id: 2, symbol: "WBTC", amount: 0.15, value: 5095, apy: 8.2 },
  { id: 3, symbol: "USDT", amount: 2500, value: 2500, apy: 5.0 },
];

const investments = [
  {
    id: 1,
    name: "Tech Startup A",
    invested: "2.5 ETH",
    roi: "+20%",
    progress: 75,
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&q=80",
  },
  {
    id: 2,
    name: "Agri Project",
    invested: "1 ETH",
    roi: "+15%",
    progress: 40,
    image:
      "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?w=400&q=80",
  },
  {
    id: 3,
    name: "FinTech Co",
    invested: "3 ETH",
    roi: "+25%",
    progress: 90,
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?w=400&q=80",
  },
  {
    id: 4,
    name: "Green Energy",
    invested: "0.5 ETH",
    roi: "+10%",
    progress: 20,
    image:
      "https://images.unsplash.com/photo-1497435334941-8c899ee7e8e9?w=400&q=80",
  },
];

const activities = [
  {
    id: 1,
    type: "stake",
    text: "Staked 1.5 ETH",
    time: "2h ago",
    hash: "0x123...",
  },
  {
    id: 2,
    type: "invest",
    text: "Invested in TechCo",
    time: "1 day ago",
    hash: "0x456...",
  },
  {
    id: 3,
    type: "claim",
    text: "Claimed 125 DAPP",
    time: "3 days ago",
    hash: "0x789...",
  },
  {
    id: 4,
    type: "unstake",
    text: "Unstaked 0.5 WBTC",
    time: "1 week ago",
    hash: "0xabc...",
  },
];

const UserDashboard = () => {
  const { account, isConnected, connectWallet } = useWeb3();
  const [isLoading, setIsLoading] = useState(true);

  // Simulation chargement
  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1500);
  }, []);

  // --- HELPER: FORMAT ADDRESS ---
  const formatAddress = (addr: string | null) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "Guest";

  // --- HELPER: DATE ACTUELLE ---
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // --- SKELETON LOADER ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-300 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-gray-300 rounded mb-2"></div>
          <div className="h-3 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // --- VUE PRINCIPALE ---
  return (
    <div className="bg-gray-50 min-h-screen font-body text-dark flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
          {/* BONUS: TOP BAR */}
          <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gold to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {account ? "👤" : "G"}
              </div>
              <div>
                <h2 className="font-heading font-bold text-primary">
                  Welcome back, {formatAddress(account)}!
                </h2>
                <p className="text-xs text-gray-400">{today}</p>
              </div>
            </div>
            {!isConnected && (
              <button
                onClick={connectWallet}
                className="mt-3 md:mt-0 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-blue-900 transition"
              >
                Connect Wallet to view data
              </button>
            )}
            {isConnected && (
              <span className="mt-3 md:mt-0 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">
                ● Ethereum Mainnet
              </span>
            )}
          </div>

          {/* SECTION 1: HERO PORTFOLIO (Glassmorphism) */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-blue-900 shadow-xl text-white p-8 md:p-10">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative z-10 text-center">
              <h3 className="text-blue-200 text-sm uppercase tracking-widest font-bold mb-2">
                Total Portfolio Value
              </h3>
              <div className="text-4xl md:text-6xl font-heading font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                $24,567.89
              </div>

              <div className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-sm border border-white/20 mb-8">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-green-300 font-bold">+12.5%</span>
                <span className="text-gray-300 ml-1">(24h)</span>
              </div>

              <div className="grid grid-cols-3 gap-4 md:gap-12 max-w-2xl mx-auto border-t border-white/10 pt-6">
                <div>
                  <p className="text-blue-200 text-xs mb-1 flex justify-center gap-1">
                    <Coins className="w-3 h-3" /> Staked
                  </p>
                  <p className="font-mono font-bold text-lg">$15,200</p>
                </div>
                <div>
                  <p className="text-blue-200 text-xs mb-1 flex justify-center gap-1">
                    <Briefcase className="w-3 h-3" /> In Projects
                  </p>
                  <p className="font-mono font-bold text-lg">$8,500</p>
                </div>
                <div>
                  <p className="text-blue-200 text-xs mb-1 flex justify-center gap-1">
                    <Gift className="w-3 h-3" /> Rewards
                  </p>
                  <p className="font-mono font-bold text-lg text-gold">$867</p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: QUICK STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Staked"
              value="$15,200"
              sub="3 tokens staked"
              icon={<TrendingUp />}
              color="border-l-blue-500"
              btnLink="/staking"
              btnText="Manage"
            />
            <StatCard
              title="Active Projects"
              value="$8,500"
              sub="2 active investments"
              icon={<Briefcase />}
              color="border-l-gold"
              btnLink="/projects"
              btnText="Explore"
            />
            <StatCard
              title="Claimable Rewards"
              value="867 DAPP"
              sub="≈ $867.00"
              icon={<Gift />}
              color="border-l-green-500"
              btnLink="/rewards"
              btnText="Claim"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* SECTION 3: STAKED ASSETS (2/3 width) */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-heading font-bold text-lg text-primary flex items-center gap-2">
                  <Coins className="w-5 h-5 text-gold" /> Your Staked Assets
                </h3>
                <Link
                  to="/staking"
                  className="text-sm text-gold hover:underline flex items-center gap-1 font-bold"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Token</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Value</th>
                      <th className="px-4 py-3">APY</th>
                      <th className="px-4 py-3 rounded-r-lg text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stakedAssets.map((asset) => (
                      <tr
                        key={asset.id}
                        className="hover:bg-blue-50/50 transition"
                      >
                        <td className="px-4 py-3 font-bold text-primary flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-[10px]">
                            {asset.symbol[0]}
                          </div>
                          {asset.symbol}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm">
                          {asset.amount}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm text-gray-500">
                          ${asset.value}
                        </td>
                        <td className="px-4 py-3 text-green-600 font-bold text-sm">
                          {asset.apy}%
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="text-gray-400 hover:text-gold transition">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION 5: RECENT ACTIVITY (1/3 width - Timeline) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-heading font-bold text-lg text-primary mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gold" /> Recent Activity
              </h3>
              <div className="space-y-6">
                {activities.map((act, i) => (
                  <div
                    key={act.id}
                    className="relative pl-6 border-l-2 border-gray-100 last:border-0"
                  >
                    {/* Dot */}
                    <div
                      className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ${
                        act.type === "stake"
                          ? "bg-green-500"
                          : act.type === "invest"
                          ? "bg-gold"
                          : act.type === "claim"
                          ? "bg-blue-500"
                          : "bg-red-400"
                      }`}
                    ></div>

                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-gray-700">
                          {act.text}
                        </p>
                        <p className="text-xs text-gray-400">{act.time}</p>
                      </div>
                      <a
                        href="#"
                        className="text-gray-300 hover:text-gold transition"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 text-center text-sm text-gray-500 hover:text-primary font-medium border-t border-gray-100 pt-4">
                View All Transactions
              </button>
            </div>
          </div>

          {/* SECTION 4: ACTIVE INVESTMENTS (Horizontal Scroll) */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h3 className="font-heading font-bold text-xl text-primary flex items-center gap-2">
                <Rocket className="w-6 h-6 text-gold" /> Active Investments
              </h3>
              <Link
                to="/projects"
                className="text-sm text-gold hover:underline font-bold"
              >
                View All →
              </Link>
            </div>

            {/* Scroll Container */}
            <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x">
              {investments.map((project) => (
                <div
                  key={project.id}
                  className="min-w-[280px] md:min-w-[320px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 snap-start group cursor-pointer"
                >
                  {/* Image */}
                  <div className="h-32 bg-gray-200 relative">
                    <img
                      src={project.image}
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-green-600 shadow-sm">
                      {project.roi} ROI
                    </div>
                  </div>
                  {/* Content */}
                  <div className="p-5">
                    <h4 className="font-bold text-primary mb-1">
                      {project.name}
                    </h4>
                    <div className="flex justify-between text-xs text-gray-500 mb-3">
                      <span>
                        Invested:{" "}
                        <span className="font-mono text-dark font-bold">
                          {project.invested}
                        </span>
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                      <div
                        className="bg-gold h-1.5 rounded-full"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-right text-[10px] text-gray-400">
                      {project.progress}% Funded
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 6: CHART (Recharts) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <div>
                <h3 className="font-heading font-bold text-lg text-primary flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-gold" /> Portfolio
                  Performance
                </h3>
                <p className="text-xs text-gray-400">Evolution over time</p>
              </div>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                {["1W", "1M", "3M", "1Y", "ALL"].map((period, idx) => (
                  <button
                    key={period}
                    className={`px-4 py-1 text-xs font-bold rounded-md transition ${
                      idx === 0
                        ? "bg-white shadow text-primary"
                        : "text-gray-500 hover:text-dark"
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FACC15" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FACC15" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#9CA3AF" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#9CA3AF" }}
                    tickFormatter={(val: number) => `$${val / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    itemStyle={{ color: "#1E3A8A", fontWeight: "bold" }}
                    formatter={(value: any) => [`$${value}`, "Value"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#FACC15"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SECTION 7: QUICK ACTIONS (Grid 4) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionBtn
              title="Stake Tokens"
              icon={<TrendingUp />}
              to="/staking"
              color="bg-blue-50 text-blue-600 hover:bg-blue-100"
            />
            <QuickActionBtn
              title="Browse Projects"
              icon={<Rocket />}
              to="/projects"
              color="bg-orange-50 text-orange-600 hover:bg-orange-100"
            />
            <QuickActionBtn
              title="Claim Rewards"
              icon={<Gift />}
              to="/rewards"
              color="bg-green-50 text-green-600 hover:bg-green-100"
            />
            <QuickActionBtn
              title="History"
              icon={<Clock />}
              to="/history"
              color="bg-gray-100 text-gray-600 hover:bg-gray-200"
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// --- SUB-COMPONENTS ---

const StatCard = ({
  title,
  value,
  sub,
  icon,
  color,
  btnLink,
  btnText,
}: any) => (
  <div
    className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 ${color} hover:shadow-md transition duration-300`}
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-gray-50 rounded-full text-primary">{icon}</div>
      <Link
        to={btnLink}
        className="text-xs font-bold text-gray-400 hover:text-gold flex items-center gap-1 transition"
      >
        {btnText} <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
    <p className="text-gray-500 text-xs font-bold uppercase mb-1">{title}</p>
    <h3 className="text-2xl font-heading font-bold text-primary mb-1">
      {value}
    </h3>
    <p className="text-xs text-gray-400">{sub}</p>
  </div>
);

const QuickActionBtn = ({ title, icon, to, color }: any) => (
  <Link
    to={to}
    className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl transition transform hover:scale-105 ${color}`}
  >
    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
      {React.cloneElement(icon, { className: "w-5 h-5" })}
    </div>
    <span className="font-bold text-sm">{title}</span>
  </Link>
);

export default UserDashboard;
