import React, { useState } from 'react';

const Performance = () => {
  const [activeTab, setActiveTab] = useState('performance');

  return (
    <section id="performance" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Titre et Intro */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl font-heading font-bold text-primary mb-4">
            Track Record & Performance
          </h2>
          <p className="text-gray-500 text-lg">
            Our transparent approach allows you to monitor all fund performance metrics in real-time, 
            with historical data and asset allocations clearly presented.
          </p>
        </div>

        {/* Onglets (Tabs) */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 p-1 rounded-lg flex space-x-1">
            {['Performance', 'Allocation', 'Key Metrics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`px-8 py-2 rounded-md font-bold text-sm transition-all ${
                  activeTab === tab.toLowerCase()
                    ? 'bg-gold text-white shadow-md'
                    : 'text-gray-500 hover:text-primary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Carte Graphique */}
        <div className="border border-gray-200 rounded-xl p-6 md:p-10 shadow-lg bg-white">
          <h3 className="text-xl font-heading font-bold text-primary mb-8">Annual Fund Performance</h3>
          
          {/* Conteneur Graphique (SVG Responsive) */}
          <div className="relative h-80 w-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 800 300" preserveAspectRatio="none">
              
              {/* Grille de fond (Lignes pointillées grises) */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line 
                  key={i} 
                  x1="0" y1={i * 75} x2="800" y2={i * 75} 
                  stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" 
                />
              ))}

              {/* Axe Y (Pourcentages) */}
              <text x="-10" y="300" className="text-xs fill-gray-400 text-right">0%</text>
              <text x="-10" y="225" className="text-xs fill-gray-400 text-right">5%</text>
              <text x="-10" y="150" className="text-xs fill-gray-400 text-right">10%</text>
              <text x="-10" y="75" className="text-xs fill-gray-400 text-right">15%</text>
              <text x="-10" y="5" className="text-xs fill-gray-400 text-right">20%</text>

              {/* Ligne Pointillée Bleue (Market Average) */}
              <polyline
                fill="none"
                stroke="#1E3A8A"
                strokeWidth="2"
                strokeDasharray="6 6"
                points="0,240 100,220 200,245 300,190 400,200 500,160 600,180 700,170 800,150"
              />
              {/* Points Bleus */}
              {[
                [0,240], [100,220], [200,245], [300,190], 
                [400,200], [500,160], [600,180], [700,170], [800,150]
              ].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="4" fill="#1E3A8A" />
              ))}

              {/* Ligne Pleine OR (GoldenBridge Fund) */}
              <polyline
                fill="none"
                stroke="#FACC15"
                strokeWidth="3"
                points="0,210 100,180 200,195 300,135 400,150 500,100 600,80 700,60 800,45"
              />
              {/* Points Or */}
              {[
                [0,210], [100,180], [200,195], [300,135], 
                [400,150], [500,100], [600,80], [700,60], [800,45]
              ].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="5" fill="#FACC15" stroke="white" strokeWidth="2" />
              ))}

            </svg>

            {/* Labels Axe X (Mois) */}
            <div className="flex justify-between mt-4 text-xs text-gray-500 font-mono">
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span>
              <span>May</span><span>Jun</span><span>Jul</span><span>Aug</span>
              <span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
            </div>
          </div>

          {/* Légende */}
          <div className="flex justify-center items-center gap-8 mt-8">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gold"></div>
              <span className="text-sm font-bold text-gray-600">GoldenBridge Fund</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary opacity-50"></div>
              <span className="text-sm text-gray-500">Market Average</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Performance;