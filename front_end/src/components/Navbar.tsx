import React, { useState, useEffect } from "react";
import { Globe, Menu, X, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { useWeb3 } from "../hooks/useWeb3";
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const { connectWallet, account, isConnected, chainId } = useWeb3();

    const getNetworkName = () => {
      if (chainId === 11155111) return "Sepolia";
      if (chainId === 1) return "Ethereum";
      if (chainId === 31337) return "Ganache";
      return chainId ? `Network ${chainId}` : "Disconnected";
    };

  const formatAddress = (addr: string | null) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Investments", href: "/staking" },
    { name: "Performance", href: "/#performance" },
    { name: "Team", href: "/#team" },
    { name: "About", href: "/#about" },
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

          <button className="flex items-center gap-1 text-dark hover:text-gold font-medium text-[15px]">
            <Globe className="w-4 h-4" /> EN
          </button>
        </div>

        {/* BOUTONS D'ACTION */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            to="/signin"
            className="px-6 py-2 rounded-md border border-gold text-primary font-heading font-semibold hover:bg-gold/10 transition"
          >
            Sign In
          </Link>

          {/* BOUTON CONNECT WALLET DYNAMIQUE */}
          <button
            onClick={connectWallet}
            disabled={isConnected}
            className="bg-gold hover:bg-gold-hover text-white px-6 py-2 rounded-md font-heading font-semibold transition shadow-sm flex items-center gap-2"
          >
            {isConnected ? (
              <>
                <Wallet className="w-4 h-4" />
                <div className="text-left">
                  <div className="text-xs opacity-80">{getNetworkName()}</div>
                  <div>{formatAddress(account)}</div>
                </div>
              </>
            ) : (
              "Connect Wallet"
            )}
          </button>
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button
          className="lg:hidden text-primary"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

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
            <Link
              to="/signin"
              className="w-full py-3 rounded-lg border border-gold text-primary font-bold text-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign In
            </Link>

            <button
              onClick={() => {
                connectWallet();
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-3 rounded-lg bg-gold text-white font-bold flex justify-center items-center gap-2"
            >
              {isConnected ? (
                <>
                  <Wallet className="w-4 h-4" />
                  {formatAddress(account)}
                </>
              ) : (
                "Connect Wallet"
              )}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
