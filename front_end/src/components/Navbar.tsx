import React, { useState, useEffect } from "react";
import { Globe, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    
    // Vérifier si l'utilisateur est connecté
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem('access_token'));
    };
    checkAuth();
    
    // Écouter les changements de localStorage
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Trading Bot", href: "/arima" },
    { name: "Staking", href: "/staking" },
  ];

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-sm py-3" : "bg-white py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* LOGO */}
        <Link
          to="/"
          className="text-2xl font-heading font-bold text-gold tracking-tight"
        >
          GoldenBridge
        </Link>

        {/* MENU DESKTOP */}
        <div className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-dark font-body font-medium text-[15px] hover:text-gold transition"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* BOUTONS D'ACTION (Desktop) */}
        <div className="hidden lg:flex items-center gap-4">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="bg-gold hover:bg-gold-hover text-white px-6 py-2 rounded-md font-heading font-semibold transition shadow-sm"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/signin"
              className="bg-gold hover:bg-gold-hover text-white px-6 py-2 rounded-md font-heading font-semibold transition shadow-sm"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button
          className="lg:hidden text-primary"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* MENU MOBILE */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 absolute top-full left-0 w-full shadow-lg py-6 px-6 flex flex-col space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-dark font-heading font-bold text-lg"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="flex flex-col gap-3 mt-4">
            {isLoggedIn ? (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-3 rounded-lg bg-gold text-white font-bold"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/signin"
                className="w-full py-3 rounded-lg bg-gold text-white font-bold text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
