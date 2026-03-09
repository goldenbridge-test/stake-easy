import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { tokenFarmsApi, fundAssetsApi } from "../../services/blockchainApi";
import {
  Coins,
  TrendingUp,
  BarChart3,
  ArrowRight,
  Zap,
  Shield,
  Lock,
  ChevronRight,
  Loader2,
} from "lucide-react";

const WHY_ITEMS = [
  { icon: <Shield className="w-5 h-5" />, title: "Non-custodial", desc: "Vos fonds restent sous votre contrôle à tout moment." },
  { icon: <Zap className="w-5 h-5" />, title: "Rewards automatiques", desc: "Récompenses distribuées directement on-chain." },
  { icon: <Lock className="w-5 h-5" />, title: "Contrats audités", desc: "Smart contracts vérifiés et transparents sur Sepolia." },
];

const EarnHub = () => {
  const [farms, setFarms] = useState<any[]>([]);
  const [fundAssets, setFundAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      tokenFarmsApi.list().catch(() => ({ results: [] })),
      fundAssetsApi.list().catch(() => ({ results: [] })),
    ]).then(([farmsData, fundsData]) => {
      setFarms(farmsData.results || farmsData || []);
      setFundAssets(fundsData.results || fundsData || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen font-body text-dark">
      <Navbar />

      {/* Hero */}
      <div className="bg-white border-b border-gray-100 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 text-gold text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest mb-6">
              <Coins className="w-3.5 h-3.5" /> Golden Earn
            </div>
            <h1 className="text-5xl font-heading font-bold text-primary mb-5 leading-tight">
              Faites travailler<br />
              <span className="text-gold">vos actifs</span>
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed mb-8">
              Staking, Liquidity Pools, Fonds on-chain — tous vos produits de rendement DeFi au même endroit.
            </p>
            <div className="flex items-center gap-4">
              <Link
                to="/earn/staking"
                className="inline-flex items-center gap-2 bg-gold text-primary font-bold px-6 py-3 rounded-xl hover:bg-gold-hover transition shadow-lg shadow-gold/20"
              >
                Commencer à staker <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/earn/dashboard"
                className="inline-flex items-center gap-2 border border-gray-200 bg-white text-primary font-bold px-6 py-3 rounded-xl hover:border-gold transition text-sm"
              >
                Mon Dashboard
              </Link>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Live sur Sepolia
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 space-y-16">

        {/* ── Staking Farms (dynamique depuis API) ── */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-heading font-bold text-primary">Staking</h2>
              <p className="text-sm text-gray-400 mt-1">Stakez vos tokens et percevez des récompenses</p>
            </div>
            {!loading && (
              <span className="text-sm text-gray-400">
                {farms.length > 0 ? `${farms.length} farm${farms.length > 1 ? 's' : ''} actif${farms.length > 1 ? 's' : ''}` : 'Chargement...'}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-gold animate-spin" />
            </div>
          ) : farms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {farms.map((farm: any) => (
                <FarmCard key={farm.id} farm={farm} />
              ))}
            </div>
          ) : (
            /* Fallback statique si l'API ne retourne rien encore */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StaticFarmCard />
            </div>
          )}
        </section>

        {/* ── Fonds d'investissement (dynamique) ── */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-heading font-bold text-primary">Fonds & Pools</h2>
              <p className="text-sm text-gray-400 mt-1">Investissez dans des fonds gérés on-chain</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Fonds actifs depuis API */}
            {fundAssets.filter((f: any) => f.is_investment_enabled).map((fund: any) => (
              <FundCard key={fund.id} fund={fund} />
            ))}

            {/* Placeholders "Coming Soon" pour futures pools */}
            <ComingSoonCard
              icon={<TrendingUp className="w-7 h-7" />}
              iconBg="bg-blue-100 text-blue-600"
              title="Liquidity Pools"
              desc="Fournissez de la liquidité et génèrez des revenus passifs sur chaque transaction."
              apy="~18%"
              eta="Q3 2025"
            />
            <ComingSoonCard
              icon={<BarChart3 className="w-7 h-7" />}
              iconBg="bg-purple-100 text-purple-600"
              title="Golden Funds"
              desc="Fonds diversifiés gérés par notre équipe, transparents et on-chain."
              apy="~25%"
              eta="Q4 2025"
            />
          </div>
        </section>
      </div>

      {/* Pourquoi Golden Earn */}
      <div className="border-t border-gray-100 bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-heading font-bold text-primary mb-10 text-center">Pourquoi Golden Earn ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {WHY_ITEMS.map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-bold text-primary mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

// ── Card pour un Farm venant de l'API ──────────────────────────────────────────
const FarmCard = ({ farm }: { farm: any }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-gold/40 hover:shadow-md transition-all flex flex-col overflow-hidden">
    <div className="h-1 w-full bg-gradient-to-r from-gold to-gold-hover" />
    <div className="p-6 flex flex-col flex-1">
      <div className="flex items-start justify-between mb-5">
        <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
          <Coins className="w-6 h-6" />
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${farm.is_verified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {farm.is_verified ? 'Vérifié' : 'Non vérifié'}
        </span>
      </div>
      <h3 className="text-lg font-heading font-bold text-primary mb-1">{farm.name}</h3>
      {farm.description && <p className="text-sm text-gray-500 mb-5 flex-1">{farm.description}</p>}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className="font-bold text-sm text-green-600">{farm.apr}%</div>
          <div className="text-[10px] text-gray-400 uppercase font-black mt-0.5">APR</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className="font-bold text-sm text-gold">{farm.token?.symbol || 'GLD'}</div>
          <div className="text-[10px] text-gray-400 uppercase font-black mt-0.5">Token</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className="font-bold text-sm text-primary truncate text-xs">{parseFloat(farm.total_staked || 0).toFixed(0)}</div>
          <div className="text-[10px] text-gray-400 uppercase font-black mt-0.5">Staké</div>
        </div>
      </div>
      <Link
        to="/earn/staking"
        className="w-full bg-primary text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-dark transition text-sm"
      >
        Staker <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  </div>
);

// ── Card statique fallback (GLD Staking) ──────────────────────────────────────
const StaticFarmCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-gold/40 hover:shadow-md transition-all flex flex-col overflow-hidden">
    <div className="h-1 w-full bg-gradient-to-r from-gold to-gold-hover" />
    <div className="p-6 flex flex-col flex-1">
      <div className="flex items-start justify-between mb-5">
        <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
          <Coins className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-green-100 text-green-700">Live</span>
      </div>
      <h3 className="text-lg font-heading font-bold text-primary mb-1">GLD Staking</h3>
      <p className="text-sm text-gray-500 mb-5 flex-1">Stakez vos tokens GLD et percevez des récompenses automatiques.</p>
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className="font-bold text-sm text-green-600">12.5%</div>
          <div className="text-[10px] text-gray-400 uppercase font-black mt-0.5">APY</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className="font-bold text-sm text-gold">GLD</div>
          <div className="text-[10px] text-gray-400 uppercase font-black mt-0.5">Token</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className="font-bold text-sm text-primary">Sepolia</div>
          <div className="text-[10px] text-gray-400 uppercase font-black mt-0.5">Réseau</div>
        </div>
      </div>
      <Link to="/earn/staking" className="w-full bg-primary text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-dark transition text-sm">
        Staker <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  </div>
);

// ── Card pour un Fund actif depuis l'API ──────────────────────────────────────
const FundCard = ({ fund }: { fund: any }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-gold/40 hover:shadow-md transition-all flex flex-col overflow-hidden">
    <div className="h-1 w-full bg-gradient-to-r from-purple-400 to-blue-500" />
    <div className="p-6 flex flex-col flex-1">
      <div className="flex items-start justify-between mb-5">
        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
          <BarChart3 className="w-6 h-6" />
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${fund.compliance_status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {fund.compliance_status}
        </span>
      </div>
      <h3 className="text-lg font-heading font-bold text-primary mb-1">{fund.name}</h3>
      <div className="grid grid-cols-2 gap-2 mb-5 mt-4">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className="font-bold text-sm text-purple-600">{fund.symbol}</div>
          <div className="text-[10px] text-gray-400 uppercase font-black mt-0.5">Asset</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className="font-bold text-sm text-primary">{fund.max_fund_allocation_percentage}%</div>
          <div className="text-[10px] text-gray-400 uppercase font-black mt-0.5">Alloc. max</div>
        </div>
      </div>
      <button disabled className="w-full bg-gray-100 text-gray-400 font-bold py-3 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed text-sm">
        <Lock className="w-4 h-4" /> Bientôt disponible
      </button>
    </div>
  </div>
);

// ── Card "Coming Soon" ────────────────────────────────────────────────────────
const ComingSoonCard = ({ icon, iconBg, title, desc, apy, eta }: {
  icon: React.ReactNode; iconBg: string; title: string;
  desc: string; apy: string; eta: string;
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden opacity-70">
    <div className="h-1 w-full bg-gray-100" />
    <div className="p-6 flex flex-col flex-1">
      <div className="flex items-start justify-between mb-5">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>{icon}</div>
        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">Bientôt</span>
      </div>
      <h3 className="text-lg font-heading font-bold text-primary mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-5 flex-1">{desc}</p>
      <div className="grid grid-cols-2 gap-2 mb-5">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className="font-bold text-sm text-gray-400">{apy}</div>
          <div className="text-[10px] text-gray-400 uppercase font-black mt-0.5">APY est.</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className="font-bold text-sm text-gray-400">{eta}</div>
          <div className="text-[10px] text-gray-400 uppercase font-black mt-0.5">Lancement</div>
        </div>
      </div>
      <button disabled className="w-full bg-gray-100 text-gray-400 font-bold py-3 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed text-sm">
        <Lock className="w-4 h-4" /> Disponible prochainement
      </button>
    </div>
  </div>
);

export default EarnHub;
