import { useState } from "react";
import { ArrowRight, X, MessageCircle, TrendingUp, BarChart3, Repeat2, Shield, CheckCircle, ChevronRight, Zap, Lock, Users } from "lucide-react";
import Navbar from "../Navbar";
import Footer from "../Footer";

const WHATSAPP_NUMBER = "22901441348420";
const WHATSAPP_BASE = `https://wa.me/${WHATSAPP_NUMBER}`;

interface Service {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
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

const ServiceCard = ({ service, onLearnMore }: { service: Service; onLearnMore: () => void }) => (
  <div className={`bg-white rounded-3xl border ${service.borderColor} shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col`}>
    {/* Top accent bar */}
    <div className={`h-1 w-full ${service.id === "advisory" ? "bg-gradient-to-r from-gold to-yellow-400" : service.id === "copytrading" ? "bg-gradient-to-r from-blue-400 to-blue-600" : "bg-gradient-to-r from-emerald-400 to-emerald-600"}`} />

    <div className="p-8 flex flex-col flex-1">
      {/* Header */}
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

      {/* Description */}
      <p className="text-gray-500 text-sm leading-relaxed mb-6">{service.description}</p>

      {/* Highlights */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {service.highlights.map((h) => (
          <div key={h.label} className={`${service.bgColor} rounded-xl p-3 text-center`}>
            <div className={`flex justify-center mb-1 ${service.color}`}>{h.icon}</div>
            <div className={`text-sm font-black ${service.color}`}>{h.value}</div>
            <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">{h.label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <ul className="space-y-2 mb-8 flex-1">
        {service.features.map((f) => (
          <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
            <CheckCircle className={`w-4 h-4 shrink-0 ${service.color}`} />
            {f}
          </li>
        ))}
      </ul>

      {/* CTAs */}
      <div className="flex gap-3 mt-auto">
        <a
          href={`${WHATSAPP_BASE}?text=${encodeURIComponent(service.waMessage)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition
            ${service.id === "advisory"
              ? "bg-gold hover:bg-gold-hover text-white shadow-md shadow-gold/20"
              : service.id === "copytrading"
              ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
            }`}
        >
          <MessageCircle className="w-4 h-4" />
          {service.ctaLabel}
        </a>
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

const ServiceModal = ({ service, onClose }: { service: Service; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
    <div
      className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Modal header */}
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
        {/* Stats */}
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

        {/* Features */}
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

        {/* CTA */}
        <a
          href={`${WHATSAPP_BASE}?text=${encodeURIComponent(service.waMessage)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold text-sm transition
            ${service.id === "advisory"
              ? "bg-gold hover:bg-gold-hover text-white shadow-lg shadow-gold/20"
              : service.id === "copytrading"
              ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
            }`}
        >
          <MessageCircle className="w-4 h-4" />
          {service.ctaLabel} via WhatsApp
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  </div>
);

const ServicesPage = () => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);

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

      {/* Services grid */}
      <section className="pb-24 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onLearnMore={() => setSelectedService(service)}
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

      {/* Modal */}
      {selectedService && (
        <ServiceModal service={selectedService} onClose={() => setSelectedService(null)} />
      )}
    </div>
  );
};

export default ServicesPage;
