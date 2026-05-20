import { useState } from "react";
import {
  ArrowRight, X, MessageCircle, TrendingUp, BarChart3, Repeat2,
  Shield, CheckCircle, ChevronRight, Zap, Lock, Users, Loader2, PhoneCall,
} from "lucide-react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { serviceInquiriesApi, ServiceType } from "../../services/blockchainApi";

const WHATSAPP_NUMBER = "22901441348420";
const WHATSAPP_BASE = `https://wa.me/${WHATSAPP_NUMBER}`;

interface Service {
  id: ServiceType;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  barClass: string;
  features: string[];
  highlights: { icon: React.ReactNode; label: string; value: string }[];
  ctaLabel: string;
  waMessage: string;
}

const services: Service[] = [
  {
    id: "advisory",
    badge: "Wealth Management",
    title: "Golden Advisory",
    subtitle: "Personalized Investment Strategy",
    description:
      "Expert-led advisory service tailored to your financial goals. Our analysts build and manage diversified portfolios combining crypto assets, DeFi yields, and traditional instruments.",
    icon: <TrendingUp className="w-7 h-7" />,
    color: "text-gold",
    bgColor: "bg-gold/10",
    borderColor: "border-gold/20",
    barClass: "from-gold to-yellow-400",
    features: [
      "Dedicated financial advisor",
      "Custom portfolio construction",
      "Weekly performance reports",
      "Risk profiling & rebalancing",
      "Market intelligence briefings",
    ],
    highlights: [
      { icon: <BarChart3 className="w-4 h-4" />, label: "Avg. Annual Return", value: "12–18%" },
      { icon: <Shield className="w-4 h-4" />, label: "Min. Allocation", value: "$5,000" },
      { icon: <Users className="w-4 h-4" />, label: "Active Clients", value: "200+" },
    ],
    ctaLabel: "Schedule a Consultation",
    waMessage: "Hello, I'm interested in the Golden Advisory service. I'd like to schedule a consultation.",
  },
  {
    id: "copytrading",
    badge: "Automated Trading",
    title: "Golden Copy-Trading",
    subtitle: "Mirror Top Traders Automatically",
    description:
      "Effortlessly replicate the strategies of GoldenBridge's top-performing traders in real time. Set your allocation, choose your risk level, and let the platform do the rest.",
    icon: <Repeat2 className="w-7 h-7" />,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    barClass: "from-blue-400 to-blue-600",
    features: [
      "Real-time trade mirroring",
      "Curated trader leaderboard",
      "Adjustable risk parameters",
      "Stop-loss & take-profit automation",
      "Full transparency on all trades",
    ],
    highlights: [
      { icon: <Zap className="w-4 h-4" />, label: "Execution Speed", value: "<200ms" },
      { icon: <TrendingUp className="w-4 h-4" />, label: "Top Trader ROI", value: "up to 40%" },
      { icon: <Lock className="w-4 h-4" />, label: "Min. Allocation", value: "$1,000" },
    ],
    ctaLabel: "Start Copy-Trading",
    waMessage: "Hello, I want to learn more about the Golden Copy-Trading service and get started.",
  },
  {
    id: "otc",
    badge: "OTC Services",
    title: "Golden OTC Desk",
    subtitle: "Large Volume Crypto Transactions",
    description:
      "Execute significant crypto transactions privately, securely, and at competitive rates — without slippage or market impact. Ideal for institutions, HNWIs, and businesses.",
    icon: <BarChart3 className="w-7 h-7" />,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    barClass: "from-emerald-400 to-emerald-600",
    features: [
      "BTC, ETH, USDT & major altcoins",
      "Preferential rates on large volumes",
      "Zero slippage guaranteed",
      "KYC-compliant settlement",
      "24/7 dedicated OTC support",
    ],
    highlights: [
      { icon: <Shield className="w-4 h-4" />, label: "Min. Transaction", value: "$50,000" },
      { icon: <Zap className="w-4 h-4" />, label: "Settlement Time", value: "< 1 hour" },
      { icon: <Lock className="w-4 h-4" />, label: "Counterparty Risk", value: "None" },
    ],
    ctaLabel: "Contact OTC Desk",
    waMessage: "Hello, I'm interested in the Golden OTC Desk for a large volume transaction. Please contact me.",
  },
];

// ── Contact Form Modal ─────────────────────────────────────────────────────────
const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 bg-white cursor-pointer";
const labelCls = "block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5";

const ContactModal = ({
  service,
  onClose,
}: {
  service: Service;
  onClose: () => void;
}) => {
  const [base, setBase] = useState({ full_name: "", email: "", phone: "", profile_type: "" });
  const [otc,  setOtc]  = useState({ source_asset: "", target_asset: "", amount: "", timeline: "" });
  const [inv,  setInv]  = useState({ crypto_level: "" });
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [saved,   setSaved]   = useState(false);

  const isOtc    = service.id === "otc";
  const isAdvCpy = service.id === "advisory" || service.id === "copytrading";

  const buildMessage = () => {
    if (isOtc) {
      return `Bonjour, je souhaite convertir ${otc.amount} ${otc.source_asset} en ${otc.target_asset} — délai : ${otc.timeline}. Profil : ${base.profile_type === "company" ? "Entreprise" : "Particulier"} | Nom : ${base.full_name} | Tél : ${base.phone}`;
    }
    return `Bonjour, intéressé(e) par ${service.title}. Profil : ${base.profile_type === "company" ? "Entreprise" : "Particulier"} | Niveau crypto : ${inv.crypto_level}. Nom : ${base.full_name} | Tél : ${base.phone}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const extra_data = isOtc ? otc : inv;
    try {
      await serviceInquiriesApi.create({ service: service.id, ...base, message: buildMessage(), extra_data });
      setSaved(true);
    } catch {
      setSaved(false);
    } finally {
      setLoading(false);
    }
    setDone(true);
    setTimeout(() => {
      window.open(`${WHATSAPP_BASE}?text=${encodeURIComponent(buildMessage())}`, "_blank");
      onClose();
    }, 1500);
  };

  const btnCls = `w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition cursor-pointer disabled:opacity-60
    ${service.id === "advisory"    ? "bg-gold hover:bg-gold-hover text-white shadow-md shadow-gold/20"
    : service.id === "copytrading" ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/20"
    : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20"}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`h-1 w-full bg-gradient-to-r ${service.barClass}`} />
        <div className="px-7 pt-6 pb-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${service.bgColor} flex items-center justify-center ${service.color}`}>
              {service.icon}
            </div>
            <div>
              <p className={`text-xs font-black uppercase tracking-widest ${service.color}`}>{service.badge}</p>
              <h2 className="text-base font-heading font-bold text-primary">{service.title}</h2>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {done ? (
          <div className="px-7 py-10 text-center">
            <div className={`w-16 h-16 ${saved ? "bg-green-50" : "bg-yellow-50"} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <CheckCircle className={`w-8 h-8 ${saved ? "text-green-500" : "text-yellow-500"}`} />
            </div>
            <h3 className="font-heading font-bold text-primary text-lg mb-2">
              {saved ? "Demande enregistrée !" : "Redirection en cours…"}
            </h3>
            <p className="text-gray-500 text-sm">
              {saved
                ? "Votre demande a bien été enregistrée. Redirection vers WhatsApp…"
                : "Backend indisponible. Vous serez quand même redirigé vers WhatsApp."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-7 py-6 space-y-5">
            <p className="text-sm text-gray-500">Remplissez ce formulaire — notre équipe vous contactera sous 48h puis vous serez redirigé vers WhatsApp.</p>

            {/* Champs communs */}
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Vos coordonnées</p>
              <div>
                <label className={labelCls}>Nom complet *</label>
                <input required value={base.full_name} onChange={e => setBase({ ...base, full_name: e.target.value })} placeholder="Honorine GABIAM" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Email *</label>
                  <input required type="email" value={base.email} onChange={e => setBase({ ...base, email: e.target.value })} placeholder="vous@email.com" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Téléphone *</label>
                  <input required value={base.phone} onChange={e => setBase({ ...base, phone: e.target.value })} placeholder="+229 96 00 00 00" className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Vous êtes *</label>
                <select required value={base.profile_type} onChange={e => setBase({ ...base, profile_type: e.target.value })} className={inputCls}>
                  <option value="">-- Sélectionner --</option>
                  <option value="individual">Particulier</option>
                  <option value="company">Entreprise</option>
                </select>
              </div>
            </div>

            {/* Champs OTC */}
            {isOtc && (
              <div className="space-y-3 border-t border-gray-100 pt-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Détails de la transaction</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>J'ai (actif source) *</label>
                    <select required value={otc.source_asset} onChange={e => setOtc({ ...otc, source_asset: e.target.value })} className={inputCls}>
                      <option value="">--</option>
                      <option value="XOF">Francs CFA (XOF)</option>
                      <option value="USDT">USDT</option>
                      <option value="USDC">USDC</option>
                      <option value="BTC">BTC</option>
                      <option value="ETH">ETH</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Je veux (actif cible) *</label>
                    <select required value={otc.target_asset} onChange={e => setOtc({ ...otc, target_asset: e.target.value })} className={inputCls}>
                      <option value="">--</option>
                      <option value="XOF">Francs CFA (XOF)</option>
                      <option value="USDT">USDT</option>
                      <option value="USDC">USDC</option>
                      <option value="BTC">BTC</option>
                      <option value="ETH">ETH</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Montant à convertir *</label>
                  <input required type="number" min="0" value={otc.amount} onChange={e => setOtc({ ...otc, amount: e.target.value })} placeholder="ex: 500 000" className={inputCls} />
                  <p className="text-[10px] text-gray-400 mt-1">Indiquez le montant dans la devise source. GoldenBridge vous proposera le meilleur prix disponible.</p>
                </div>
                <div>
                  <label className={labelCls}>Délai souhaité *</label>
                  <select required value={otc.timeline} onChange={e => setOtc({ ...otc, timeline: e.target.value })} className={inputCls}>
                    <option value="">--</option>
                    <option value="asap">Dès que possible</option>
                    <option value="1week">Dans la semaine</option>
                    <option value="1month">Dans le mois</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>
            )}

            {/* Champs Advisory / Copy-Trading */}
            {isAdvCpy && (
              <div className="space-y-3 border-t border-gray-100 pt-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Votre profil investisseur</p>
                <div>
                  <label className={labelCls}>Niveau en crypto *</label>
                  <select required value={inv.crypto_level} onChange={e => setInv({ crypto_level: e.target.value })} className={inputCls}>
                    <option value="">--</option>
                    <option value="beginner">Débutant — je découvre</option>
                    <option value="intermediate">Intermédiaire — j'ai déjà investi</option>
                    <option value="advanced">Avancé — je suis actif sur les marchés</option>
                  </select>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className={btnCls}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PhoneCall className="w-4 h-4" />}
              {loading ? "Envoi en cours…" : "Envoyer & continuer sur WhatsApp"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

// ── Service Detail Modal ───────────────────────────────────────────────────────
const ServiceModal = ({
  service,
  onContact,
  onClose,
}: {
  service: Service;
  onContact: () => void;
  onClose: () => void;
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className={`h-1 w-full bg-gradient-to-r ${service.barClass}`} />
      <div className="relative p-8 pb-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition"
        >
          <X className="w-4 h-4" />
        </button>
        <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${service.bgColor} ${service.color} mb-3`}>
          {service.badge}
        </span>
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-14 h-14 rounded-2xl ${service.bgColor} flex items-center justify-center ${service.color}`}>
            {service.icon}
          </div>
          <div>
            <h2 className="text-2xl font-heading font-bold text-primary">{service.title}</h2>
            <p className={`text-sm font-semibold ${service.color}`}>{service.subtitle}</p>
          </div>
        </div>
        <p className="text-gray-500 text-sm leading-relaxed">{service.description}</p>
      </div>

      <div className="border-t border-gray-100 px-8 py-6 space-y-6">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Key Figures</p>
          <div className="grid grid-cols-3 gap-3">
            {service.highlights.map((h) => (
              <div key={h.label} className={`${service.bgColor} rounded-xl p-4 text-center`}>
                <div className={`flex justify-center mb-1.5 ${service.color}`}>{h.icon}</div>
                <div className={`text-base font-black ${service.color}`}>{h.value}</div>
                <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">{h.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">What's Included</p>
          <ul className="space-y-2.5">
            {service.features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                <div className={`w-5 h-5 rounded-full ${service.bgColor} flex items-center justify-center shrink-0`}>
                  <CheckCircle className={`w-3 h-3 ${service.color}`} />
                </div>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={() => { onClose(); onContact(); }}
          className={`flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold text-sm transition
            ${service.id === "advisory"    ? "bg-gold hover:bg-gold-hover text-white shadow-lg shadow-gold/20"
            : service.id === "copytrading" ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20"
            : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"}`}
        >
          <MessageCircle className="w-4 h-4" />
          {service.ctaLabel}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);

// ── Service Card ───────────────────────────────────────────────────────────────
const ServiceCard = ({
  service,
  onContact,
  onLearnMore,
}: {
  service: Service;
  onContact: () => void;
  onLearnMore: () => void;
}) => (
  <div className={`bg-white rounded-3xl border ${service.borderColor} shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col`}>
    <div className={`h-1 w-full bg-gradient-to-r ${service.barClass}`} />
    <div className="p-8 flex flex-col flex-1">
      <div className="flex items-start justify-between mb-6">
        <div>
          <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${service.bgColor} ${service.color} mb-3`}>
            {service.badge}
          </span>
          <h3 className="text-2xl font-heading font-bold text-primary">{service.title}</h3>
          <p className={`text-sm font-semibold mt-0.5 ${service.color}`}>{service.subtitle}</p>
        </div>
        <div className={`w-14 h-14 rounded-2xl ${service.bgColor} flex items-center justify-center ${service.color} shrink-0`}>
          {service.icon}
        </div>
      </div>
      <p className="text-gray-500 text-sm leading-relaxed mb-6">{service.description}</p>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {service.highlights.map((h) => (
          <div key={h.label} className={`${service.bgColor} rounded-xl p-3 text-center`}>
            <div className={`flex justify-center mb-1 ${service.color}`}>{h.icon}</div>
            <div className={`text-sm font-black ${service.color}`}>{h.value}</div>
            <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">{h.label}</div>
          </div>
        ))}
      </div>
      <ul className="space-y-2 mb-8 flex-1">
        {service.features.map((f) => (
          <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
            <CheckCircle className={`w-4 h-4 shrink-0 ${service.color}`} />
            {f}
          </li>
        ))}
      </ul>
      <div className="flex gap-3 mt-auto">
        <button
          onClick={onContact}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition
            ${service.id === "advisory"    ? "bg-gold hover:bg-gold-hover text-white shadow-md shadow-gold/20"
            : service.id === "copytrading" ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/20"
            : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20"}`}
        >
          <MessageCircle className="w-4 h-4" />
          {service.ctaLabel}
        </button>
        <button
          onClick={onLearnMore}
          className="px-4 py-3 rounded-xl border border-gray-200 text-gray-500 hover:border-primary hover:text-primary font-semibold text-sm transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);

// ── Page ───────────────────────────────────────────────────────────────────────
const ServicesPage = () => {
  const [detailService, setDetailService]   = useState<Service | null>(null);
  const [contactService, setContactService] = useState<Service | null>(null);

  return (
    <div className="bg-gray-50 min-h-screen font-body text-dark">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 text-gold text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-widest mb-5">
            GoldenBridge Services
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-5 leading-tight">
            Premium Financial Services<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-500">
              Built for Growth
            </span>
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
            From personalized advisory to automated trading and large-volume OTC transactions —
            GoldenBridge offers a full suite of professional financial services tailored to your ambitions.
          </p>
        </div>
      </section>

      {/* Cards */}
      <section className="pb-24 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onContact={() => setContactService(service)}
              onLearnMore={() => setDetailService(service)}
            />
          ))}
        </div>
      </section>

      {/* Contact strip */}
      <section className="pb-20 px-6">
        <div className="max-w-3xl mx-auto bg-primary rounded-3xl p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
          <p className="text-[10px] font-black uppercase tracking-widest text-gold/70 mb-3">Have a question?</p>
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-4">
            Talk to our team directly
          </h2>
          <p className="text-white/60 text-sm mb-8 max-w-md mx-auto">
            Our advisors are available via WhatsApp to guide you through the right service for your profile.
          </p>
          <a
            href={`${WHATSAPP_BASE}?text=${encodeURIComponent("Hello, I'd like to learn more about GoldenBridge services.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gold hover:bg-gold-hover text-white font-bold px-8 py-3.5 rounded-xl transition shadow-lg shadow-gold/20 text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp: +229 01 44 13 48 42
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      <Footer />

      {/* Detail modal */}
      {detailService && (
        <ServiceModal
          service={detailService}
          onContact={() => { setDetailService(null); setContactService(detailService); }}
          onClose={() => setDetailService(null)}
        />
      )}

      {/* Contact form modal */}
      {contactService && (
        <ContactModal
          service={contactService}
          onClose={() => setContactService(null)}
        />
      )}
    </div>
  );
};

export default ServicesPage;
