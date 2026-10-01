import React, { useState } from 'react';
import { LineChart, ArrowRight, BarChart3, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const AVAILABLE_SYMBOLS = [
  { symbol: 'BTC/USDT', name: 'Bitcoin' },
  { symbol: 'ETH/USDT', name: 'Ethereum' },
  { symbol: 'SOL/USDT', name: 'Solana' },
  { symbol: 'BNB/USDT', name: 'BNB' },
  { symbol: 'XRP/USDT', name: 'XRP' },
  { symbol: 'ADA/USDT', name: 'Cardano' },
  { symbol: 'AVAX/USDT', name: 'Avalanche' },
  { symbol: 'DOT/USDT', name: 'Polkadot' },
  { symbol: 'LINK/USDT', name: 'Chainlink' },
  { symbol: 'MATIC/USDT', name: 'Polygon' },
];

const ChartPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(365);

  return (
    <div className="bg-gray-50 min-h-screen font-body text-dark flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-8">

          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gold/10 text-gold px-4 py-1.5 rounded-full text-sm font-bold mb-4">
              <BarChart3 className="w-4 h-4" />
              ARIMA Zone Charts
            </div>
            <h1 className="text-4xl font-heading font-bold text-primary mb-4">
              Visualisez les zones ARIMA
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explorez les zones de support et résistance détectées par ARIMA sur chaque actif.
              Graphiques interactifs avec bougies daily et markers de zones.
            </p>
          </div>

          {/* Sélecteur de période */}
          <div className="flex justify-center gap-2 mb-8">
            {[
              { label: '90 jours', value: 90 },
              { label: '6 mois', value: 180 },
              { label: '1 an', value: 365 },
              { label: '2 ans', value: 730 },
              { label: '3 ans', value: 1095 },
            ].map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setSelectedPeriod(value)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                  selectedPeriod === value
                    ? 'bg-gold text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gold'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Grille d'actifs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AVAILABLE_SYMBOLS.map(({ symbol, name }) => (
              <Link
                key={symbol}
                to={`/arima/charts/${encodeURIComponent(symbol)}?days=${selectedPeriod}`}
                className="group bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-heading font-bold text-primary">{symbol}</h3>
                    <p className="text-sm text-gray-500">{name}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-gold to-yellow-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <LineChart className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">
                    {selectedPeriod} jours d'historique
                  </span>
                  <div className="flex items-center gap-1 text-gold font-bold text-sm group-hover:gap-2 transition-all">
                    Voir <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Info box */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 max-w-3xl mx-auto">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-bold text-primary mb-1">À propos des zones ARIMA</h3>
                <p className="text-sm text-gray-600">
                  Les zones en <span className="font-bold text-green-600">vert</span> sont des supports actifs (validés).
                  Les zones en <span className="font-bold text-blue-500">bleu</span> sont des supports détectés mais non validés.
                  Les zones grisées ont été invalidées par une cassure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ChartPage;
