import { ArrowRight, TrendingUp, Coins } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const products = [
  {
    id: 'arima',
    name: 'Arima Trading Bot',
    description: 'Bot de trading automatisé avec backtest avancé et gestion de positions.',
    icon: TrendingUp,
    color: 'from-blue-500 to-blue-600',
    href: '/arima',
  },
  {
    id: 'staking',
    name: 'DeFi Staking',
    description: 'Plateforme de staking, yield farming et lending décentralisé.',
    icon: Coins,
    color: 'from-purple-500 to-purple-600',
    href: '/staking',
  },
];

const Home = () => {
  return (
    <div className="bg-gray-50 min-h-screen font-body text-dark flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-heading font-bold text-primary mb-4">GoldenBridge Platform</h1>
            <p className="text-xl text-gray-600">Choisissez votre produit pour commencer</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {products.map((product) => (
              <Link key={product.id} to={product.href} className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${product.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <product.icon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-primary mb-3">{product.name}</h2>
                <p className="text-gray-600 mb-6">{product.description}</p>
                <div className="flex items-center gap-2 text-gold font-bold group-hover:gap-3 transition-all">
                  Accéder au produit <ArrowRight className="w-5 h-5" />
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
