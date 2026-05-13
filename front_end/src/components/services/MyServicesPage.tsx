import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp, BarChart3, Repeat2, CalendarDays, DollarSign,
  Clock, CheckCircle, PauseCircle, XCircle, Loader2, MessageCircle,
  ArrowRight, Lock,
} from "lucide-react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { serviceSubscriptionsApi, ServiceSubscription } from "../../services/blockchainApi";
import { useAuth } from "../../contexts/AuthContext";

const WHATSAPP_NUMBER = "22901441348420";
const WHATSAPP_BASE = `https://wa.me/${WHATSAPP_NUMBER}`;

const SERVICE_META: Record<string, {
  label: string; icon: React.ReactNode; color: string;
  bg: string; bar: string; border: string;
}> = {
  advisory: {
    label: "Golden Advisory",
    icon: <TrendingUp className="w-6 h-6" />,
    color: "text-gold",
    bg: "bg-gold/10",
    bar: "from-gold to-yellow-400",
    border: "border-gold/20",
  },
  copytrading: {
    label: "Golden Copy-Trading",
    icon: <Repeat2 className="w-6 h-6" />,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    bar: "from-blue-400 to-blue-600",
    border: "border-blue-200",
  },
  otc: {
    label: "Golden OTC Desk",
    icon: <BarChart3 className="w-6 h-6" />,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    bar: "from-emerald-400 to-emerald-600",
    border: "border-emerald-200",
  },
};

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  active:  { label: "Actif",      icon: <CheckCircle className="w-4 h-4" />,  color: "text-green-600",  bg: "bg-green-50" },
  paused:  { label: "En pause",   icon: <PauseCircle className="w-4 h-4" />,  color: "text-yellow-600", bg: "bg-yellow-50" },
  ended:   { label: "Terminé",    icon: <XCircle className="w-4 h-4" />,      color: "text-gray-500",   bg: "bg-gray-100" },
};

const ContractProgress = ({ sub }: { sub: ServiceSubscription }) => {
  const start = new Date(sub.contract_start).getTime();
  const end   = sub.contract_end ? new Date(sub.contract_end).getTime() : null;
  const now   = Date.now();

  if (!end) return null;

  const total   = end - start;
  const elapsed = Math.max(0, Math.min(now - start, total));
  const pct     = Math.round((elapsed / total) * 100);

  const daysLeft = Math.max(0, Math.ceil((end - now) / 86400000));

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-gray-500">
        <span>Progression du contrat</span>
        <span className="font-semibold">{pct}% — {daysLeft} j restants</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-gold to-yellow-400 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const SubscriptionCard = ({ sub }: { sub: ServiceSubscription }) => {
  const meta   = SERVICE_META[sub.service] ?? SERVICE_META.advisory;
  const status = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG.active;

  const durationLabel = sub.contract_duration_months >= 12
    ? `${Math.floor(sub.contract_duration_months / 12)} an${Math.floor(sub.contract_duration_months / 12) > 1 ? "s" : ""}`
    : `${sub.contract_duration_months} mois`;

  const expectedGain = (
    parseFloat(sub.investment_amount) * parseFloat(sub.expected_return_rate) / 100
  ).toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className={`bg-white rounded-2xl border ${meta.border} shadow-sm overflow-hidden`}>
      <div className={`h-1 bg-gradient-to-r ${meta.bar}`} />

      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${meta.bg} flex items-center justify-center ${meta.color} shrink-0`}>
              {meta.icon}
            </div>
            <div>
              <h3 className="font-heading font-bold text-primary text-lg leading-tight">{meta.label}</h3>
              <div className={`inline-flex items-center gap-1.5 mt-1 text-xs font-bold px-2.5 py-1 rounded-full ${status.bg} ${status.color}`}>
                {status.icon} {status.label}
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-black text-primary">
              ${parseFloat(sub.investment_amount).toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">Apport</div>
          </div>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className={`${meta.bg} rounded-xl p-3 text-center`}>
            <DollarSign className={`w-4 h-4 mx-auto mb-1 ${meta.color}`} />
            <div className={`text-sm font-black ${meta.color}`}>{sub.expected_return_rate}%</div>
            <div className="text-[10px] text-gray-500 leading-tight">Rendement</div>
          </div>
          <div className={`${meta.bg} rounded-xl p-3 text-center`}>
            <TrendingUp className={`w-4 h-4 mx-auto mb-1 ${meta.color}`} />
            <div className={`text-sm font-black ${meta.color}`}>${expectedGain}</div>
            <div className="text-[10px] text-gray-500 leading-tight">Gain estimé</div>
          </div>
          <div className={`${meta.bg} rounded-xl p-3 text-center`}>
            <Clock className={`w-4 h-4 mx-auto mb-1 ${meta.color}`} />
            <div className={`text-sm font-black ${meta.color}`}>{durationLabel}</div>
            <div className="text-[10px] text-gray-500 leading-tight">Durée</div>
          </div>
        </div>

        {/* Contract dates */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">
            <CalendarDays className="w-3.5 h-3.5" /> Détails du contrat
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <div className="text-gray-400 text-xs">Début</div>
              <div className="font-semibold text-dark">
                {new Date(sub.contract_start).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-xs">Échéance</div>
              <div className="font-semibold text-dark">
                {sub.contract_end
                  ? new Date(sub.contract_end).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
                  : "—"}
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {sub.status === "active" && <ContractProgress sub={sub} />}

        {/* CTA */}
        <a
          href={`${WHATSAPP_BASE}?text=${encodeURIComponent(`Bonjour, je suis client ${meta.label} et j'ai une question concernant mon contrat.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-gray-200 hover:border-primary text-primary font-semibold text-sm transition"
        >
          <MessageCircle className="w-4 h-4" />
          Contacter mon conseiller
        </a>
      </div>
    </div>
  );
};

const MyServicesPage = () => {
  const { user, isLoggedIn, refreshProfile } = useAuth();
  const [subscriptions, setSubscriptions] = useState<ServiceSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    refreshProfile();
    serviceSubscriptionsApi.mine()
      .then(data => setSubscriptions(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  return (
    <div className="bg-gray-50 min-h-screen font-body text-dark">
      <Navbar />

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 text-gold text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-widest mb-4">
              Espace Client
            </div>
            <h1 className="text-3xl font-heading font-bold text-primary">
              Mes Services
            </h1>
            {user && (
              <p className="text-gray-400 text-sm mt-1">
                Bonjour <span className="font-semibold text-dark">{user.first_name || user.username}</span> — voici le suivi de vos contrats actifs.
              </p>
            )}
          </div>

          {/* Not logged in */}
          {!isLoggedIn && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7 text-gray-400" />
              </div>
              <h2 className="text-xl font-heading font-bold text-primary mb-2">Connexion requise</h2>
              <p className="text-gray-500 text-sm mb-6">Connectez-vous pour accéder à votre espace client.</p>
              <Link
                to="/signin"
                className="inline-flex items-center gap-2 bg-gold text-white font-bold px-6 py-3 rounded-xl hover:bg-gold-hover transition shadow-md shadow-gold/20 text-sm"
              >
                Se connecter <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Loading */}
          {isLoggedIn && loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          )}

          {/* No subscriptions */}
          {isLoggedIn && !loading && subscriptions.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-7 h-7 text-gold" />
              </div>
              <h2 className="text-xl font-heading font-bold text-primary mb-2">Aucun service actif</h2>
              <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                Vous n'avez pas encore souscrit à un service GoldenBridge.
                Découvrez nos offres et prenez rendez-vous avec notre équipe.
              </p>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 bg-gold text-white font-bold px-6 py-3 rounded-xl hover:bg-gold-hover transition shadow-md shadow-gold/20 text-sm"
              >
                Découvrir les services <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Subscriptions */}
          {isLoggedIn && !loading && subscriptions.length > 0 && (
            <div className="space-y-6">
              {/* Summary strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
                  <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold shrink-0">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg font-black text-primary">{subscriptions.filter(s => s.status === "active").length}</div>
                    <div className="text-xs text-gray-400">Contrat(s) actif(s)</div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg font-black text-primary">
                      ${subscriptions.reduce((sum, s) => sum + parseFloat(s.investment_amount), 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">Total investi</div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-500 shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg font-black text-primary">
                      ${subscriptions.reduce((sum, s) => sum + parseFloat(s.investment_amount) * parseFloat(s.expected_return_rate) / 100, 0)
                        .toLocaleString("fr-FR", { maximumFractionDigits: 0 })}
                    </div>
                    <div className="text-xs text-gray-400">Gains estimés totaux</div>
                  </div>
                </div>
              </div>

              {/* Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {subscriptions.map(sub => <SubscriptionCard key={sub.id} sub={sub} />)}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MyServicesPage;
