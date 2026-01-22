import { Twitter, Linkedin, Send, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary pt-16 pb-8 text-white border-t border-blue-800">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* --- GRILLE PRINCIPALE (4 Colonnes) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Col 1 : Brand & Socials */}
          <div className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-gold">
              Golden<span className="text-white">Bridge</span>
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              Connecting traditional finance with blockchain technology for secure, transparent investments.
            </p>
            {/* Icônes Réseaux Sociaux */}
            <div className="flex space-x-4">
              {[Twitter, Linkedin, Send, MessageCircle].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center hover:bg-gold hover:text-primary transition duration-300">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 : Quick Links */}
          <div>
            <h3 className="text-gold font-bold mb-6">Quick Links</h3>
            <ul className="space-y-4 text-gray-300 text-sm">
              <li><a href="#home" className="hover:text-gold transition">Home</a></li>
              <li><a href="#investments" className="hover:text-gold transition">Investments</a></li>
              <li><a href="#performance" className="hover:text-gold transition">Performance</a></li>
              <li><a href="#team" className="hover:text-gold transition">Team</a></li>
              <li><a href="#about" className="hover:text-gold transition">About Us</a></li>
            </ul>
          </div>

          {/* Col 3 : Resources */}
          <div>
            <h3 className="text-gold font-bold mb-6">Resources</h3>
            <ul className="space-y-4 text-gray-300 text-sm">
              <li><a href="#" className="hover:text-gold transition">Documentation</a></li>
              <li><a href="#" className="hover:text-gold transition">Blog</a></li>
              <li><a href="#" className="hover:text-gold transition">FAQs</a></li>
              <li><a href="#" className="hover:text-gold transition">Security</a></li>
              <li><a href="#" className="hover:text-gold transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-gold transition">Terms of Service</a></li>
            </ul>
          </div>

          {/* Col 4 : Subscribe */}
          <div>
            <h3 className="text-gold font-bold mb-6">Subscribe</h3>
            <p className="text-gray-300 text-sm mb-4">
              Get the latest updates on market trends and investment opportunities.
            </p>
            <form className="space-y-3">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="w-full px-4 py-3 rounded bg-white text-dark focus:outline-none focus:ring-2 focus:ring-gold"
              />
              <button className="w-full bg-gold hover:bg-gold-hover text-primary font-bold py-3 rounded transition shadow-lg">
                Subscribe
              </button>
            </form>
          </div>

        </div>

        {/* --- BARRE DE BAS DE PAGE (Copyright) --- */}
        <div className="border-t border-blue-800 pt-8 text-center">
          <p className="text-gray-400 text-sm mb-2">
            &copy; 2024 GoldenBridge. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs max-w-2xl mx-auto">
            Disclaimer: Cryptocurrency investments are subject to market risks. Past performance is not an indicator of future returns.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;