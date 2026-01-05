import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section id="home" className="pt-32 pb-20 px-6 bg-white overflow-hidden relative">
      
      {/* Petit effet de dégradé en arrière plan (Optionnel, subtil) */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-50/30 -z-10 rounded-bl-[100px]"></div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        
        {/* --- TEXTE --- */}
        <div className="space-y-6">
          {/* Petit badge Web3 */}
          <div className="inline-block bg-blue-100 text-primary px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider">
            WEB3 INVESTMENT v2.0
          </div>

          <h1 className="text-5xl md:text-6xl font-heading font-bold text-primary leading-tight">
            The Next Generation <br />
            of Web3 Investing <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-500">
              Future is Now
            </span>
          </h1>
          
          <p className="text-dark text-lg max-w-lg leading-relaxed font-body">
            GoldenBridge connects traditional finance with blockchain technology, 
            providing secure, transparent, and high-yield investment opportunities.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            {/* Bouton Principal : Bleu Profond (Confiance) */}
            <button className="bg-primary hover:bg-blue-900 text-white px-8 py-3.5 rounded-lg font-heading font-bold text-lg transition shadow-lg flex items-center justify-center gap-2">
              Start Investing 
              <ArrowRight className="w-5 h-5 text-gold" />
            </button>
            
            {/* Bouton Secondaire : Contour Or ou Bleu */}
            <button className="border-2 border-gray-200 hover:border-gold text-dark hover:text-primary px-8 py-3.5 rounded-lg font-heading font-bold text-lg transition flex items-center justify-center bg-white">
              Explore Opportunities
            </button>
          </div>

          {/* Indicateurs de confiance (Chiffres Tech) */}
          <div className="pt-8 flex gap-8 border-t border-gray-100 mt-8">
            <div>
              <p className="text-3xl font-mono font-bold text-primary">$40M+</p>
              <p className="text-sm text-gray-500">TVL Locked</p>
            </div>
            <div>
              <p className="text-3xl font-mono font-bold text-primary">12.5%</p>
              <p className="text-sm text-gray-500">Avg APY</p>
            </div>
          </div>
        </div>

        {/* --- ILLUSTRATION (Mise à jour avec tes couleurs) --- */}
        <div className="relative flex justify-center">
          {/* Cercle de fond jaune très pâle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gold-light rounded-full opacity-60 -z-10 blur-xl"></div>
          
          <svg viewBox="0 0 400 400" className="w-full max-w-md drop-shadow-xl">
            {/* Grand cercle contour (Bleu Profond) */}
            <circle cx="200" cy="200" r="180" fill="white" stroke="#1E3A8A" strokeWidth="2" strokeOpacity="0.1" />
            
            {/* Connexions (Lignes en Bleu Secondaire #3B82F6) */}
            <g stroke="#3B82F6" strokeWidth="2">
                <line x1="100" y1="200" x2="150" y2="150" />
                <line x1="150" y1="150" x2="250" y2="150" />
                <line x1="250" y1="150" x2="300" y2="200" />
                <line x1="150" y1="150" x2="150" y2="250" />
                <line x1="250" y1="150" x2="250" y2="250" />
                <line x1="150" y1="250" x2="250" y2="250" />
                <line x1="250" y1="250" x2="300" y2="200" />
                <line x1="150" y1="250" x2="100" y2="200" />
            </g>
            
            {/* Noeuds (Points OR #FACC15 - Ta couleur premium) */}
            <circle cx="150" cy="150" r="14" fill="#FACC15" />
            <circle cx="250" cy="150" r="14" fill="#FACC15" />
            <circle cx="150" cy="250" r="14" fill="#FACC15" />
            <circle cx="250" cy="250" r="14" fill="#FACC15" />
            
            {/* Noeuds secondaires (Bleu Profond #1E3A8A) */}
            <circle cx="100" cy="200" r="10" fill="#1E3A8A" />
            <circle cx="300" cy="200" r="10" fill="#1E3A8A" />
            
            {/* Icones flottantes décoratives */}
            <rect x="50" y="250" width="40" height="50" rx="8" fill="white" stroke="#1E3A8A" strokeWidth="2" />
            <line x1="60" y1="275" x2="80" y2="275" stroke="#1E3A8A" strokeWidth="2" />
            <line x1="70" y1="265" x2="70" y2="285" stroke="#1E3A8A" strokeWidth="2" />

            <rect x="310" y="150" width="40" height="50" rx="8" fill="white" stroke="#FACC15" strokeWidth="2" />
            <circle cx="330" cy="165" r="3" fill="#FACC15" />
            <circle cx="330" cy="175" r="3" fill="#FACC15" />
            <circle cx="330" cy="185" r="3" fill="#FACC15" />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default Hero;