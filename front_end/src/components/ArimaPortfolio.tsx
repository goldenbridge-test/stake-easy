import React, { useState, useEffect, useRef } from 'react';
import { Play, Loader2, CheckCircle, Trophy, TrendingDown, BarChart3, Shield, Activity, XCircle, TrendingUp } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import api from '../services/api';

const AVAILABLE_SYMBOLS = [
  'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT',
  'ADA/USDT', 'AVAX/USDT', 'DOT/USDT', 'LINK/USDT', 'MATIC/USDT',
];

interface CAGRData {
  performance_totale_pct: number;
  moyenne_annualisee_pct: number;
  cagr_pct: number;
}

interface RankingItem {
  id: number;
  symbol: string;
  status: string;
  capital_allocated: number;
  realized_pnl: number;
  realized_pnl_pct: number;
  unrealized_pnl: number;
  unrealized_pnl_pct: number;
  total_pnl: number;
  total_pnl_pct: number;
  win_rate_pct: number;
  win_rate_sample_size: number;
  max_drawdown_pct: number;
  sharpe_ratio: number;
  total_buys: number;
  total_sells: number;
  candles_analyzed: number;
  open_positions: number;
  closed_positions: number;
  invested_in_open: number;
  cagr: CAGRData;
  nb_years: number;
  final_capital: number;
}

interface PortfolioSummary {
  total_assets: number;
  total_capital: number;
  final_capital: number;
  nb_years: number;
  total_pnl: number;
  total_pnl_pct: number;
  total_realized_pnl: number;
  total_realized_pct: number;
  total_unrealized_pnl: number;
  total_unrealized_pct: number;
  sharpe_ratio: number;
  max_drawdown_pct: number;
  cagr: CAGRData;
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
    return () => { 
      if (pollRef.current) clearInterval(pollRef.current); 
    };
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
        } catch (err) {
          console.error('Polling error:', err);
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

  const completedCount = result?.rankings?.filter(r => r.status === 'completed').length || 0;
  const totalCount = result?.rankings?.length || selectedSymbols.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="bg-gray-50 min-h-screen font-body text-dark flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-8">

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

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-w-4xl mx-auto">
            <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-indigo-700" />
            <div className="p-6 md:p-8 space-y-6">

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

              <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
                <p className="text-sm text-gray-600 flex items-start gap-2">
                  <Shield className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  Le capital est automatiquement divisé entre les actifs sélectionnés. Les paramètres de risk management sont gérés par ARIMA.
                </p>
              </div>

              <button onClick={launchSimulation} disabled={loading || selectedSymbols.length === 0}
                className="w-full bg-gold hover:bg-gold-hover text-white font-heading font-bold py-4 rounded-xl shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Simulation en cours...</>
                ) : (
                  <><Play className="w-5 h-5" /> Simuler {selectedSymbols.length} actif{selectedSymbols.length > 1 ? 's' : ''}</>
                )}
              </button>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  {error}
                </div>
              )}
            </div>
          </div>

          {result && (
            <div className="space-y-6">

              {result.status === 'running' && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                      <span className="font-bold text-lg text-primary">Simulation en cours...</span>
                    </div>
                    <span className="text-sm font-bold text-gray-500">
                      {completedCount} / {totalCount} actifs terminés
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    Les résultats s'affichent au fur et à mesure
                  </p>
                </div>
              )}

              {result.status === 'completed' && (
                <div className="rounded-xl p-4 flex items-center gap-3 text-green-600 bg-green-50">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-bold text-lg">Simulation terminée — {completedCount} actifs analysés</span>
                </div>
              )}

              {result.portfolio_summary?.total_assets > 0 && (
                <>
                  {/* KPIs principaux */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
                      <p className="text-xs font-bold text-gray-500 mb-1">Capital Alloué</p>
                      <p className="text-2xl font-heading font-bold text-primary">
                        {result.portfolio_summary.total_capital.toFixed(0)} USDT
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{result.portfolio_summary.total_assets} actifs</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
                      <p className="text-xs font-bold text-gray-500 mb-1">P&L Réalisé</p>
                      <p className={`text-2xl font-heading font-bold ${result.portfolio_summary.total_realized_pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {result.portfolio_summary.total_realized_pnl >= 0 ? '+' : ''}{result.portfolio_summary.total_realized_pnl.toFixed(2)}
                      </p>
                      <p className={`text-xs ${result.portfolio_summary.total_realized_pct >= 0 ? 'text-green-500' : 'text-red-500'} mt-1`}>
                        {result.portfolio_summary.total_realized_pct >= 0 ? '+' : ''}{result.portfolio_summary.total_realized_pct.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
                      <p className="text-xs font-bold text-gray-500 mb-1">P&L Non Réalisé</p>
                      <p className={`text-2xl font-heading font-bold ${result.portfolio_summary.total_unrealized_pnl >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                        {result.portfolio_summary.total_unrealized_pnl >= 0 ? '+' : ''}{result.portfolio_summary.total_unrealized_pnl.toFixed(2)}
                      </p>
                      <p className={`text-xs ${result.portfolio_summary.total_unrealized_pct >= 0 ? 'text-blue-500' : 'text-orange-500'} mt-1`}>
                        {result.portfolio_summary.total_unrealized_pct >= 0 ? '+' : ''}{result.portfolio_summary.total_unrealized_pct.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
                      <p className="text-xs font-bold text-gray-500 mb-1">Sharpe</p>
                      <p className={`text-2xl font-heading font-bold ${result.portfolio_summary.sharpe_ratio >= 2 ? 'text-green-600' : result.portfolio_summary.sharpe_ratio >= 1 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {result.portfolio_summary.sharpe_ratio.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
                      <p className="text-xs font-bold text-gray-500 mb-1">Max Drawdown</p>
                      <p className={`text-2xl font-heading font-bold ${result.portfolio_summary.max_drawdown_pct < 20 ? 'text-green-600' : result.portfolio_summary.max_drawdown_pct < 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {result.portfolio_summary.max_drawdown_pct.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* CAGR Card */}
                  {result.portfolio_summary.cagr && result.portfolio_summary.nb_years > 0 && (
                    <div className="bg-gradient-to-r from-gold/10 to-gold/5 rounded-xl shadow-lg border border-gold/20 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <TrendingUp className="w-6 h-6 text-gold" />
                        <h3 className="text-lg font-heading font-bold text-primary">
                          CAGR sur {result.portfolio_summary.nb_years.toFixed(1)} ans
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <p className="text-xs font-bold text-gray-500 mb-1">Performance Totale</p>
                          <p className={`text-3xl font-heading font-bold ${result.portfolio_summary.cagr.performance_totale_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {result.portfolio_summary.cagr.performance_totale_pct >= 0 ? '+' : ''}{result.portfolio_summary.cagr.performance_totale_pct.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-500 mb-1">CAGR</p>
                          <p className={`text-3xl font-heading font-bold ${result.portfolio_summary.cagr.cagr_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {result.portfolio_summary.cagr.cagr_pct >= 0 ? '+' : ''}{result.portfolio_summary.cagr.cagr_pct.toFixed(2)}%
                          </p>
                          <p className="text-xs text-gray-400 mt-1">Croissance annualisée composée</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-500 mb-1">Moyenne Annualisée</p>
                          <p className={`text-3xl font-heading font-bold ${result.portfolio_summary.cagr.moyenne_annualisee_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {result.portfolio_summary.cagr.moyenne_annualisee_pct >= 0 ? '+' : ''}{result.portfolio_summary.cagr.moyenne_annualisee_pct.toFixed(2)}%
                          </p>
                          <p className="text-xs text-gray-400 mt-1">Moyenne arithmétique</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {result.status === 'completed' && result.portfolio_summary?.best_performer && (
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

              {result.rankings?.length > 0 && (
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
                          <th className="pb-3 text-right">Capital</th>
                          <th className="pb-3 text-right">P&L Réalisé</th>
                          <th className="pb-3 text-right">P&L Non Réalisé</th>
                          <th className="pb-3 text-right">CAGR</th>
                          <th className="pb-3 text-right">Sharpe</th>
                          <th className="pb-3 text-right">Max DD</th>
                          <th className="pb-3 text-right">Win Rate</th>
                          <th className="pb-3 text-right pr-2">Positions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {result.rankings.map((item, idx) => {
                          const isPending = item.status !== 'completed';
                          return (
                            <tr key={item.symbol} className={`group hover:bg-gray-50 transition ${isPending ? 'opacity-40' : ''} ${idx === 0 && !isPending ? 'bg-yellow-50/50' : ''}`}>
                              <td className="py-3 pl-2 font-bold text-gray-400">{idx + 1}</td>
                              <td className="py-3 font-bold text-primary">
                                <div className="flex items-center gap-2">
                                  {item.symbol}
                                  {isPending && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                                </div>
                              </td>
                              <td className="py-3 text-right font-mono text-sm text-gray-500">
                                {item.capital_allocated?.toFixed(0) || '...'}
                              </td>
                              <td className={`py-3 text-right font-mono font-bold ${!isPending && item.realized_pnl >= 0 ? 'text-green-600' : !isPending ? 'text-red-600' : 'text-gray-400'}`}>
                                {isPending ? '...' : (
                                  <div>
                                    <div>{item.realized_pnl >= 0 ? '+' : ''}{item.realized_pnl.toFixed(0)}</div>
                                    <div className="text-xs text-gray-400">{item.realized_pnl_pct.toFixed(1)}%</div>
                                  </div>
                                )}
                              </td>
                              <td className={`py-3 text-right font-mono text-sm ${!isPending && item.unrealized_pnl >= 0 ? 'text-blue-500' : !isPending ? 'text-orange-500' : 'text-gray-400'}`}>
                                {isPending ? '...' : (
                                  <div>
                                    <div>{item.unrealized_pnl >= 0 ? '+' : ''}{item.unrealized_pnl.toFixed(0)}</div>
                                    <div className="text-xs text-gray-400">{item.unrealized_pnl_pct.toFixed(1)}%</div>
                                  </div>
                                )}
                              </td>
                              <td className={`py-3 text-right font-mono text-sm ${!isPending && item.cagr?.cagr_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {isPending ? '...' : (
                                  <div>
                                    <div>{item.cagr?.cagr_pct >= 0 ? '+' : ''}{item.cagr?.cagr_pct.toFixed(1)}%</div>
                                    <div className="text-xs text-gray-400">{item.nb_years?.toFixed(1)} ans</div>
                                  </div>
                                )}
                              </td>
                              <td className={`py-3 text-right font-mono text-sm ${!isPending && item.sharpe_ratio >= 2 ? 'text-green-600' : !isPending && item.sharpe_ratio >= 1 ? 'text-yellow-600' : 'text-gray-500'}`}>
                                {isPending ? '...' : item.sharpe_ratio.toFixed(2)}
                              </td>
                              <td className={`py-3 text-right font-mono text-sm ${!isPending && item.max_drawdown_pct < 20 ? 'text-green-600' : !isPending && item.max_drawdown_pct < 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {isPending ? '...' : `${item.max_drawdown_pct.toFixed(1)}%`}
                              </td>
                              <td className="py-3 text-right font-mono text-sm">
                                {isPending ? '...' : (
                                  <div>
                                    <div>{item.win_rate_pct}%</div>
                                    <div className="text-xs text-gray-400">({item.win_rate_sample_size})</div>
                                  </div>
                                )}
                              </td>
                              <td className="py-3 text-right font-mono text-sm text-gray-500 pr-2">
                                {isPending ? '...' : (
                                  <div>
                                    <div>{item.open_positions} ouv.</div>
                                    <div className="text-xs">{item.closed_positions} ferm.</div>
                                  </div>
                                )}
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
