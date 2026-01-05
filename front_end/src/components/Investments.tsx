import { TrendingUp, Shield, BarChart3, ArrowUpRight } from 'lucide-react';

const Investments = () => {
  const products = [
    {
      icon: <TrendingUp className="w-10 h-10 text-gold" />, // Icône plus grande mais sans fond
      title: "Yield Farming Pool",
      desc: "Earn yields by providing liquidity to decentralized exchanges with our managed farming strategy.",
      apy: "8-12%",
      risk: "Medium",
      lock: "30 days",
    },
    {
      icon: <Shield className="w-10 h-10 text-gold" />,
      title: "Stablecoin Treasury",
      desc: "Low-risk exposure to secured stablecoin yields across multiple protocols.",
      apy: "5-7%",
      risk: "Low",
      lock: "None",
    },
    {
      icon: <BarChart3 className="w-10 h-10 text-gold" />,
      title: "DeFi Growth Fund",
      desc: "Actively managed fund investing in promising DeFi protocols with high growth potential.",
      apy: "15-25%",
      risk: "High",
      lock: "90 days",
    }
  ];

  return (
    <section id="investments" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-base text-gray-500">
            Diversify your portfolio with our carefully selected range of Web3 investment options, 
            tailored to different risk profiles and growth targets.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gold group flex flex-col"
            >
              
              <div className="mb-4">
                {product.icon}
              </div>

              <h3 className="text-lg font-heading font-bold text-primary mb-2">
                {product.title}
              </h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed flex-grow">
                {product.desc}
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Expected APY</span>
                  <span className="font-mono font-bold text-primary">{product.apy}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Risk Level</span>
                  <span className={`font-bold ${product.risk === 'High' ? 'text-primary' : product.risk === 'Low' ? 'text-primary' : 'text-primary'}`}>
                    {product.risk}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Lock Period</span>
                  <span className="font-bold text-primary">{product.lock}</span>
                </div>
              </div>

              <button className="w-full bg-gold hover:bg-gold-hover text-white text-sm font-heading font-bold py-3 rounded-md transition shadow-sm">
                Invest Now
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <button className="text-primary hover:text-gold font-bold text-sm inline-flex items-center gap-1 transition border-b border-transparent hover:border-gold pb-0.5">
            View All Investment Products
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};

export default Investments;