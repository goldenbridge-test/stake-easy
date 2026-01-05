import React from 'react';
import { TrendingUp, Shield, BarChart3, ArrowUpRight } from 'lucide-react';

const Investments = () => {
  const products = [
    {
      icon: <TrendingUp className="w-8 h-8 text-gold" />,
      title: "Yield Farming Pool",
      desc: "Earn yields by providing liquidity to decentralized exchanges with our managed farming strategy.",
      apy: "8-12%",
      risk: "Medium",
      lock: "30 days",
    },
    {
      icon: <Shield className="w-8 h-8 text-gold" />,
      title: "Stablecoin Treasury",
      desc: "Low-risk exposure to secured stablecoin yields across multiple protocols.",
      apy: "5-7%",
      risk: "Low",
      lock: "None",
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-gold" />,
      title: "DeFi Growth Fund",
      desc: "Actively managed fund investing in promising DeFi protocols with high growth potential.",
      apy: "15-25%",
      risk: "High",
      lock: "90 days",
    }
  ];

  return (
    <section id="investments" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* En-tête de section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-lg text-gray-600">
            Diversify your portfolio with our carefully selected range of Web3 investment options, 
            tailored to different risk profiles and growth targets.
          </p>
        </div>

        {/* Grille des cartes */}
        <div className="grid md:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col">
              
              {/* Icone */}
              <div className="mb-6 bg-gold-light w-16 h-16 rounded-full flex items-center justify-center">
                {product.icon}
              </div>

              <h3 className="text-2xl font-heading font-bold text-primary mb-3">{product.title}</h3>
              <p className="text-gray-500 mb-8 flex-grow">{product.desc}</p>

              {/* Stats Grid */}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span className="text-gray-400 font-medium">Expected APY</span>
                  <span className="font-mono font-bold text-primary text-lg">{product.apy}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span className="text-gray-400 font-medium">Risk Level</span>
                  <span className={`font-bold ${product.risk === 'High' ? 'text-red-500' : product.risk === 'Low' ? 'text-green-500' : 'text-yellow-600'}`}>
                    {product.risk}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span className="text-gray-400 font-medium">Lock Period</span>
                  <span className="font-bold text-primary">{product.lock}</span>
                </div>
              </div>

              {/* Bouton */}
              <button className="w-full bg-gold hover:bg-gold-hover text-white font-heading font-bold py-3 rounded-lg transition shadow-md">
                Invest Now
              </button>
            </div>
          ))}
        </div>

        {/* Bouton Voir tout */}
        <div className="text-center mt-12">
          <button className="inline-flex items-center gap-2 border border-gold text-primary hover:bg-gold hover:text-white px-8 py-3 rounded-lg font-bold transition">
            View All Investment Products
            <ArrowUpRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </section>
  );
};

export default Investments;