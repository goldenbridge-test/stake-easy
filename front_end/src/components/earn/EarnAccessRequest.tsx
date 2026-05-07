import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, PhoneCall, CheckCircle, Loader2, ArrowRight, Shield, Clock, Users, RefreshCw } from "lucide-react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { earnAccessApi } from "../../services/blockchainApi";
import { useAuth } from "../../contexts/AuthContext";

type Step = "locked" | "form" | "success";

const EarnAccessRequest = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("locked");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Polling automatique toutes les 30s sur l'étape "success"
  useEffect(() => {
    if (step !== "success") return;

    const check = async () => {
      await refreshProfile();
    };

    pollRef.current = setInterval(check, 30000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [step]);

  // Dès que is_earn_eligible devient true → redirection automatique
  useEffect(() => {
    if (user?.is_earn_eligible) {
      if (pollRef.current) clearInterval(pollRef.current);
      navigate("/earn");
    }
  }, [user?.is_earn_eligible]);

  const handleCheckNow = async () => {
    setChecking(true);
    await refreshProfile();
    setChecking(false);
  };
  const [form, setForm] = useState({
    full_name: user ? `${user.first_name ?? ""} ${(user as any).last_name ?? ""}`.trim() : "",
    email: user?.email ?? "",
    phone: "",
    country: "",
    reason: "",
    preferred_time: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await earnAccessApi.request(form);
      setStep("success");
    } catch {
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-body text-dark">
      <Navbar />

      {/* ── LOCKED STATE ── */}
      {step === "locked" && (
        <div className="pt-32 pb-20">
          <div className="max-w-2xl mx-auto px-6 text-center">

            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <Lock className="w-9 h-9 text-gray-400" />
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest mb-5">
              Access Restricted
            </div>

            <h1 className="text-4xl font-heading font-bold text-primary mb-4">
              You're not eligible yet
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed mb-10">
              Access to GoldenBridge Earn — staking and DeFi products — is currently by invitation only.
              Request a demo call with our team to get qualified.
            </p>

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-left">
              {[
                { icon: <Shield className="w-5 h-5 text-gold" />, title: "Vetted Access", desc: "We review each profile to ensure the best experience." },
                { icon: <PhoneCall className="w-5 h-5 text-gold" />, title: "Personal Onboarding", desc: "A 30-min call to walk you through the platform." },
                { icon: <Clock className="w-5 h-5 text-gold" />, title: "Quick Approval", desc: "Most requests are reviewed within 48 hours." },
              ].map((item) => (
                <div key={item.title} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                  <div className="mb-2">{item.icon}</div>
                  <p className="font-bold text-sm text-primary mb-1">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep("form")}
              className="inline-flex items-center gap-2 bg-gold hover:bg-gold-hover text-white font-bold px-8 py-3.5 rounded-xl transition shadow-lg shadow-gold/20 text-base"
            >
              Request Demo Access <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── FORM STATE ── */}
      {step === "form" && (
        <div className="pt-32 pb-20">
          <div className="max-w-xl mx-auto px-6">

            <button onClick={() => setStep("locked")} className="text-sm text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1">
              ← Back
            </button>

            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 text-gold text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest mb-5">
              <PhoneCall className="w-3.5 h-3.5" /> Book a Demo Call
            </div>

            <h2 className="text-3xl font-heading font-bold text-primary mb-2">
              Request Earn Access
            </h2>
            <p className="text-gray-500 mb-8">
              Fill in the form below. We'll review your request and schedule a call within 48 hours.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Full Name *</label>
                  <input
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    required
                    placeholder="Honorine GABIAM"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Email *</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Phone *</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    placeholder="+229 96 00 00 00"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Country *</label>
                  <input
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    required
                    placeholder="Bénin"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Why are you interested in staking? *</label>
                <textarea
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="Tell us about your investment goals and experience with DeFi..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Preferred call time</label>
                <select
                  name="preferred_time"
                  value={form.preferred_time}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 bg-white"
                >
                  <option value="">-- Select a time slot --</option>
                  <option value="morning">Morning (8h – 12h WAT)</option>
                  <option value="afternoon">Afternoon (12h – 17h WAT)</option>
                  <option value="evening">Evening (17h – 20h WAT)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gold hover:bg-gold-hover text-white font-bold py-3.5 rounded-xl transition disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PhoneCall className="w-4 h-4" />}
                {loading ? "Sending..." : "Submit & Book a Call"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── SUCCESS STATE ── */}
      {step === "success" && (
        <div className="pt-32 pb-20">
          <div className="max-w-lg mx-auto px-6 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-full mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-3xl font-heading font-bold text-primary mb-4">
              Request Submitted!
            </h2>
            <p className="text-gray-500 leading-relaxed mb-8">
              Thank you! Our team will review your request and reach out within <strong>48 hours</strong> to schedule your demo call.
              Once approved, you'll have full access to GoldenBridge Earn.
            </p>
            <div className="bg-gold/5 border border-gold/20 rounded-2xl p-5 text-left space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-gold shrink-0" />
                <span className="text-sm text-gray-600">Our team reviews your profile</span>
              </div>
              <div className="flex items-center gap-3">
                <PhoneCall className="w-4 h-4 text-gold shrink-0" />
                <span className="text-sm text-gray-600">We schedule a 30-min onboarding call</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-gold shrink-0" />
                <span className="text-sm text-gray-600">Access unlocked — you can start staking</span>
              </div>
            </div>

            <button
              onClick={handleCheckNow}
              disabled={checking}
              className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-primary text-primary font-semibold px-6 py-2.5 rounded-xl text-sm transition disabled:opacity-60"
            >
              {checking
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <RefreshCw className="w-4 h-4" />}
              {checking ? "Checking..." : "Check my access status"}
            </button>
            <p className="text-xs text-gray-400 mt-3">Auto-checked every 30 seconds. You'll be redirected automatically once approved.</p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default EarnAccessRequest;
