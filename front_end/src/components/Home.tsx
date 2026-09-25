import { ArrowRight, TrendingUp, Coins, Shield, Brain, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const products = [
  {
    id: 'arima',
    name: 'ARIMA',
    subtitle: 'Autonomous Risk & Investment Management Algorithm',
    description: 'Bot de trading autonome avec gestion des risques, backtest walkforward et take-profit multi-paliers.',
    icon: Brain,
    color: 'from-blue-600 to-indigo-700',
    href: '/arima',
    features: [
      'Backtest walkforward as-of',
      'Gestion automatique du risque',
      'Take-profit en échelle',
      'Max Drawdown & Sharpe Ratio',
    ],
  },
  {
    id: 'staking',
    name: 'DeFi Staking',
    subtitle: 'Yield Farming & Lending Décentralisé',
    description: 'Plateforme de staking multi-token avec rewards automatiques et mécanisme pull-over-push.',
    icon: Coins,
    color: 'from-purple-600 to-violet-700',
    href: '/staking',
    features: [
      'Multi-token staking',
      'Rewards automatiques',
      'Cooldown period configurable',
      'Chainlink price feeds',
    ],
  },
];

const Home = () => {
  return (
    <div className="bg-gray-50 min-h-screen font-body text-dark flex flex-col">
      <Navbar />

      <main className="flex-grow pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gold/10 text-gold px-4 py-1.5 rounded-full text-sm font-bold mb-6">
              <Shield className="w-4 h-4" />
              GoldenBridge Platform
            </div>
            <h1 className="text-5xl md:text-6xl font-heading font-bold text-primary mb-6 leading-tight">
              Deux produits.<br />
              <span className="text-gold">Une seule plateforme.</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Trading algorithmique autonome et finance décentralisée.
              Choisissez votre produit pour commencer.
            </p>
          </div>

          {/* Product Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {products.map((product) => (
              <Link
                key={product.id}
                to={product.href}
                className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                {/* Gradient top bar */}
                <div className={`h-2 w-full bg-gradient-to-r ${product.color}`} />

                <div className="p-8 md:p-10">
                  {/* Icon + Title */}
                  <div className="flex items-start gap-5 mb-6">
                    <div className={`w-16 h-16 shrink-0 rounded-xl bg-gradient-to-br ${product.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <product.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-heading font-bold text-primary">
                        {product.name}
                      </h2>
                      <p className="text-sm font-medium text-gold mt-0.5">
                        {product.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2.5 mb-8">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm text-gray-500">
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${product.color} flex items-center justify-center shrink-0`}>
                          <BarChart3 className="w-3 h-3 text-white" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className={`flex items-center gap-2 font-heading font-bold text-lg bg-gradient-to-r ${product.color} bg-clip-text text-transparent group-hover:gap-4 transition-all`}>
                    Accéder à {product.name}
                    <ArrowRight className="w-5 h-5 text-gold" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
