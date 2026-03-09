import { useState, useEffect } from "react";
import { Globe, Menu, X, Wallet, LogOut, User, LayoutDashboard, Target, BookOpen } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useWeb3 } from "../hooks/useWeb3";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { connectWallet, account, isConnected } = useWeb3();
  const { user, isLoggedIn, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Base links available to everyone
  const baseLinks = [
    { name: "Accueil", href: "/" },
    { name: "Academy", href: "/academy" },
    { name: "Golden Earn", href: "/earn" },
  ];

  // Links for authenticated students
  const studentLinks = [
    { name: "Mes Formations", href: "/academy/my-learning", icon: <BookOpen className="w-4 h-4" /> },
    { name: "Coaching", href: "/academy/coaching", icon: <Target className="w-4 h-4" /> },
  ];

  // General admin/instructor flag
  const isInstructor = user?.role === "instructor";
  const isAdmin = user?.role === "admin";
  const isAdminOrInstructor = isAdmin || isInstructor;

  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm py-3" : "bg-white py-5"
        }`}
    >
      <div className="max-w-7xl mx-auto px-8 flex justify-between items-center gap-8">
        {/* LOGO */}
        <Link
          to="/"
          className="text-2xl font-heading font-bold text-gold tracking-tight flex items-center gap-2"
        >
          <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center text-white text-xs">GB</div>
          GoldenBridge
        </Link>

        {/* MENU DESKTOP */}
        <div className="hidden lg:flex items-center space-x-5 flex-1 justify-center">
          {baseLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`font-body font-medium text-[14px] transition hover:text-gold ${location.pathname === link.href ? "text-gold" : "text-dark/70"
                }`}
            >
              {link.name}
            </Link>
          ))}

          {isLoggedIn && (
            <>
              <div className="h-4 w-[1px] bg-gray-200 mx-2"></div>

              {/* Student specific links (learning) - shown to everyone authenticated */}
              {studentLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`font-body font-medium text-[14px] transition hover:text-gold flex items-center gap-2 ${location.pathname === link.href ? "text-gold" : "text-dark/70"
                    }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}

              {/* Roles-specific portals */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`font-body font-bold text-[14px] transition hover:text-gold flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gold/5 border border-gold/10 ${location.pathname === "/admin" ? "text-gold bg-gold/10" : "text-gold"
                    }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Administration
                </Link>
              )}

              {isInstructor && (
                <Link
                  to="/instructor"
                  className={`font-body font-bold text-[14px] transition hover:text-gold flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/5 border border-blue-500/10 ${location.pathname === "/instructor" ? "text-blue-500 bg-blue-500/10" : "text-blue-500"
                    }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Espace Formateur
                </Link>
              )}
            </>
          )}

          <button className="flex items-center gap-1 text-dark/70 hover:text-gold font-medium text-[14px]">
            <Globe className="w-4 h-4" /> FR
          </button>
        </div>

        {/* BOUTONS D'ACTION */}
        <div className="hidden lg:flex items-center gap-4">
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                <div className="w-6 h-6 bg-gold/10 rounded-full flex items-center justify-center text-gold">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="text-[13px] font-bold text-primary">{user?.username}</span>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-500 transition group"
                title="Déconnexion"
              >
                <LogOut className="w-5 h-5 group-hover:translate-x-0.5 transition" />
              </button>
            </div>
          ) : (
            <Link
              to="/signin"
              className="px-6 py-2 rounded-xl border border-gold/30 text-primary font-heading font-bold text-sm hover:bg-gold hover:text-white hover:border-gold transition shadow-sm"
            >
              Connexion
            </Link>
          )}

          {isConnected ? (
            <div className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-mono text-xs shadow-lg shadow-primary/10 border border-primary-light">
              <Wallet className="w-3.5 h-3.5 text-gold" />
              {truncateAddress(account!)}
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="bg-gold hover:bg-gold-hover text-white px-6 py-2 rounded-xl font-heading font-bold text-sm transition shadow-md shadow-gold/20"
            >
              Link Wallet
            </button>
          )}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button
          className="lg:hidden text-primary p-2 hover:bg-gray-50 rounded-lg transition"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* MENU MOBILE */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 absolute top-full left-0 w-full shadow-2xl py-8 px-6 flex flex-col space-y-6 animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 gap-4">
            {baseLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`font-heading font-bold text-lg flex items-center justify-between p-4 rounded-2xl ${location.pathname === link.href ? "bg-gold/10 text-gold" : "bg-gray-50 text-dark"
                  }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
                {location.pathname === link.href && <div className="w-2 h-2 bg-gold rounded-full"></div>}
              </Link>
            ))}
          </div>

          {isLoggedIn && (
            <div className="space-y-4">
              <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] px-4">Mon Apprentissage</div>
              <div className="grid grid-cols-1 gap-3">
                {studentLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`font-body font-bold text-md flex items-center gap-4 p-4 rounded-2xl border transition ${location.pathname === link.href ? "bg-gold/5 border-gold/20 text-gold shadow-sm" : "bg-white border-gray-100 text-dark/70"
                      }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className={`${location.pathname === link.href ? "text-gold" : "text-gray-400"}`}>
                      {link.icon}
                    </div>
                    {link.name}
                  </Link>
                ))}
              </div>

              {isAdminOrInstructor && (
                <>
                  <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] px-4 mt-4">Espace Pro</div>
                  <div className="grid grid-cols-1 gap-3">
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className={`font-bold text-md flex items-center gap-4 p-4 rounded-2xl border transition ${location.pathname === "/admin" ? "bg-gold/5 border-gold/20 text-gold shadow-sm" : "bg-primary text-white"
                          }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <LayoutDashboard className="w-5 h-5 text-gold" />
                        Administration
                      </Link>
                    )}
                    {isInstructor && (
                      <Link
                        to="/instructor"
                        className={`font-bold text-md flex items-center gap-4 p-4 rounded-2xl border transition ${location.pathname === "/instructor" ? "bg-blue-500/5 border-blue-500/20 text-blue-500 shadow-sm" : "bg-blue-600 text-white"
                          }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <LayoutDashboard className="w-5 h-5 text-white" />
                        Espace Formateur
                      </Link>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-gray-100">
            {isLoggedIn ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                  <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center text-gold font-bold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-primary">{user?.username}</div>
                    <div className="text-xs text-gray-400">{user?.role}</div>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="w-full py-4 rounded-2xl bg-red-50 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition"
                >
                  <LogOut className="w-5 h-5" /> Déconnexion
                </button>
              </div>
            ) : (
              <Link
                to="/signin"
                className="w-full py-4 rounded-2xl bg-gold text-white font-bold text-center shadow-lg shadow-gold/20"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Connexion
              </Link>
            )}

            <div className="mt-4">
              {isConnected ? (
                <div className="w-full py-4 rounded-2xl bg-primary text-white font-mono text-sm text-center border border-primary-light">
                  <Wallet className="w-4 h-4 inline mr-2 text-gold" />
                  {truncateAddress(account!)}
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="w-full py-4 rounded-2xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition"
                >
                  Connecter Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
