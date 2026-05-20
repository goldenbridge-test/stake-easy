import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Coins,
  Trash2,
  Plus,
  Copy,
  CheckCircle,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Gift,
  BookOpen,
  Users,
  LayoutDashboard,
  Pencil,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  Settings,
  Target,
  ClipboardList,
  Briefcase,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useWeb3 } from "../hooks/useWeb3";
import { useAuth } from "../contexts/AuthContext";
import { analyticsApi, coursesApi, usersApi, getUser } from "../services/api";
import {
  earnAccessApi,
  serviceSubscriptionsApi, ServiceSubscription, ServiceType, SubscriptionStatus,
  serviceInquiriesApi, ServiceInquiry, InquiryStatus,
  portfolioReportsApi, PortfolioReport,
} from "../services/blockchainApi";
import AdminInstructorApplications from "./AdminInstructorApplications";


// ==========================================
// TYPES
// ==========================================

type AllowedToken = {
  address: string;
  symbol: string;
  name: string;
  priceFeed: string;
};

type UserRow = {
  id: number;
  username: string;
  date_joined: string;
  role: string;
  status?: string;
};

type Category = {
  id: number;
  name: string;
};


// ==========================================
// TABS
// ==========================================
type TabKey = "overview" | "tokens" | "courses" | "users" | "applications" | "earn_requests" | "service_clients";

const AdminDashboard = () => {
  const { user } = useAuth();
  const currentUser = user || getUser();

  const {
    account,
    isConnected,
    checkIsAdmin,
    addAllowedToken,
    setPriceFeed,
    removeAllowedToken,
    distributeRewardsToAll,
    checkTokenIsAllowed,
    getAllowedTokens,
    chainId,
  } = useWeb3();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isInstructor, setIsInstructor] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  // Analytics states
  const [platformStats, setPlatformStats] = useState<any>(null);

  // Token states
  const [isLoading, setIsLoading] = useState(false);
  const [distributeLoading, setDistributeLoading] = useState(false);
  const [newTokenAddress, setNewTokenAddress] = useState("");
  const [newPriceFeed, setNewPriceFeed] = useState("");
  const [tokens, setTokens] = useState<AllowedToken[]>([]);

  // Course states
  const [courses, setCourses] = useState<any[]>([]);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [courseForm, setCourseForm] = useState({ title: "", description: "", price: "0", category: 1, level: "beginner" });

  // User states
  const [userSearch, setUserSearch] = useState("");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [userPage, setUserPage] = useState(1);

  // Earn access requests
  const [earnRequests, setEarnRequests] = useState<any[]>([]);
  const [earnRequestsLoading, setEarnRequestsLoading] = useState(false);

  // Service inquiries
  const [serviceInquiries, setServiceInquiries] = useState<ServiceInquiry[]>([]);

  // Service subscriptions
  const [serviceClients, setServiceClients] = useState<ServiceSubscription[]>([]);
  const [showClientForm, setShowClientForm] = useState(false);
  const [editingClient, setEditingClient] = useState<ServiceSubscription | null>(null);
  const [clientFormLoading, setClientFormLoading] = useState(false);
  const emptyClientForm = {
    user_id: 0, service: "advisory" as ServiceType, investment_amount: "",
    contract_start: "", contract_duration_months: 12,
    expected_return_rate: "", status: "active" as SubscriptionStatus, notes: "",
  };
  const [clientForm, setClientForm] = useState(emptyClientForm);

  // OTC quote modal
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteTarget, setQuoteTarget] = useState<ServiceInquiry | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const emptyQuoteForm = { proposed_price: "", fee_pct: "1.1", expires_at: "", notes: "" };
  const [quoteForm, setQuoteForm] = useState(emptyQuoteForm);

  // Portfolio reports
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTargetClient, setReportTargetClient] = useState<ServiceSubscription | null>(null);
  const [reportFormLoading, setReportFormLoading] = useState(false);
  const [clientReports, setClientReports] = useState<Record<number, PortfolioReport[]>>({});
  const now = new Date();
  const emptyReportForm = {
    period_month: now.getMonth() + 1,
    period_year: now.getFullYear(),
    portfolio_value: "",
    return_pct: "",
    notes: "",
  };
  const [reportForm, setReportForm] = useState(emptyReportForm);

  // ==========================================
  // EFFECTS
  // ==========================================

  useEffect(() => {
    const verify = async () => {
      // Check both Web3 and Backend roles
      const backendIsAdmin = user?.role === 'admin';
      const backendIsInstructor = user?.role === 'instructor';
      const web3IsAdmin = await checkIsAdmin();

      setIsAdmin(backendIsAdmin || web3IsAdmin);
      setIsInstructor(backendIsInstructor);
      setIsCheckingAdmin(false);

      if (backendIsAdmin || backendIsInstructor || web3IsAdmin) {
        fetchDashboardData();
      }
    };
    verify();
  }, [account, isConnected, user]);

  const fetchDashboardData = async () => {
    const [stats, coursesData, categoriesData, usersData, onchainTokens] = await Promise.all([
      analyticsApi.adminSummary().catch(() => null),
      coursesApi.list().catch(() => ({ results: [] })),
      coursesApi.categories().catch(() => []),
      usersApi.list().catch(() => ({ results: [] })),
      getAllowedTokens(),
    ]);
    if (stats) setPlatformStats(stats);
    setCourses((coursesData as any).results || coursesData || []);
    setCategories(categoriesData || []);
    setUsers((usersData as any).results || usersData || []);
    const seen = new Set<string>();
    setTokens(onchainTokens.filter(t => {
      const addr = t.address.toLowerCase();
      if (seen.has(addr)) return false;
      seen.add(addr);
      return true;
    }));
    // Earn access requests
    earnAccessApi.list().then(data => {
      setEarnRequests(Array.isArray(data) ? data : (data.results || []));
    }).catch(() => {});
    // Service subscriptions
    serviceSubscriptionsApi.list().then(data => setServiceClients(data)).catch(() => {});
    // Service inquiries
    serviceInquiriesApi.list().then(data => setServiceInquiries(data)).catch(() => {});
  };

  const handleApproveEarnRequest = async (id: number) => {
    setEarnRequestsLoading(true);
    try {
      await earnAccessApi.approve(id);
      setEarnRequests(prev => prev.map(r => r.id === id ? { ...r, status: "approved" } : r));
    } catch { alert("Failed to approve request."); }
    finally { setEarnRequestsLoading(false); }
  };

  // ==========================================
  // SERVICE INQUIRY HANDLERS
  // ==========================================

  const handleInquiryStatus = async (id: number, status: InquiryStatus) => {
    try {
      await serviceInquiriesApi.update(id, { status });
      setServiceInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    } catch { alert("Impossible de mettre à jour le statut."); }
  };

  const handleDeleteInquiry = async (id: number) => {
    if (!window.confirm("Supprimer cette demande ?")) return;
    try {
      await serviceInquiriesApi.remove(id);
      setServiceInquiries(prev => prev.filter(i => i.id !== id));
    } catch { alert("Impossible de supprimer."); }
  };

  const handleConvertInquiry = (inquiry: ServiceInquiry) => {
    setActiveTab("service_clients");
    setEditingClient(null);
    setClientForm({
      user_id: 0,
      service: inquiry.service,
      investment_amount: "",
      contract_start: new Date().toISOString().split("T")[0],
      contract_duration_months: 12,
      expected_return_rate: "",
      status: "active",
      notes: `Converti depuis demande du ${new Date(inquiry.created_at).toLocaleDateString("fr-FR")} — ${inquiry.full_name} (${inquiry.email})`,
    });
    setShowClientForm(true);
  };

  // ==========================================
  // SERVICE CLIENT HANDLERS
  // ==========================================

  const handleOpenClientForm = (client?: ServiceSubscription) => {
    if (client) {
      setEditingClient(client);
      setClientForm({
        user_id: client.user.id,
        service: client.service,
        investment_amount: client.investment_amount,
        contract_start: client.contract_start,
        contract_duration_months: client.contract_duration_months,
        expected_return_rate: client.expected_return_rate,
        status: client.status,
        notes: client.notes,
      });
    } else {
      setEditingClient(null);
      setClientForm(emptyClientForm);
    }
    setShowClientForm(true);
  };

  const handleSaveClient = async () => {
    if (!clientForm.user_id || !clientForm.investment_amount || !clientForm.contract_start) {
      alert("Remplis tous les champs obligatoires.");
      return;
    }
    setClientFormLoading(true);
    try {
      if (editingClient) {
        const updated = await serviceSubscriptionsApi.update(editingClient.id, clientForm);
        setServiceClients(prev => prev.map(c => c.id === editingClient.id ? updated : c));
      } else {
        const created = await serviceSubscriptionsApi.create(clientForm);
        setServiceClients(prev => [created, ...prev]);
      }
      setShowClientForm(false);
      setEditingClient(null);
      setClientForm(emptyClientForm);
    } catch (e: any) {
      alert("Erreur : " + e.message);
    } finally {
      setClientFormLoading(false);
    }
  };

  const handleDeleteClient = async (id: number) => {
    if (!window.confirm("Supprimer ce client ?")) return;
    try {
      await serviceSubscriptionsApi.remove(id);
      setServiceClients(prev => prev.filter(c => c.id !== id));
    } catch { alert("Impossible de supprimer."); }
  };

  // ==========================================
  // OTC QUOTE HANDLERS
  // ==========================================

  const handleOpenQuoteModal = (inquiry: ServiceInquiry) => {
    setQuoteTarget(inquiry);
    // Pre-parse existing quote from admin_notes if any
    setQuoteForm(emptyQuoteForm);
    setShowQuoteModal(true);
  };

  const handleSaveQuote = async () => {
    if (!quoteTarget || !quoteForm.proposed_price) {
      alert("Remplis le prix proposé.");
      return;
    }
    setQuoteLoading(true);
    const amount = parseFloat(quoteForm.proposed_price);
    const fee = amount * parseFloat(quoteForm.fee_pct) / 100;
    const total = amount + fee;
    const noteText = `[DEVIS] Prix proposé: ${amount.toLocaleString()} | Frais GB (${quoteForm.fee_pct}%): ${fee.toFixed(2)} | Total client: ${total.toFixed(2)} | Expire: ${quoteForm.expires_at || "N/A"} | Note: ${quoteForm.notes}`;
    try {
      await serviceInquiriesApi.update(quoteTarget.id, {
        status: "contacted",
        admin_notes: noteText,
      });
      setServiceInquiries(prev => prev.map(i =>
        i.id === quoteTarget.id ? { ...i, status: "contacted", admin_notes: noteText } : i
      ));
      setShowQuoteModal(false);
    } catch { alert("Impossible d'enregistrer le devis."); }
    finally { setQuoteLoading(false); }
  };

  // ==========================================
  // PORTFOLIO REPORT HANDLERS
  // ==========================================

  const handleOpenReportModal = (client: ServiceSubscription) => {
    setReportTargetClient(client);
    setReportForm(emptyReportForm);
    // Load existing reports for this client if not already loaded
    if (!clientReports[client.id]) {
      portfolioReportsApi.list(client.id)
        .then(data => setClientReports(prev => ({ ...prev, [client.id]: data })))
        .catch(() => {});
    }
    setShowReportModal(true);
  };

  const handleSaveReport = async () => {
    if (!reportTargetClient || !reportForm.portfolio_value || !reportForm.return_pct) {
      alert("Remplis tous les champs obligatoires.");
      return;
    }
    setReportFormLoading(true);
    try {
      const created = await portfolioReportsApi.create(reportTargetClient.id, reportForm);
      setClientReports(prev => ({
        ...prev,
        [reportTargetClient.id]: [created, ...(prev[reportTargetClient.id] || [])],
      }));
      setReportForm(emptyReportForm);
      setShowReportModal(false);
    } catch (e: any) {
      alert("Erreur : " + e.message);
    } finally {
      setReportFormLoading(false);
    }
  };

  const handleDeleteReport = async (subscriptionId: number, reportId: number) => {
    if (!window.confirm("Supprimer ce rapport ?")) return;
    try {
      await portfolioReportsApi.remove(subscriptionId, reportId);
      setClientReports(prev => ({
        ...prev,
        [subscriptionId]: (prev[subscriptionId] || []).filter(r => r.id !== reportId),
      }));
    } catch { alert("Impossible de supprimer ce rapport."); }
  };

  const handleRejectEarnRequest = async (id: number) => {
    setEarnRequestsLoading(true);
    try {
      await earnAccessApi.reject(id);
      setEarnRequests(prev => prev.map(r => r.id === id ? { ...r, status: "rejected" } : r));
    } catch { alert("Failed to reject request."); }
    finally { setEarnRequestsLoading(false); }
  };


  // ==========================================
  // TOKEN HANDLERS
  // ==========================================

  const handleAddToken = async () => {
    if (!newTokenAddress || !newPriceFeed) {
      alert("Remplis les 2 champs");
      return;
    }
    if (!newTokenAddress.startsWith("0x") || newTokenAddress.length !== 42) {
      alert("Adresse token invalide");
      return;
    }
    if (!newPriceFeed.startsWith("0x") || newPriceFeed.length !== 42) {
      alert("Adresse price feed invalide");
      return;
    }

    setIsLoading(true);
    const step1 = await addAllowedToken(newTokenAddress);
    if (!step1) { setIsLoading(false); return; }

    const step2 = await setPriceFeed(newTokenAddress, newPriceFeed);
    if (!step2) {
      alert("Token ajouté mais price feed non configuré. Réessaie.");
      setIsLoading(false);
      return;
    }

    setNewTokenAddress("");
    setNewPriceFeed("");
    // Recharger depuis le contrat pour avoir symbole + price feed à jour
    const fresh = await getAllowedTokens();
    const seen = new Set<string>();
    setTokens(fresh.filter(t => {
      const addr = t.address.toLowerCase();
      if (seen.has(addr)) return false;
      seen.add(addr);
      return true;
    }));
    setIsLoading(false);
  };

  const handleRemoveToken = async (address: string) => {
    if (!window.confirm(`Supprimer ${truncate(address)} ?`)) return;
    const success = await removeAllowedToken(address);
    if (success) setTokens(tokens.filter((t) => t.address !== address));
  };

  const handleDistributeAll = async () => {
    if (!window.confirm("Distribuer les rewards GLD a tous les stakers ?")) return;
    setDistributeLoading(true);
    await distributeRewardsToAll();
    setDistributeLoading(false);
  };

  // ==========================================
  // COURSE HANDLERS
  // ==========================================

  const handleSaveCourse = async () => {
    if (!courseForm.title || !courseForm.description) return;

    try {
      if (editingCourse) {
        const updated = await coursesApi.update(editingCourse.id, courseForm);
        setCourses(courses.map(c => c.id === editingCourse.id ? updated : c));
      } else {
        const created = await coursesApi.create(courseForm);
        setCourses([...courses, created]);
      }
      setCourseForm({ title: "", description: "", price: "0", category: 1, level: "beginner" });
      setEditingCourse(null);
      setShowCourseForm(false);
    } catch (err) {
      alert("Failed to save course");
    }
  };

  const handleEditCourse = (course: any) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description,
      price: course.price,
      category: course.category || 1,
      level: course.level
    });
    setShowCourseForm(true);
  };

  const handleDeleteCourse = async (id: number) => {
    if (!window.confirm("Supprimer ce cours ?")) return;
    try {
      await coursesApi.delete(id);
      setCourses(courses.filter((c) => c.id !== id));
    } catch (err) {
      alert("Failed to delete course");
    }
  };

  const handleToggleCourseStatus = async (course: any) => {
    try {
      const newStatus = course.status === "Published" ? "Draft" : "Published";
      const updated = await coursesApi.update(course.id, { status: newStatus });
      setCourses(courses.map((c) => (c.id === course.id ? updated : c)));
    } catch (err) {
      alert("Failed to update status");
    }
  };


  // ==========================================
  // HELPERS
  // ==========================================

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  const filteredUsers = users.filter(
    (u) => (u.username || "").toLowerCase().includes(userSearch.toLowerCase())
  );

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: "tokens", label: "Tokens", icon: <Coins className="w-4 h-4" /> },
    { key: "courses", label: "Courses", icon: <BookOpen className="w-4 h-4" /> },
    { key: "users", label: "Users", icon: <Users className="w-4 h-4" /> },
    { key: "applications", label: "Applications", icon: <ClipboardList className="w-4 h-4" /> },
    { key: "earn_requests", label: "Earn Requests", icon: <Target className="w-4 h-4" /> },
    { key: "service_clients", label: "Service Clients", icon: <Briefcase className="w-4 h-4" /> },
  ];

  const visibleTabs = tabs.filter(tab => {
    if (isAdmin) return true;
    if (isInstructor) return tab.key === "overview" || tab.key === "courses";
    return false;
  });

  // ==========================================
  // GUARD VIEWS
  // ==========================================

  if (isCheckingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-body">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-heading font-semibold text-sm">
            Verifying admin access...
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin && !isInstructor) {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-4 font-body">
        <div className="bg-white/5 border border-white/10 p-10 rounded-3xl max-w-sm w-full text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-red-500">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-white mb-2">Accès Refusé</h1>
          <p className="text-gray-400 text-sm mb-8">Réservé aux instructeurs et administrateurs.</p>
          <Link to="/" className="inline-block bg-gold text-primary font-bold px-8 py-3 rounded-xl hover:bg-gold-hover transition">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN DASHBOARD
  // ==========================================

  return (
    <div className="bg-gray-50 min-h-screen font-body text-dark flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-heading font-bold text-primary">
                Administration
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Manage tokens, courses and platform users
              </p>
            </div>
            {account && (
              <div className="flex items-center gap-2 flex-wrap">
                {/* Network badge */}
                {chainId && (() => {
                  const networks: Record<number, { label: string; color: string; dot: string }> = {
                    1:        { label: "Ethereum",   color: "bg-blue-50 text-blue-700 border-blue-200",     dot: "bg-blue-500" },
                    11155111: { label: "Sepolia",     color: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500" },
                    56:       { label: "BNB Chain",   color: "bg-yellow-50 text-yellow-700 border-yellow-200", dot: "bg-yellow-500" },
                    97:       { label: "BNB Testnet", color: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-400" },
                    137:      { label: "Polygon",     color: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-500" },
                  };
                  const net = networks[chainId] ?? { label: `Chain ${chainId}`, color: "bg-gray-50 text-gray-600 border-gray-200", dot: "bg-gray-400" };
                  return (
                    <div className={`flex items-center gap-1.5 border rounded-lg px-3 py-2 ${net.color}`}>
                      <div className={`w-2 h-2 rounded-full animate-pulse ${net.dot}`}></div>
                      <span className="text-xs font-semibold">{net.label}</span>
                    </div>
                  );
                })()}
                {/* Wallet + role */}
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-xs font-mono text-gray-500">{truncate(account)}</span>
                  <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase">Admin</span>
                </div>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 bg-white rounded-lg border border-gray-200 p-1 mb-8 overflow-x-auto">
            {visibleTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold transition whitespace-nowrap ${activeTab === tab.key
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-500 hover:text-primary hover:bg-gray-50"
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* ==========================================
              TAB: OVERVIEW
          ========================================== */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Instructor Portal Specific Section */}
              {currentUser?.role === 'instructor' && (
                <div className="bg-gold/5 border border-gold/20 rounded-3xl p-8 mb-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center text-gold">
                      <Settings className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-heading font-bold text-white">Portail Instructeur</h2>
                      <p className="text-gray-400 text-sm">Gérez vos formations et vos programmes de coaching.</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-gold/30 transition group">
                      <h3 className="font-bold mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-gold" /> Vos Cours Actifs
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-primary-dark rounded-xl border border-white/5">
                          <span className="text-sm font-medium">Introduction à la Blockchain</span>
                          <button className="text-[10px] bg-gold text-primary font-bold px-3 py-1 rounded-lg hover:bg-gold-hover transition">
                            Lier Coaching
                          </button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-primary-dark rounded-xl border border-white/5">
                          <span className="text-sm font-medium">Smart Contracts Masterclass</span>
                          <span className="text-[10px] text-green-500 font-bold px-3 py-1 border border-green-500/20 rounded-lg bg-green-500/5">
                            Coaching Actif
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-gold/30 transition group">
                      <h3 className="font-bold mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-gold" /> Performance Coaching
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Total Revenu Coaching</span>
                          <span className="font-bold text-gold">$1,250</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Taux de Complétion</span>
                          <span className="font-bold text-green-500">92%</span>
                        </div>
                        <a href="/academy/coaching" className="block text-center w-full py-2 mt-2 bg-white/10 rounded-xl text-xs font-bold hover:bg-white/20 transition">
                          Voir tous les coachings
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stat cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total GMV" value={`$${platformStats?.gmv || 0}`} sub="Ventes globales" />
                <StatCard label="Total Courses" value={String(platformStats?.total_courses || 0)} sub="Articles actifs" />
                <StatCard label="Active Students" value={String(platformStats?.active_students || 0)} sub="Engagés" />
                <StatCard label="Coaching Success" value={`${platformStats?.coaching_success_rate || 0}%`} sub="Taux de réussite" />
              </div>

              {/* Quick actions */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-sm font-heading font-bold text-gray-700 uppercase tracking-wider mb-4">
                  Quick Actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => setActiveTab("tokens")}
                    className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-blue-50/30 transition text-left"
                  >
                    <Coins className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-bold text-dark">Manage Tokens</p>
                      <p className="text-xs text-gray-400">Add or remove allowed tokens</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("courses")}
                    className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-blue-50/30 transition text-left"
                  >
                    <BookOpen className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-bold text-dark">Manage Courses</p>
                      <p className="text-xs text-gray-400">Create and edit academy content</p>
                    </div>
                  </button>
                  <button
                    onClick={handleDistributeAll}
                    disabled={distributeLoading}
                    className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-gold hover:bg-gold-light/30 transition text-left disabled:opacity-50"
                  >
                    <Gift className="w-5 h-5 text-gold" />
                    <div>
                      <p className="text-sm font-bold text-dark">
                        {distributeLoading ? "Processing..." : "Distribute Rewards"}
                      </p>
                      <p className="text-xs text-gray-400">Issue GLD to all stakers</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Contract info */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-sm font-heading font-bold text-gray-700 uppercase tracking-wider mb-4">
                  Contract Addresses
                </h2>
                <div className="space-y-3">
                  <ContractRow label="TokenFarm" address="0x736Ee2066fd93601Cb86Ce4d8ce7109d014cbDE4" onCopy={copyToClipboard} />
                  <ContractRow label="GoldenToken (GLD)" address="0x92e474EcD778406C8A101175E32cA9149C2c1499" onCopy={copyToClipboard} />
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB: TOKENS
          ========================================== */}
          {activeTab === "tokens" && (
            <div className="space-y-6">
              {/* Token list */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="text-base font-heading font-bold text-dark">
                    Allowed Tokens
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Two transactions per token: addAllowedTokens + setPriceFeedContract
                  </p>
                </div>

                {tokens.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-gray-400 text-[11px] uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-3 font-semibold">Token Address</th>
                          <th className="px-6 py-3 font-semibold">Network</th>
                          <th className="px-6 py-3 font-semibold">Price Feed</th>
                          <th className="px-6 py-3 font-semibold">Status</th>
                          <th className="px-6 py-3 font-semibold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {tokens.map((token) => {
                          const networkMap: Record<number, { label: string; color: string; dot: string }> = {
                            1:        { label: "Ethereum",   color: "bg-blue-50 text-blue-700 border-blue-200",     dot: "bg-blue-500" },
                            11155111: { label: "Sepolia",     color: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500" },
                            56:       { label: "BNB Chain",   color: "bg-yellow-50 text-yellow-700 border-yellow-200", dot: "bg-yellow-500" },
                            97:       { label: "BNB Testnet", color: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-400" },
                            137:      { label: "Polygon",     color: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-500" },
                          };
                          const net = chainId
                            ? (networkMap[chainId] ?? { label: `Chain ${chainId}`, color: "bg-gray-50 text-gray-600 border-gray-200", dot: "bg-gray-400" })
                            : { label: "—", color: "bg-gray-50 text-gray-400 border-gray-100", dot: "bg-gray-300" };
                          return (
                          <tr key={token.address} className="hover:bg-gray-50/50 transition">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-primary mr-1">{token.symbol}</span>
                                <span className="font-mono text-xs text-gray-600">{truncate(token.address)}</span>
                                <button onClick={() => copyToClipboard(token.address)} className="text-gray-300 hover:text-primary">
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 border rounded-md px-2 py-0.5 text-xs font-semibold ${net.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${net.dot}`}></span>
                                {net.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-mono text-xs text-gray-400">
                              {token.priceFeed.startsWith("0x") ? truncate(token.priceFeed) : token.priceFeed}
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1 text-green-600 text-xs font-semibold">
                                <CheckCircle className="w-3 h-3" /> Active
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button onClick={() => handleRemoveToken(token.address)} className="text-gray-300 hover:text-red-500 transition">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-10 text-center">
                    <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-400">No tokens configured yet</p>
                  </div>
                )}

                {/* Add token form */}
                <div className="px-6 py-5 bg-gray-50 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 mb-3">Add New Token</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Token address (0x...)"
                      value={newTokenAddress}
                      onChange={(e) => setNewTokenAddress(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-mono text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Price feed address (0x...)"
                      value={newPriceFeed}
                      onChange={(e) => setNewPriceFeed(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-mono text-xs"
                    />
                    <button
                      onClick={handleAddToken}
                      disabled={isLoading}
                      className="bg-primary hover:bg-primary-dark text-white font-semibold px-5 py-2 rounded-lg transition text-sm flex items-center justify-center gap-1.5 disabled:opacity-50 whitespace-nowrap"
                    >
                      {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      {isLoading ? "Adding..." : "Add Token"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Distribute rewards */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-heading font-bold text-dark">Reward Distribution</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Sends GLD tokens proportional to each staker's total value
                    </p>
                  </div>
                  <button
                    onClick={handleDistributeAll}
                    disabled={distributeLoading}
                    className="bg-gold hover:bg-gold-hover text-white font-semibold px-6 py-2.5 rounded-lg transition text-sm flex items-center gap-2 disabled:opacity-50 shrink-0"
                  >
                    {distributeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
                    {distributeLoading ? "Processing..." : "Distribute to All"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB: COURSES
          ========================================== */}
          {activeTab === "courses" && (
            <div className="space-y-6">
              {/* Header + Add button */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-heading font-bold text-dark">Academy Courses</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{courses.length} courses total</p>
                </div>
                <button
                  onClick={() => {
                    setEditingCourse(null);
                    setCourseForm({ title: "", description: "", price: "0", category: 1, level: "beginner" });
                    setShowCourseForm(true);
                  }}
                  className="bg-primary hover:bg-primary-dark text-white font-semibold px-4 py-2 rounded-lg transition text-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> New Course
                </button>
              </div>

              {/* Course form modal */}
              {showCourseForm && (
                <div className="bg-white rounded-xl border border-primary/20 p-6 shadow-sm">
                  <h3 className="text-sm font-heading font-bold text-dark mb-4">
                    {editingCourse ? "Edit Course" : "New Course"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    <input
                      type="text"
                      placeholder="Course title"
                      value={courseForm.title}
                      onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm"
                    />
                    <textarea
                      placeholder="Course description"
                      value={courseForm.description}
                      onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm h-24 col-span-1 sm:col-span-3"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={courseForm.price}
                      onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm"
                    />
                    <select
                      value={courseForm.category}
                      onChange={(e) => setCourseForm({ ...courseForm, category: Number(e.target.value) })}
                      className="px-3 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm bg-white"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>

                    <select
                      value={courseForm.level}
                      onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value as any })}
                      className="px-3 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm bg-white"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveCourse}
                      className="bg-primary hover:bg-primary-dark text-white font-semibold px-5 py-2 rounded-lg transition text-sm"
                    >
                      {editingCourse ? "Save Changes" : "Create Course"}
                    </button>
                    <button
                      onClick={() => { setShowCourseForm(false); setEditingCourse(null); }}
                      className="border border-gray-200 text-gray-500 hover:text-dark font-semibold px-5 py-2 rounded-lg transition text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Course list */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-400 text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-3 font-semibold">Title</th>
                        <th className="px-6 py-3 font-semibold">Category</th>
                        <th className="px-6 py-3 font-semibold">Level</th>
                        <th className="px-6 py-3 font-semibold">Students</th>
                        <th className="px-6 py-3 font-semibold">Status</th>
                        <th className="px-6 py-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {courses.map((course) => (
                        <tr key={course.id} className="hover:bg-gray-50/50 transition">
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-dark">{course.title}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">
                              {course.category_name || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-medium ${course.level === "Beginner" ? "text-green-600"
                              : course.level === "Intermediate" ? "text-blue-600"
                                : "text-purple-600"
                              }`}>
                              {course.level}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                            {course.students_count || 0}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggleCourseStatus(course)}
                              className={`text-xs font-semibold px-2.5 py-1 rounded cursor-pointer transition ${course.status === "Published"
                                ? "bg-green-50 text-green-600 hover:bg-green-100"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                }`}
                            >
                              {course.status}
                            </button>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleEditCourse(course)}
                                className="p-1.5 text-gray-300 hover:text-primary transition rounded hover:bg-gray-100"
                                title="Edit"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCourse(course.id)}
                                className="p-1.5 text-gray-300 hover:text-red-500 transition rounded hover:bg-gray-100"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB: USERS
          ========================================== */}
          {activeTab === "users" && (
            <div className="space-y-6">
              {/* Header + search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-heading font-bold text-dark">Platform Users</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{users.length} registered users</p>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by username..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm font-mono w-full sm:w-72"
                  />
                </div>
              </div>

              {/* Users table */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-400 text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-3 font-semibold">User / Wallet</th>
                        <th className="px-6 py-3 font-semibold">Joined</th>
                        <th className="px-6 py-3 font-semibold">Staked Value</th>
                        <th className="px-6 py-3 font-semibold">Status</th>
                        <th className="px-6 py-3 font-semibold text-right">View</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50/50 transition">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                  {(user.username || "0x").slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <span className="font-mono text-xs text-gray-600">
                                    {user.username && user.username.startsWith("0x") ? truncate(user.username) : user.username}
                                  </span>
                                  {user.username && user.username.startsWith("0x") && (
                                    <button onClick={() => copyToClipboard(user.username)} className="ml-1.5 text-gray-200 hover:text-primary">
                                      <Copy className="w-3 h-3 inline" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-400">
                              {user.date_joined ? new Date(user.date_joined).toLocaleDateString() : "N/A"}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-dark font-mono">
                              {user.role}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-xs font-semibold ${user.status === "Active" ? "text-green-600" : "text-gray-400"
                                }`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {user.username && user.username.startsWith("0x") && (
                                <a
                                  href={`https://sepolia.etherscan.io/address/${user.username}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 text-gray-300 hover:text-primary transition rounded hover:bg-gray-100 inline-flex"
                                  title="View on Etherscan"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-10 text-center text-gray-400 text-sm">
                            No users found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/50">
                  <p className="text-xs text-gray-400">
                    Showing {filteredUsers.length} of {users.length} users
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setUserPage(Math.max(1, userPage - 1))}
                      disabled={userPage === 1}
                      className="p-1.5 rounded border border-gray-200 text-gray-400 hover:text-primary disabled:opacity-30 transition"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-semibold text-gray-500 px-3">{userPage}</span>
                    <button
                      onClick={() => setUserPage(userPage + 1)}
                      disabled={filteredUsers.length <= 10}
                      className="p-1.5 rounded border border-gray-200 text-gray-400 hover:text-primary disabled:opacity-30 transition"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB: APPLICATIONS
          ========================================== */}
          {activeTab === "applications" && (
            <AdminInstructorApplications />
          )}

          {/* ==========================================
              TAB: SERVICE CLIENTS
          ========================================== */}
          {activeTab === "service_clients" && (() => {
            const INQUIRY_PIPELINE: { key: InquiryStatus; label: string; color: string }[] = [
              { key: "new",        label: "Nouveau",    color: "bg-blue-50 text-blue-600" },
              { key: "contacted",  label: "Contacté",   color: "bg-yellow-50 text-yellow-600" },
              { key: "demo_done",  label: "Démo faite", color: "bg-purple-50 text-purple-600" },
              { key: "converted",  label: "Converti",   color: "bg-green-50 text-green-600" },
            ];

            const SVC_META: Record<string, { label: string; dot: string }> = {
              advisory:    { label: "Advisory",     dot: "bg-gold" },
              copytrading: { label: "Copy-Trading",  dot: "bg-blue-500" },
              otc:         { label: "OTC Desk",      dot: "bg-emerald-500" },
            };

            const SERVICE_LABELS: Record<string, { label: string; color: string; dot: string }> = {
              advisory:    { label: "Golden Advisory",     color: "bg-gold/10 text-gold border-gold/20",           dot: "bg-gold" },
              copytrading: { label: "Golden Copy-Trading", color: "bg-blue-50 text-blue-600 border-blue-200",      dot: "bg-blue-500" },
              otc:         { label: "Golden OTC Desk",     color: "bg-emerald-50 text-emerald-600 border-emerald-200", dot: "bg-emerald-500" },
            };
            const STATUS_COLORS: Record<string, string> = {
              active: "bg-green-50 text-green-600",
              paused: "bg-yellow-50 text-yellow-600",
              ended:  "bg-gray-100 text-gray-500",
            };
            return (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-heading font-bold text-dark">Service Clients</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{serviceClients.length} client(s) enregistré(s)</p>
                  </div>
                  <button
                    onClick={() => handleOpenClientForm()}
                    className="bg-primary hover:bg-primary-dark text-white font-semibold px-4 py-2 rounded-lg transition text-sm flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Ajouter un client
                  </button>
                </div>

                {/* ── Advisory / Copy-Trading Inquiries ── */}
                {(() => {
                  const nonOtcInquiries = serviceInquiries.filter(i => i.service !== "otc");
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-heading font-bold text-dark">Demandes Advisory & Copy-Trading</h3>
                        <span className="text-xs text-gray-400">{nonOtcInquiries.length} demande(s)</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {INQUIRY_PIPELINE.map(p => {
                          const count = nonOtcInquiries.filter(i => i.status === p.key).length;
                          return (
                            <div key={p.key} className={`rounded-xl p-4 ${p.color.replace("text-", "border-").replace("bg-", "bg-")} border`}>
                              <div className="text-2xl font-black">{count}</div>
                              <div className="text-xs font-semibold mt-0.5">{p.label}</div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {(["advisory", "copytrading"] as const).map(svc => {
                          const total     = nonOtcInquiries.filter(i => i.service === svc).length;
                          const converted = nonOtcInquiries.filter(i => i.service === svc && i.status === "converted").length;
                          const meta      = SVC_META[svc];
                          return (
                            <div key={svc} className="bg-white rounded-xl border border-gray-100 p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`w-2 h-2 rounded-full ${meta.dot}`} />
                                <span className="text-xs font-bold text-dark">{meta.label}</span>
                              </div>
                              <div className="text-xl font-black text-primary">{total}</div>
                              <div className="text-[10px] text-gray-400 mt-0.5">
                                dont <span className="text-green-600 font-bold">{converted} converti{converted > 1 ? "s" : ""}</span>
                              </div>
                              {total > 0 && (
                                <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-green-400 rounded-full" style={{ width: `${Math.round((converted / total) * 100)}%` }} />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {nonOtcInquiries.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left">
                              <thead className="bg-gray-50 text-gray-400 text-[11px] uppercase tracking-wider">
                                <tr>
                                  <th className="px-5 py-3 font-semibold">Contact</th>
                                  <th className="px-5 py-3 font-semibold">Service</th>
                                  <th className="px-5 py-3 font-semibold">Date</th>
                                  <th className="px-5 py-3 font-semibold">Statut</th>
                                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50">
                                {nonOtcInquiries.map(inq => {
                                  const meta = SVC_META[inq.service];
                                  const currentIdx = INQUIRY_PIPELINE.findIndex(p => p.key === inq.status);
                                  const nextStep = INQUIRY_PIPELINE[currentIdx + 1];
                                  return (
                                    <tr key={inq.id} className="hover:bg-gray-50/50 transition">
                                      <td className="px-5 py-3">
                                        <div className="font-semibold text-sm text-dark">{inq.full_name}</div>
                                        <div className="text-xs text-gray-400">{inq.email} · {inq.phone}</div>
                                      </td>
                                      <td className="px-5 py-3">
                                        <div className="flex items-center gap-1.5">
                                          <div className={`w-2 h-2 rounded-full ${meta?.dot ?? "bg-gray-400"}`} />
                                          <span className="text-xs font-semibold text-dark">{meta?.label ?? inq.service}</span>
                                        </div>
                                      </td>
                                      <td className="px-5 py-3 text-xs text-gray-400">{new Date(inq.created_at).toLocaleDateString("fr-FR")}</td>
                                      <td className="px-5 py-3">
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${INQUIRY_PIPELINE.find(p => p.key === inq.status)?.color ?? "bg-gray-100 text-gray-500"}`}>
                                          {INQUIRY_PIPELINE.find(p => p.key === inq.status)?.label ?? inq.status}
                                        </span>
                                      </td>
                                      <td className="px-5 py-3">
                                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                          {nextStep && (
                                            <button onClick={() => handleInquiryStatus(inq.id, nextStep.key)} className="text-[11px] font-bold px-2.5 py-1 rounded-lg border border-gray-200 hover:border-primary hover:text-primary text-gray-500 transition whitespace-nowrap">
                                              → {nextStep.label}
                                            </button>
                                          )}
                                          {inq.status !== "converted" && (
                                            <button onClick={() => handleConvertInquiry(inq)} className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition whitespace-nowrap">
                                              Convertir
                                            </button>
                                          )}
                                          <button onClick={() => handleDeleteInquiry(inq.id)} className="p-1.5 text-gray-300 hover:text-red-500 rounded hover:bg-gray-100 transition">
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div className="border-t border-gray-200" />

                {/* ── OTC Orders Pipeline ── */}
                {(() => {
                  const otcInquiries = serviceInquiries.filter(i => i.service === "otc");
                  const OTC_PIPELINE = [
                    { key: "new" as InquiryStatus,       label: "Demande reçue", color: "bg-blue-50 text-blue-600" },
                    { key: "contacted" as InquiryStatus,  label: "Devis envoyé",  color: "bg-yellow-50 text-yellow-600" },
                    { key: "demo_done" as InquiryStatus,  label: "Paiement reçu", color: "bg-purple-50 text-purple-600" },
                    { key: "converted" as InquiryStatus,  label: "Clôturé",       color: "bg-green-50 text-green-600" },
                  ];
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-heading font-bold text-dark flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                            Ordres OTC Desk
                          </h3>
                          <p className="text-[10px] text-gray-400 mt-0.5">Intermédiaire de conversion crypto / FCFA — commission 1.1%</p>
                        </div>
                        <span className="text-xs text-gray-400">{otcInquiries.length} ordre(s)</span>
                      </div>

                      {/* OTC pipeline stats */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {OTC_PIPELINE.map(p => {
                          const count = otcInquiries.filter(i => i.status === p.key).length;
                          return (
                            <div key={p.key} className={`rounded-xl p-4 ${p.color} border border-current/20`}>
                              <div className="text-2xl font-black">{count}</div>
                              <div className="text-xs font-semibold mt-0.5">{p.label}</div>
                            </div>
                          );
                        })}
                      </div>

                      {/* OTC orders table */}
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-400 text-[11px] uppercase tracking-wider">
                              <tr>
                                <th className="px-5 py-3 font-semibold">Client</th>
                                <th className="px-5 py-3 font-semibold">Conversion</th>
                                <th className="px-5 py-3 font-semibold">Délai</th>
                                <th className="px-5 py-3 font-semibold">Date</th>
                                <th className="px-5 py-3 font-semibold">Statut</th>
                                <th className="px-5 py-3 font-semibold text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {otcInquiries.length === 0 ? (
                                <tr>
                                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400 text-sm">
                                    Aucun ordre OTC pour l'instant
                                  </td>
                                </tr>
                              ) : otcInquiries.map(inq => {
                                const extra = inq.extra_data ?? {};
                                const currentStatus = OTC_PIPELINE.find(p => p.key === inq.status);
                                const currentIdx = OTC_PIPELINE.findIndex(p => p.key === inq.status);
                                const nextStep = OTC_PIPELINE[currentIdx + 1];
                                return (
                                  <tr key={inq.id} className="hover:bg-gray-50/50 transition">
                                    <td className="px-5 py-3">
                                      <div className="font-semibold text-sm text-dark">{inq.full_name}</div>
                                      <div className="text-xs text-gray-400">{inq.email} · {inq.phone}</div>
                                    </td>
                                    <td className="px-5 py-3">
                                      <div className="font-mono text-sm font-bold text-dark">
                                        {extra.amount ? Number(extra.amount).toLocaleString() : "—"} {extra.source_asset}
                                      </div>
                                      <div className="text-xs text-gray-400">→ {extra.target_asset ?? "—"}</div>
                                      {inq.admin_notes && inq.admin_notes.startsWith("[DEVIS]") && (
                                        <div className="text-[10px] text-emerald-600 font-semibold mt-0.5 max-w-xs truncate">{inq.admin_notes}</div>
                                      )}
                                    </td>
                                    <td className="px-5 py-3 text-xs text-gray-500">{extra.timeline ?? "—"}</td>
                                    <td className="px-5 py-3 text-xs text-gray-400">{new Date(inq.created_at).toLocaleDateString("fr-FR")}</td>
                                    <td className="px-5 py-3">
                                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${currentStatus?.color ?? "bg-gray-100 text-gray-500"}`}>
                                        {currentStatus?.label ?? inq.status}
                                      </span>
                                    </td>
                                    <td className="px-5 py-3">
                                      <div className="flex items-center justify-end gap-1.5">
                                        {inq.status === "new" && (
                                          <button
                                            onClick={() => handleOpenQuoteModal(inq)}
                                            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition whitespace-nowrap"
                                          >
                                            Envoyer devis
                                          </button>
                                        )}
                                        {nextStep && inq.status !== "new" && (
                                          <button
                                            onClick={() => handleInquiryStatus(inq.id, nextStep.key)}
                                            className="text-[11px] font-bold px-2.5 py-1 rounded-lg border border-gray-200 hover:border-emerald-500 hover:text-emerald-600 text-gray-500 transition whitespace-nowrap"
                                          >
                                            → {nextStep.label}
                                          </button>
                                        )}
                                        <button onClick={() => handleDeleteInquiry(inq.id)} className="p-1.5 text-gray-300 hover:text-red-500 rounded hover:bg-gray-100 transition">
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="border-t border-gray-200" />

                {/* ── Quote Modal ── */}
                {showQuoteModal && quoteTarget && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowQuoteModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                        <div>
                          <h3 className="font-heading font-bold text-primary">Envoyer un devis OTC</h3>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {quoteTarget.full_name} — {quoteTarget.extra_data?.amount} {quoteTarget.extra_data?.source_asset} → {quoteTarget.extra_data?.target_asset}
                          </p>
                        </div>
                        <button onClick={() => setShowQuoteModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Prix proposé ({quoteTarget.extra_data?.target_asset}) *</label>
                            <input
                              type="number" min="0" value={quoteForm.proposed_price}
                              onChange={e => setQuoteForm({ ...quoteForm, proposed_price: e.target.value })}
                              placeholder="ex: 450 000"
                              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Commission GoldenBridge (%)</label>
                            <input
                              type="number" step="0.1" value={quoteForm.fee_pct}
                              onChange={e => setQuoteForm({ ...quoteForm, fee_pct: e.target.value })}
                              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                            />
                          </div>
                        </div>

                        {/* Auto-calculated summary */}
                        {quoteForm.proposed_price && (
                          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-1.5 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Prix marché</span>
                              <span className="font-bold">{Number(quoteForm.proposed_price).toLocaleString()} {quoteTarget.extra_data?.target_asset}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Commission ({quoteForm.fee_pct}%)</span>
                              <span className="font-bold text-emerald-600">+ {(Number(quoteForm.proposed_price) * Number(quoteForm.fee_pct) / 100).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between border-t border-emerald-200 pt-1.5">
                              <span className="font-bold text-dark">Total client</span>
                              <span className="font-black text-primary">
                                {(Number(quoteForm.proposed_price) * (1 + Number(quoteForm.fee_pct) / 100)).toFixed(2)} {quoteTarget.extra_data?.target_asset}
                              </span>
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Valide jusqu'au</label>
                          <input
                            type="datetime-local" value={quoteForm.expires_at}
                            onChange={e => setQuoteForm({ ...quoteForm, expires_at: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Note au client</label>
                          <textarea
                            value={quoteForm.notes} rows={2}
                            onChange={e => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                            placeholder="Disponibilité, instructions de virement..."
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/40 resize-none"
                          />
                        </div>

                        <div className="flex gap-3 pt-1">
                          <button
                            onClick={handleSaveQuote} disabled={quoteLoading}
                            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-60 text-sm"
                          >
                            {quoteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Enregistrer & marquer "Devis envoyé"
                          </button>
                          <button onClick={() => setShowQuoteModal(false)} className="px-5 py-3 border border-gray-200 text-gray-500 hover:text-dark font-semibold rounded-xl text-sm transition">
                            Annuler
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-gray-400 text-[11px] uppercase tracking-wider">
                        <tr>
                          <th className="px-5 py-3 font-semibold">Client</th>
                          <th className="px-5 py-3 font-semibold">Service</th>
                          <th className="px-5 py-3 font-semibold">Apport</th>
                          <th className="px-5 py-3 font-semibold">Contrat</th>
                          <th className="px-5 py-3 font-semibold">Rendement</th>
                          <th className="px-5 py-3 font-semibold">Statut</th>
                          <th className="px-5 py-3 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {serviceClients.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">
                              <Briefcase className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                              Aucun client enregistré
                            </td>
                          </tr>
                        ) : serviceClients.map((c) => {
                          const svc = SERVICE_LABELS[c.service] ?? { label: c.service, color: "bg-gray-100 text-gray-500 border-gray-200", dot: "bg-gray-400" };
                          const durationYears = c.contract_duration_months >= 12
                            ? `${Math.floor(c.contract_duration_months / 12)} an${Math.floor(c.contract_duration_months / 12) > 1 ? "s" : ""}`
                            : `${c.contract_duration_months} mois`;
                          return (
                            <tr key={c.id} className="hover:bg-gray-50/50 transition">
                              <td className="px-5 py-4">
                                <div className="font-semibold text-sm text-dark">{c.user.username}</div>
                                <div className="text-xs text-gray-400">{c.user.email}</div>
                              </td>
                              <td className="px-5 py-4">
                                <span className={`inline-flex items-center gap-1.5 border text-xs font-bold px-2.5 py-1 rounded-full ${svc.color}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${svc.dot}`} />
                                  {svc.label}
                                </span>
                              </td>
                              <td className="px-5 py-4 font-mono text-sm font-bold text-dark">
                                ${parseFloat(c.investment_amount).toLocaleString()}
                              </td>
                              <td className="px-5 py-4 text-xs text-gray-500">
                                <div>{new Date(c.contract_start).toLocaleDateString("fr-FR")}</div>
                                <div className="text-gray-400">→ {c.contract_end ? new Date(c.contract_end).toLocaleDateString("fr-FR") : "—"} ({durationYears})</div>
                              </td>
                              <td className="px-5 py-4 font-bold text-green-600 text-sm">
                                {c.expected_return_rate}%
                              </td>
                              <td className="px-5 py-4">
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[c.status] ?? "bg-gray-100 text-gray-500"}`}>
                                  {c.status}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => handleOpenReportModal(c)}
                                    title="Ajouter rapport mensuel"
                                    className="p-1.5 text-gray-300 hover:text-emerald-600 rounded hover:bg-emerald-50 transition"
                                  >
                                    <ClipboardList className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => handleOpenClientForm(c)} className="p-1.5 text-gray-300 hover:text-primary rounded hover:bg-gray-100 transition">
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => handleDeleteClient(c.id)} className="p-1.5 text-gray-300 hover:text-red-500 rounded hover:bg-gray-100 transition">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ── Report Modal ── */}
                {showReportModal && reportTargetClient && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowReportModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                        <div>
                          <h3 className="font-heading font-bold text-primary">Rapport mensuel</h3>
                          <p className="text-xs text-gray-400 mt-0.5">{reportTargetClient.user.username} — {SERVICE_LABELS[reportTargetClient.service]?.label}</p>
                        </div>
                        <button onClick={() => setShowReportModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-6 space-y-4">
                        {/* Period */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Mois *</label>
                            <select
                              value={reportForm.period_month}
                              onChange={e => setReportForm({ ...reportForm, period_month: Number(e.target.value) })}
                              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 bg-white"
                            >
                              {["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"].map((m, i) => (
                                <option key={i+1} value={i+1}>{m}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Année *</label>
                            <input
                              type="number"
                              value={reportForm.period_year}
                              onChange={e => setReportForm({ ...reportForm, period_year: Number(e.target.value) })}
                              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                            />
                          </div>
                        </div>

                        {/* Values */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Valeur du portefeuille (USD) *</label>
                            <input
                              type="number"
                              value={reportForm.portfolio_value}
                              onChange={e => setReportForm({ ...reportForm, portfolio_value: e.target.value })}
                              placeholder="12500"
                              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Rendement du mois (%) *</label>
                            <input
                              type="number"
                              step="0.01"
                              value={reportForm.return_pct}
                              onChange={e => setReportForm({ ...reportForm, return_pct: e.target.value })}
                              placeholder="3.5"
                              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                            />
                          </div>
                        </div>

                        {/* Notes */}
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Message au client</label>
                          <textarea
                            value={reportForm.notes}
                            onChange={e => setReportForm({ ...reportForm, notes: e.target.value })}
                            rows={3}
                            placeholder="Bonne performance ce mois, le marché a bien réagi..."
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 resize-none"
                          />
                        </div>

                        {/* Existing reports for this client */}
                        {(clientReports[reportTargetClient.id] || []).length > 0 && (
                          <div>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Rapports précédents</div>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {(clientReports[reportTargetClient.id] || []).map(r => {
                                const monthNames = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Aoû","Sep","Oct","Nov","Déc"];
                                return (
                                  <div key={r.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                                    <div>
                                      <span className="text-xs font-bold text-dark">{monthNames[r.period_month - 1]} {r.period_year}</span>
                                      <span className="text-xs text-gray-400 mx-2">·</span>
                                      <span className="text-xs font-bold text-primary">${parseFloat(r.portfolio_value).toLocaleString()}</span>
                                      <span className={`text-xs font-bold ml-2 ${parseFloat(r.return_pct) >= 0 ? "text-green-600" : "text-red-500"}`}>
                                        {parseFloat(r.return_pct) >= 0 ? "+" : ""}{r.return_pct}%
                                      </span>
                                    </div>
                                    <button onClick={() => handleDeleteReport(reportTargetClient.id, r.id)} className="p-1 text-gray-300 hover:text-red-500 transition">
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={handleSaveReport}
                            disabled={reportFormLoading}
                            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-60 text-sm"
                          >
                            {reportFormLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardList className="w-4 h-4" />}
                            Enregistrer le rapport
                          </button>
                          <button onClick={() => setShowReportModal(false)} className="px-5 py-3 border border-gray-200 text-gray-500 hover:text-dark font-semibold rounded-xl text-sm transition">
                            Fermer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal form */}
                {showClientForm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowClientForm(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                        <h3 className="font-heading font-bold text-primary">{editingClient ? "Modifier le client" : "Nouveau client"}</h3>
                        <button onClick={() => setShowClientForm(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-6 space-y-4">
                        {/* User ID */}
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">User ID *</label>
                          <input
                            type="number"
                            value={clientForm.user_id || ""}
                            onChange={e => setClientForm({ ...clientForm, user_id: Number(e.target.value) })}
                            placeholder="ID de l'utilisateur"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                          />
                          <p className="text-[10px] text-gray-400 mt-1">Retrouvable dans l'onglet Users</p>
                        </div>

                        {/* Service */}
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Service *</label>
                          <select
                            value={clientForm.service}
                            onChange={e => setClientForm({ ...clientForm, service: e.target.value as ServiceType })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 bg-white"
                          >
                            <option value="advisory">Golden Advisory</option>
                            <option value="copytrading">Golden Copy-Trading</option>
                            <option value="otc">Golden OTC Desk</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {/* Apport */}
                          <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Apport (USD) *</label>
                            <input
                              type="number"
                              value={clientForm.investment_amount}
                              onChange={e => setClientForm({ ...clientForm, investment_amount: e.target.value })}
                              placeholder="5000"
                              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                            />
                          </div>
                          {/* Rendement */}
                          <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Rendement (%) *</label>
                            <input
                              type="number"
                              step="0.1"
                              value={clientForm.expected_return_rate}
                              onChange={e => setClientForm({ ...clientForm, expected_return_rate: e.target.value })}
                              placeholder="14.5"
                              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {/* Début */}
                          <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Début contrat *</label>
                            <input
                              type="date"
                              value={clientForm.contract_start}
                              onChange={e => setClientForm({ ...clientForm, contract_start: e.target.value })}
                              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                            />
                          </div>
                          {/* Durée */}
                          <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Durée (mois) *</label>
                            <select
                              value={clientForm.contract_duration_months}
                              onChange={e => setClientForm({ ...clientForm, contract_duration_months: Number(e.target.value) })}
                              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 bg-white"
                            >
                              {[3, 6, 9, 12, 18, 24, 36].map(m => (
                                <option key={m} value={m}>{m >= 12 ? `${m / 12} an${m > 12 ? "s" : ""}` : `${m} mois`}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Statut */}
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Statut</label>
                          <select
                            value={clientForm.status}
                            onChange={e => setClientForm({ ...clientForm, status: e.target.value as SubscriptionStatus })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 bg-white"
                          >
                            <option value="active">Actif</option>
                            <option value="paused">En pause</option>
                            <option value="ended">Terminé</option>
                          </select>
                        </div>

                        {/* Notes */}
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Notes internes</label>
                          <textarea
                            value={clientForm.notes}
                            onChange={e => setClientForm({ ...clientForm, notes: e.target.value })}
                            rows={3}
                            placeholder="Infos complémentaires, commentaires..."
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 resize-none"
                          />
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={handleSaveClient}
                            disabled={clientFormLoading}
                            className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition disabled:opacity-60 text-sm"
                          >
                            {clientFormLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            {editingClient ? "Enregistrer les modifications" : "Créer le client"}
                          </button>
                          <button onClick={() => setShowClientForm(false)} className="px-5 py-3 border border-gray-200 text-gray-500 hover:text-dark font-semibold rounded-xl text-sm transition">
                            Annuler
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {activeTab === "earn_requests" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-heading font-bold text-primary">Earn Access Requests</h2>
                  <p className="text-sm text-gray-400 mt-0.5">Review and approve demo requests to unlock Earn access.</p>
                </div>
                <span className="bg-gold/10 text-gold text-xs font-bold px-3 py-1.5 rounded-full border border-gold/20">
                  {earnRequests.filter(r => r.status === "pending").length} pending
                </span>
              </div>

              {earnRequestsLoading && (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}

              {!earnRequestsLoading && earnRequests.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                  <Target className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No access requests yet.</p>
                </div>
              )}

              {!earnRequestsLoading && earnRequests.length > 0 && (
                <div className="space-y-4">
                  {earnRequests.map((req) => (
                    <div key={req.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-primary">{req.full_name}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              req.status === "approved" ? "bg-green-50 text-green-600" :
                              req.status === "rejected" ? "bg-red-50 text-red-500" :
                              "bg-yellow-50 text-yellow-600"
                            }`}>
                              {req.status ?? "pending"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{req.email} · {req.phone} · {req.country}</p>
                          {req.preferred_time && (
                            <p className="text-xs text-gray-400">Preferred call: <span className="font-medium">{req.preferred_time}</span></p>
                          )}
                          {req.reason && (
                            <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-lg px-3 py-2 italic">"{req.reason}"</p>
                          )}
                        </div>
                        {(!req.status || req.status === "pending") && (
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => handleApproveEarnRequest(req.id)}
                              className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => handleRejectEarnRequest(req.id)}
                              className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-500 text-xs font-bold px-4 py-2 rounded-lg transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};


// ==========================================
// SUB-COMPONENTS
// ==========================================

const StatCard = ({ label, value, sub }: { label: string; value: string; sub: string }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
    <p className="text-2xl font-heading font-bold text-primary mt-1">{value}</p>
    <p className="text-[11px] text-gray-400 mt-1">{sub}</p>
  </div>
);

const ContractRow = ({ label, address, onCopy }: { label: string; address: string; onCopy: (s: string) => void }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm text-gray-500">{label}</span>
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs text-gray-600">{`${address.slice(0, 10)}...${address.slice(-8)}`}</span>
      <button onClick={() => onCopy(address)} className="text-gray-300 hover:text-primary transition">
        <Copy className="w-3 h-3" />
      </button>
    </div>
  </div>
);

export default AdminDashboard;
