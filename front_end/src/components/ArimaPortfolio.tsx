import React, { useState, useEffect, useRef } from 'react';
import { Play, Loader2, CheckCircle, Trophy, TrendingDown, BarChart3, Shield, Activity } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import api from '../services/api';

const AVAILABLE_SYMBOLS = [
  'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT',
  'ADA/USDT', 'AVAX/USDT', 'DOT/USDT', 'LINK/USDT', 'MATIC/USDT',
];

interface RankingItem {
  id: number;
  symbol: string;
  status: string;
  pnl: number;
  pnl_pct: number;
  win_rate_pct: number;
  max_drawdown_pct: number;
  sharpe_ratio: number;
  total_buys: number;
  total_sells: number;
  candles_analyzed: number;
  open_positions: number;
  closed_positions: number;
}

interface PortfolioSummary {
  total_assets: number;
  total_pnl: number;
  avg_pnl_pct: number;
  avg_sharpe_ratio: number;
  worst_drawdown_pct: number;
  best_performer: string | null;
  worst_performer: string | null;
}

interface SimulationResponse {
  status: string;
  progress: string;
  portfolio_summary: PortfolioSummary;
  rankings: RankingItem[];
}

const ArimaPortfolio = () => {
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([
    'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT',
  ]);
  const [capital, setCapital] = useState('1000');
  const [startDate, setStartDate] = useState('2020-01-01');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResponse | null>(null);
  const [error, setError] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const toggleSymbol = (symbol: string) => {
    setSelectedSymbols(prev =>
      prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]
    );
  };

  const selectAll = () => setSelectedSymbols([...AVAILABLE_SYMBOLS]);
  const deselectAll = () => setSelectedSymbols([]);

  const launchSimulation = async () => {
    if (selectedSymbols.length === 0) {
      setError('Sélectionnez au moins un actif.');
      return;
    }
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const { data } = await api.post('/execution/portfolio-simulation/', {
        symbols: selectedSymbols,
        capital,
        start_date: startDate,
      });

      const ids = data.batch_ids as number[];

      pollRef.current = setInterval(async () => {
        try {
          const params = ids.map((id: number) => `ids=${id}`).join('&');
          const { data: updated } = await api.get(`/execution/portfolio-simulation/?${params}`);
          setResult(updated);
          if (updated.status === 'completed') {
            if (pollRef.current) clearInterval(pollRef.current);
            pollRef.current = null;
            setLoading(false);
          }
        } catch {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          setLoading(false);
          setError('Erreur lors du polling');
        }
      }, 8000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors du lancement');
      setLoading(false);
    }
  };

  const StatusIcon = result?.status === 'completed' ? CheckCircle : Loader2;
  const isSpinning = result?.status === 'running';

  return (
    <div className="bg-gray-50 min-h-screen font-body text-dark flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gold/10 text-gold px-4 py-1.5 rounded-full text-sm font-bold mb-4">
              <Shield className="w-4 h-4" />
              ARIMA Portfolio Simulation
            </div>
            <h1 className="text-4xl font-heading font-bold text-primary mb-4">
              Autonomous Risk & Investment Management Algorithm
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simulez la puissance d'un portefeuille diversifié géré par ARIMA.
              Le bot applique automatiquement sa stratégie de risk management sur les actifs sélectionnés.
            </p>
          </div>

          {/* Configuration */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-w-4xl mx-auto">
            <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-indigo-700" />
            <div className="p-6 md:p-8 space-y-6">

              {/* Sélection actifs */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-bold text-gray-700">
                    Actifs ({selectedSymbols.length}/{AVAILABLE_SYMBOLS.length})
                  </label>
                  <div className="flex gap-2">
                    <button onClick={selectAll} className="text-xs font-bold text-gold hover:underline">Tout sélectionner</button>
                    <span className="text-gray-300">|</span>
                    <button onClick={deselectAll} className="text-xs font-bold text-gray-400 hover:underline">Tout désélectionner</button>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  {AVAILABLE_SYMBOLS.map(symbol => (
                    <button
                      key={symbol}
                      onClick={() => toggleSymbol(symbol)}
                      className={`text-xs font-bold py-2.5 px-1 rounded-lg transition ${
                        selectedSymbols.includes(symbol)
                          ? 'bg-gold text-white shadow-md'
                          : 'bg-white text-gray-600 border border-gray-200 hover:border-gold hover:text-gold'
                      }`}
                    >
                      {symbol.replace('/USDT', '')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Capital + Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Capital (USDT)</label>
                  <input type="number" value={capital} onChange={(e) => setCapital(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Date de début</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition" />
                </div>
              </div>

              {/* Info box */}
              <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
                <p className="text-sm text-gray-600 flex items-start gap-2">
                  <Shield className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  Les paramètres de risk management (discount, sealing, TP ladders) sont gérés automatiquement par ARIMA. Vous n'avez rien à configurer.
                </p>
              </div>

              {/* Bouton */}
              <button onClick={launchSimulation} disabled={loading || selectedSymbols.length === 0}
                className="w-full bg-gold hover:bg-gold-hover text-white font-heading font-bold py-4 rounded-xl shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Simulation en cours...</>
                ) : (
                  <><Play className="w-5 h-5" /> Simuler {selectedSymbols.length} actif{selectedSymbols.length > 1 ? 's' : ''}</>
                )}
              </button>

              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">{error}</div>}
            </div>
          </div>

          {/* Résultats */}
          {result && (
            <div className="space-y-6">

              {/* Status banner */}
              <div className={`rounded-xl p-4 flex items-center gap-3 ${
                result.status === 'completed' ? 'text-green-600 bg-green-50' : 'text-blue-600 bg-blue-50'
              }`}>
                <StatusIcon className={`w-6 h-6 ${isSpinning ? 'animate-spin' : ''}`} />
                <span className="font-bold text-lg capitalize">
                  {result.status === 'completed' ? 'Simulation terminée' : `Simulation en cours... (${result.progress})`}
                </span>
              </div>

              {/* KPIs Portefeuille */}
              {result.portfolio_summary.total_assets > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
                    <p className="text-xs font-bold text-gray-500 mb-1">Actifs testés</p>
                    <p className="text-2xl font-heading font-bold text-primary">{result.portfolio_summary.total_assets}</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
                    <p className="text-xs font-bold text-gray-500 mb-1">P&L Total</p>
                    <p className={`text-2xl font-heading font-bold ${result.portfolio_summary.total_pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {result.portfolio_summary.total_pnl >= 0 ? '+' : ''}{result.portfolio_summary.total_pnl.toFixed(2)} USDT
                    </p>
                  </div>
                  <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
                    <p className="text-xs font-bold text-gray-500 mb-1">P&L% Moyen</p>
                    <p className={`text-2xl font-heading font-bold ${result.portfolio_summary.avg_pnl_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {result.portfolio_summary.avg_pnl_pct >= 0 ? '+' : ''}{result.portfolio_summary.avg_pnl_pct.toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
                    <p className="text-xs font-bold text-gray-500 mb-1">Sharpe Moyen</p>
                    <p className={`text-2xl font-heading font-bold ${result.portfolio_summary.avg_sharpe_ratio >= 2 ? 'text-green-600' : result.portfolio_summary.avg_sharpe_ratio >= 1 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {result.portfolio_summary.avg_sharpe_ratio.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
                    <p className="text-xs font-bold text-gray-500 mb-1">Max Drawdown</p>
                    <p className={`text-2xl font-heading font-bold ${result.portfolio_summary.worst_drawdown_pct < 10 ? 'text-green-600' : result.portfolio_summary.worst_drawdown_pct < 20 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {result.portfolio_summary.worst_drawdown_pct.toFixed(1)}%
                    </p>
                  </div>
                </div>
              )}

              {/* Best / Worst */}
              {result.portfolio_summary.best_performer && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-yellow-500" />
                    <div>
                      <p className="text-xs font-bold text-green-700">Meilleur performer</p>
                      <p className="text-xl font-heading font-bold text-green-800">{result.portfolio_summary.best_performer}</p>
                    </div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <TrendingDown className="w-8 h-8 text-red-400" />
                    <div>
                      <p className="text-xs font-bold text-red-700">Moins bon performer</p>
                      <p className="text-xl font-heading font-bold text-red-800">{result.portfolio_summary.worst_performer}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Classement détaillé */}
              {result.rankings.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-lg font-heading font-bold text-primary mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-gold" />
                    Performance détaillée par actif
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-gray-400 text-sm border-b border-gray-100">
                          <th className="pb-3 pl-2">#</th>
                          <th className="pb-3">Actif</th>
                          <th className="pb-3 text-right">P&L%</th>
                          <th className="pb-3 text-right">P&L (USDT)</th>
                          <th className="pb-3 text-right">Sharpe</th>
                          <th className="pb-3 text-right">Max DD</th>
                          <th className="pb-3 text-right">Win Rate</th>
                          <th className="pb-3 text-right">Trades</th>
                          <th className="pb-3 text-right pr-2">Positions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {result.rankings.map((item, idx) => {
                          const isPending = item.status !== 'completed';
                          return (
                            <tr key={item.symbol} className={`group hover:bg-gray-50 transition ${isPending ? 'opacity-40' : ''} ${idx === 0 && !isPending ? 'bg-yellow-50/50' : ''}`}>
                              <td className="py-3 pl-2 font-bold text-gray-400">{idx + 1}</td>
                              <td className="py-3 font-bold text-primary">{item.symbol}</td>
                              <td className={`py-3 text-right font-mono font-bold ${!isPending && item.pnl_pct >= 0 ? 'text-green-600' : !isPending ? 'text-red-600' : 'text-gray-400'}`}>
                                {isPending ? '...' : `${item.pnl_pct >= 0 ? '+' : ''}${item.pnl_pct.toFixed(1)}%`}
                              </td>
                              <td className={`py-3 text-right font-mono font-bold ${!isPending && item.pnl >= 0 ? 'text-green-600' : !isPending ? 'text-red-600' : 'text-gray-400'}`}>
                                {isPending ? '...' : `${item.pnl >= 0 ? '+' : ''}${item.pnl.toFixed(2)}`}
                              </td>
                              <td className={`py-3 text-right font-mono text-sm ${!isPending && item.sharpe_ratio >= 2 ? 'text-green-600' : !isPending && item.sharpe_ratio >= 1 ? 'text-yellow-600' : 'text-gray-500'}`}>
                                {isPending ? '...' : item.sharpe_ratio.toFixed(2)}
                              </td>
                              <td className={`py-3 text-right font-mono text-sm ${!isPending && item.max_drawdown_pct < 10 ? 'text-green-600' : !isPending && item.max_drawdown_pct < 20 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {isPending ? '...' : `${item.max_drawdown_pct.toFixed(1)}%`}
                              </td>
                              <td className="py-3 text-right font-mono text-sm">
                                {isPending ? '...' : `${item.win_rate_pct}%`}
                              </td>
                              <td className="py-3 text-right font-mono text-sm text-gray-500">
                                {isPending ? '...' : item.total_buys + item.total_sells}
                              </td>
                              <td className="py-3 text-right font-mono text-sm text-gray-500 pr-2">
                                {isPending ? '...' : `${item.open_positions} / ${item.closed_positions}`}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!result && !loading && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-16 text-center max-w-3xl mx-auto">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity className="w-10 h-10 text-blue-300" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">Démonstration du portefeuille ARIMA</h3>
              <p className="text-gray-500">
                Sélectionnez vos actifs, définissez le capital et la date de départ.
                ARIMA se charge du reste avec son risk management autonome.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ArimaPortfolio;
