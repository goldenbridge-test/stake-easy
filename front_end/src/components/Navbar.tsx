import React, { useState, useEffect } from 'react';
import { Globe, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Investments', href: '#investments' },
    { name: 'Performance', href: '#performance' },
    { name: 'Team', href: '#team' },
    { name: 'About', href: '#about' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-sm py-3' : 'bg-white py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        
        <div className="text-2xl font-heading font-bold text-gold tracking-tight">
          GoldenBridge
        </div>

        <div className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className="text-dark font-body font-medium text-[15px] hover:text-gold transition"
            >
              {link.name}
            </a>
          ))}
          
          <button className="flex items-center gap-1 text-dark hover:text-gold font-medium text-[15px]">
            <Globe className="w-4 h-4" /> EN
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          
          <button className="px-6 py-2 rounded-md border border-gold text-primary font-heading font-semibold hover:bg-gold/10 transition">
            Sign In
          </button>

          <button className="bg-gold hover:bg-gold-hover text-white px-6 py-2 rounded-md font-heading font-semibold transition shadow-sm">
            Connect Wallet
          </button>
        </div>

        {/* MENU MOBILE TOGGLE */}
        <button className="lg:hidden text-primary" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* MENU MOBILE (Responsive) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 absolute top-full left-0 w-full shadow-lg py-6 px-6 flex flex-col space-y-4">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="text-dark font-heading font-bold text-lg" onClick={() => setIsMobileMenuOpen(false)}>
              {link.name}
            </a>
          ))}
          <div className="flex flex-col gap-3 mt-4">
            <button className="w-full py-3 rounded-lg border border-gold text-primary font-bold">Sign In</button>
            <button className="w-full py-3 rounded-lg bg-gold text-white font-bold">Connect Wallet</button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;