import React from 'react';
import { ArrowRight } from 'lucide-react';

const CallToAction = () => {
  return (
    <section className="bg-primary relative overflow-hidden py-24">
      
      {/* --- FOND ANIMÉ / MOTIF BLOCKCHAIN (SVG CSS) --- */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.1"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid-pattern)" />
        </svg>
        {/* Effet de lumière bleue */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-blue-400/20 to-transparent"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center text-white">
        
        {/* Titre */}
        <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 leading-tight">
          Ready to Start Your <br/> Web3 Investment Journey?
        </h2>
        
        {/* Texte */}
        <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
          Join thousands of investors already benefiting from our professional asset management services and transparent approach to Web3 investing.
        </p>

        {/* Boutons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <button className="bg-gold hover:bg-gold-hover text-primary font-heading font-bold px-8 py-4 rounded-lg shadow-lg transition transform hover:-translate-y-1 flex items-center justify-center gap-2">
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </button>
          <button className="bg-white hover:bg-gray-100 text-primary font-heading font-bold px-8 py-4 rounded-lg shadow-lg transition transform hover:-translate-y-1">
            Schedule a Demo
          </button>
        </div>

        {/* Statistiques (Stats Footer) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-10">
          <div>
            <div className="text-3xl font-mono font-bold text-gold mb-1">24/7</div>
            <div className="text-sm text-blue-200">Portfolio Monitoring</div>
          </div>
          <div>
            <div className="text-3xl font-mono font-bold text-gold mb-1">3+</div>
            <div className="text-sm text-blue-200">Years of Experience</div>
          </div>
          <div>
            <div className="text-3xl font-mono font-bold text-gold mb-1">0%</div>
            <div className="text-sm text-blue-200">Entry Fees</div>
          </div>
          <div>
            <div className="text-3xl font-mono font-bold text-gold mb-1">100%</div>
            <div className="text-sm text-blue-200">Transparent</div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default CallToAction;