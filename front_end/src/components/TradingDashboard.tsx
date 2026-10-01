import React, { useState, useEffect } from 'react';
import { Coins, TrendingUp, Activity, ArrowUpRight, ArrowDownRight, Play, BarChart3, LineChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import api from '../services/api';

const TradingDashboard = () => {
  const [positions, setPositions] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [posRes, perfRes] = await Promise.all([
        api.get('/execution/positions/'),
        api.get('/execution/performance/'),
      ]);
      setPositions(posRes.data);
      setPerformance(perfRes.data);
    } catch (err) {
      console.error('Erreur chargement:', err);
    } finally {
      setLoading(false);
    }
  };

  const Skeleton = ({ className }: { className: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );

  return (
    <div className="bg-gray-50 min-h-screen font-body text-dark flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header + Boutons Backtest & Portfolio */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                <Activity className="w-6 h-6 text-gold" />
              </div>
              <div>
                <h1 className="text-3xl font-heading font-bold text-primary">Dashboard ARIMA</h1>
                <p className="text-gray-500">Autonomous Risk & Investment Management Algorithm</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/arima/backtest"
                className="flex items-center gap-2 bg-gold hover:bg-gold-hover text-white px-6 py-3 rounded-xl font-heading font-bold transition shadow-md"
              >
                <Play className="w-4 h-4" />
                Backtest
              </Link>
              <Link
                to="/arima/portfolio"
                className="flex items-center gap-2 bg-primary hover:bg-blue-900 text-white px-6 py-3 rounded-xl font-heading font-bold transition shadow-md"
              >
                <BarChart3 className="w-4 h-4" />
                Portfolio
              </Link>
              <Link
                to="/arima/charts"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-heading font-bold transition shadow-md"
              >
                <LineChart className="w-4 h-4" />
                Charts
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
            </div>
          ) : performance ? (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {/* P&L Réalisé */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-gold" />
                  <span className="text-sm font-bold text-gray-500">P&L Réalisé</span>
                </div>
                <p className={`text-3xl font-heading font-bold ${performance.realized_pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {performance.realized_pnl.toFixed(2)} USDT
                </p>
                <p className="text-sm text-gray-400 mt-1">{performance.realized_pnl_pct.toFixed(1)}%</p>
              </div>

              {/* Positions Ouvertes */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="w-5 h-5 text-gold" />
                  <span className="text-sm font-bold text-gray-500">Positions Ouvertes</span>
                </div>
                <p className="text-3xl font-heading font-bold text-primary">{performance.open_positions}</p>
                <p className="text-sm text-gray-400 mt-1">{performance.closed_positions} fermées</p>
              </div>

              {/* Win Rate */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-gold" />
                  <span className="text-sm font-bold text-gray-500">Win Rate</span>
                </div>
                <p className="text-3xl font-heading font-bold text-primary">{performance.win_rate_pct}%</p>
                <p className="text-sm text-gray-400 mt-1">{performance.total_buys} achats · {performance.total_sells} ventes</p>
              </div>

              {/* Max Drawdown */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDownRight className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-bold text-gray-500">Max Drawdown</span>
                </div>
                <p className={`text-3xl font-heading font-bold ${performance.max_drawdown_pct < 10 ? 'text-green-600' : performance.max_drawdown_pct < 20 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {performance.max_drawdown_pct}%
                </p>
                <p className="text-sm text-gray-400 mt-1">Perte max depuis pic</p>
              </div>

              {/* Sharpe Ratio */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-bold text-gray-500">Sharpe Ratio</span>
                </div>
                <p className={`text-3xl font-heading font-bold ${performance.sharpe_ratio >= 2 ? 'text-green-600' : performance.sharpe_ratio >= 1 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {performance.sharpe_ratio}
                </p>
                <p className="text-sm text-gray-400 mt-1">Rendement ajusté risque</p>
              </div>
            </div>
          ) : null}

          {/* Positions Table */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8">
            <h2 className="text-xl font-heading font-bold text-primary mb-6">Positions</h2>
            {loading ? (
              <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : positions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-gray-400 text-sm border-b border-gray-100">
                      <th className="pb-4 font-medium pl-2">Actif</th>
                      <th className="pb-4 font-medium">Mode</th>
                      <th className="pb-4 font-medium">Entrée</th>
                      <th className="pb-4 font-medium">Quantité</th>
                      <th className="pb-4 font-medium">Investi</th>
                      <th className="pb-4 font-medium text-right pr-2">P&L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {positions.map((pos) => (
                      <tr key={pos.id} className="group hover:bg-gray-50 transition">
                        <td className="py-4 pl-2 font-bold text-primary">{pos.symbol}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            pos.mode === 'live' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>{pos.mode}</span>
                        </td>
                        <td className="py-4 font-mono text-sm">{parseFloat(pos.entry_price).toFixed(4)}</td>
                        <td className="py-4 font-mono text-sm">{parseFloat(pos.total_amount_base).toFixed(4)}</td>
                        <td className="py-4 font-mono text-sm text-gray-500">{parseFloat(pos.total_quote_spent).toFixed(2)}</td>
                        <td className="py-4 text-right pr-2">
                          {pos.unrealized_pnl != null && (
                            <div className={`flex items-center justify-end gap-1 font-mono font-bold text-sm ${
                              parseFloat(pos.unrealized_pnl) >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {parseFloat(pos.unrealized_pnl) >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                              {parseFloat(pos.unrealized_pnl).toFixed(2)}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400">Aucune position active.</div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TradingDashboard;
