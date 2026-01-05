import { useState, useEffect } from 'react';
import { Globe, Menu, X, Wallet } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
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
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-4' : 'bg-white/90 backdrop-blur-sm py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        
        {/* LOGO : Or + Bleu Profond */}
        <div className="text-2xl font-heading font-bold text-primary tracking-tight">
          Golden<span className="text-gold">Bridge</span>
        </div>

        {/* MENU DESKTOP */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className="text-dark font-body font-medium hover:text-secondary transition text-sm uppercase tracking-wide"
            >
              {link.name}
            </a>
          ))}
          
          <button className="flex items-center gap-1 text-dark hover:text-secondary font-medium text-sm">
            <Globe className="w-4 h-4" /> EN
          </button>
        </div>

        {/* ACTIONS */}
        <div className="hidden md:flex items-center space-x-4">
          <button className="text-primary font-heading font-bold hover:text-secondary transition px-4 py-2">
            Sign In
          </button>
          {/* Bouton Or pour le Premium/Wallet */}
          <button className="bg-gold hover:bg-gold-hover text-primary font-heading font-bold px-6 py-2.5 rounded-lg transition shadow-md flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </button>
        </div>

        {/* MOBILE TOGGLE */}
        <button className="md:hidden text-primary" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute top-full left-0 w-full shadow-lg py-6 px-6 flex flex-col space-y-4">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="text-dark font-heading font-bold text-lg" onClick={() => setIsMobileMenuOpen(false)}>
              {link.name}
            </a>
          ))}
          <button className="bg-primary text-white w-full py-3 rounded-lg font-bold">Sign In</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;