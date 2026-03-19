import { TrendingUp, Shield, BarChart3, ArrowUpRight, Clock } from 'lucide-react';

const Investments = () => {
  const products = [
    {
      icon: <Shield className="w-10 h-10 text-gold" />,
      title: "Conservative Staking",
      desc: "Low-risk entry into Web3 staking. Lock your tokens for 1 year and earn stable, predictable returns.",
      apy: "8%",
      risk: "Low",
      lock: "1 year",
      lockYears: 1,
    },
    {
      icon: <TrendingUp className="w-10 h-10 text-gold" />,
      title: "Balanced Growth",
      desc: "The ideal balance between yield and commitment. A 2 to 3-year horizon for steady compounding rewards.",
      apy: "10–12%",
      risk: "Medium",
      lock: "2–3 years",
      lockYears: 2,
    },
    {
      icon: <BarChart3 className="w-10 h-10 text-gold" />,
      title: "Maximum Yield",
      desc: "Maximize your earnings with our highest-tier staking plan. Commit for the full 4-year period and unlock peak APY.",
      apy: "15%",
      risk: "Medium",
      lock: "4 years",
      lockYears: 4,
    },
  ];

  return (
    <section id="investments" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-base text-gray-500">
            All our financial products have a commitment period of <span className="font-semibold text-primary">1 to 4 years</span> — the longer you stake, the higher your yield. Choose the plan that fits your goals.
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
                  <span className="font-bold text-primary flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gold" />{product.lock}
                  </span>
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