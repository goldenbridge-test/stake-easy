import { ArrowRight } from 'lucide-react';

const Hero = () => {
  const stats = [
    { value: "$120M+", label: "Assets Under Management" },
    { value: "15%", label: "Average Annual Return" },
    { value: "5,000+", label: "Investors Worldwide" },
    { value: "24/7", label: "Real-time Monitoring" },
  ];

  return (
    <section id="home" className="pt-32 pb-20 px-6 bg-blue-50/30 overflow-hidden relative">
      
      <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-100/20 -z-10 rounded-bl-[100px]"></div>

      <div className="max-w-7xl mx-auto">
        
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          
          {/* TEXTE */}
          <div className="space-y-6">


            <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary leading-tight">
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
              <button className="bg-primary hover:bg-blue-900 text-white px-8 py-3.5 rounded-lg font-heading font-bold text-lg transition shadow-lg flex items-center justify-center gap-2">
                Start Investing 
                <ArrowRight className="w-5 h-5 text-gold" />
              </button>
              
              <button className="border-2 border-gray-200 hover:border-gold text-dark hover:text-primary px-8 py-3.5 rounded-lg font-heading font-bold text-lg transition flex items-center justify-center bg-white">
                Explore Opportunities
              </button>
            </div>
          </div>

          {/* ILLUSTRATION (SVG) */}
          <div className="relative flex justify-center">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gold-light rounded-full opacity-60 -z-10 blur-xl"></div>
            
            <svg viewBox="0 0 400 400" className="w-full max-w-md drop-shadow-xl animate-pulse-slow">
              <circle cx="200" cy="200" r="180" fill="white" stroke="#1E3A8A" strokeWidth="2" strokeOpacity="0.1" />
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
              <circle cx="150" cy="150" r="14" fill="#FACC15" />
              <circle cx="250" cy="150" r="14" fill="#FACC15" />
              <circle cx="150" cy="250" r="14" fill="#FACC15" />
              <circle cx="250" cy="250" r="14" fill="#FACC15" />
              <circle cx="100" cy="200" r="10" fill="#1E3A8A" />
              <circle cx="300" cy="200" r="10" fill="#1E3A8A" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-lg border border-blue-50 text-center hover:-translate-y-2 transition-transform duration-300">
              <div className="text-3xl lg:text-4xl font-heading font-bold text-gold mb-2">
                {stat.value}
              </div>
              <div className="text-primary font-body font-medium text-sm lg:text-base">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Hero;