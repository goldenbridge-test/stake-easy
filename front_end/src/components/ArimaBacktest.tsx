import React, { useState, useEffect, useRef } from 'react';
import { Play, Clock, CheckCircle, XCircle, Loader2, TrendingUp, Activity } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import api from '../services/api';

interface BacktestResult {
  symbol: string;
  capital: number;
  start_date: string | null;
  candles_analyzed: number;
  total_buys: number;
  total_sells: number;
  total_invested: number;
  total_recovered: number;
  pnl: number;
  pnl_pct: number;
  open_positions: number;
  closed_positions: number;
  win_rate_pct: number;
  max_drawdown_pct: number;
  sharpe_ratio: number;
}

interface BacktestResponse {
  id: number;
  symbol: string;
  capital: string;
  start_date: string;
  discount_pct: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  results: BacktestResult | null;
  error: string;
  created_at: string;
  completed_at: string | null;
}

const ArimaBacktest = () => {
  const [symbol, setSymbol] = useState('BTC/USDT');
  const [capital, setCapital] = useState('1000');
  const [startDate, setStartDate] = useState('2020-01-01');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BacktestResponse | null>(null);
  const [error, setError] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const launchBacktest = async () => {
    setError('');
    setResult(null);
    setLoading(true);

    try {
      // discount_pct FIXE côté serveur, on ne l'envoie plus depuis le front
      const { data } = await api.post('/execution/backtests/', {
        symbol,
        capital,
        start_date: startDate,
      });

      setResult(data);

      if (data.status === 'completed' || data.status === 'failed') {
        setLoading(false);
        return;
      }

      pollRef.current = setInterval(async () => {
        try {
          const { data: updated } = await api.get(`/execution/backtests/${data.id}/`);
          setResult(updated);
          if (updated.status === 'completed' || updated.status === 'failed') {
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
      }, 5000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors du lancement');
      setLoading(false);
    }
  };

  const statusConfig: Record<string, { icon: React.ElementType; label: string; color: string; spin?: boolean }> = {
    pending: { icon: Clock, label: 'En attente', color: 'text-yellow-600 bg-yellow-50' },
    running: { icon: Loader2, label: 'Walkforward en cours...', color: 'text-blue-600 bg-blue-50', spin: true },
    completed: { icon: CheckCircle, label: 'Terminé', color: 'text-green-600 bg-green-50' },
    failed: { icon: XCircle, label: 'Échec', color: 'text-red-600 bg-red-50' },
  };

  const StatusIcon = result ? statusConfig[result.status].icon : Clock;
  const isSpinning = result ? !!statusConfig[result.status].spin : false;

  return (
    <div className="bg-gray-50 min-h-screen font-body text-dark flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-8">

          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
              <TrendingUp className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold text-primary">Backtest ARIMA</h1>
              <p className="text-gray-500">Simulez votre stratégie sur un actif</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Formulaire — DISCOUNT SUPPRIMÉ */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden sticky top-32">
                <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-indigo-700" />
                <div className="p-6 md:p-8 space-y-5">
                  <h2 className="text-xl font-heading font-bold text-primary mb-4">Paramètres</h2>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Actif</label>
                    <select value={symbol} onChange={(e) => setSymbol(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition">
                      {['BTC/USDT','ETH/USDT','SOL/USDT','BNB/USDT','XRP/USDT','ADA/USDT','AVAX/USDT','DOT/USDT','MATIC/USDT','LINK/USDT'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

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

                  {/* Info box — discount géré par ARIMA */}
                  <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
                    <p className="text-xs text-gray-600">
                      Le risk management (discount, sealing, TP ladders) est géré automatiquement par ARIMA.
                    </p>
                  </div>

                  <button onClick={launchBacktest} disabled={loading}
                    className="w-full bg-gold hover:bg-gold-hover text-white font-heading font-bold py-4 rounded-xl shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4">
                    {loading ? (<><Loader2 className="w-5 h-5 animate-spin" /> Backtest en cours...</>) : (<><Play className="w-5 h-5" /> Lancer le backtest</>)}
                  </button>

                  {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">{error}</div>}
                </div>
              </div>
            </div>

            {/* Résultats */}
            <div className="lg:col-span-8 space-y-6">
              {!result && !loading && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-16 text-center">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Activity className="w-10 h-10 text-blue-300" />
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-2">Prêt à simuler</h3>
                  <p className="text-gray-500">Configurez les paramètres et lancez un backtest.</p>
                </div>
              )}

              {result && (
                <>
                  <div className={`rounded-xl p-4 flex items-center gap-3 ${statusConfig[result.status].color}`}>
                    <StatusIcon className={`w-6 h-6 ${isSpinning ? 'animate-spin' : ''}`} />
                    <div>
                      <span className="font-bold text-lg">{statusConfig[result.status].label}</span>
                      {result.status === 'completed' && result.completed_at && (
                        <span className="ml-3 text-sm opacity-75">· Terminé le {new Date(result.completed_at).toLocaleString('fr-FR')}</span>
                      )}
                    </div>
                  </div>

                  {result.status === 'failed' && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                      <h3 className="font-bold text-red-700 mb-2">Erreur</h3>
                      <p className="text-red-600 font-mono text-sm">{result.error}</p>
                    </div>
                  )}

                  {result.status === 'completed' && result.results && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
                          <p className="text-xs font-bold text-gray-500 mb-1">P&L Réalisé</p>
                          <p className={`text-2xl font-heading font-bold ${result.results.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {result.results.pnl >= 0 ? '+' : ''}{result.results.pnl.toFixed(2)} USDT
                          </p>
                          <p className={`text-sm font-bold ${result.results.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {result.results.pnl_pct >= 0 ? '+' : ''}{result.results.pnl_pct.toFixed(1)}%
                          </p>
                        </div>
                        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
                          <p className="text-xs font-bold text-gray-500 mb-1">Sharpe Ratio</p>
                          <p className={`text-2xl font-heading font-bold ${result.results.sharpe_ratio >= 2 ? 'text-green-600' : result.results.sharpe_ratio >= 1 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {result.results.sharpe_ratio.toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
                          <p className="text-xs font-bold text-gray-500 mb-1">Max Drawdown</p>
                          <p className={`text-2xl font-heading font-bold ${result.results.max_drawdown_pct < 10 ? 'text-green-600' : result.results.max_drawdown_pct < 20 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {result.results.max_drawdown_pct.toFixed(1)}%
                          </p>
                        </div>
                        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
                          <p className="text-xs font-bold text-gray-500 mb-1">Win Rate</p>
                          <p className="text-2xl font-heading font-bold text-primary">{result.results.win_rate_pct}%</p>
                          <p className="text-sm text-gray-400">{result.results.closed_positions} fermées</p>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <h3 className="text-lg font-heading font-bold text-primary mb-4">Détail</h3>
                        <div className="grid grid-cols-2 gap-y-3 text-sm">
                          <div className="text-gray-500">Capital initial</div>
                          <div className="font-mono font-bold text-right">{result.results.capital.toFixed(2)} USDT</div>
                          <div className="text-gray-500">Capital investi</div>
                          <div className="font-mono font-bold text-right">{result.results.total_invested.toFixed(2)} USDT</div>
                          <div className="text-gray-500">Capital récupéré</div>
                          <div className="font-mono font-bold text-right">{result.results.total_recovered.toFixed(2)} USDT</div>
                          <div className="text-gray-500">Trades</div>
                          <div className="font-mono font-bold text-right">{result.results.total_buys + result.results.total_sells}</div>
                          <div className="text-gray-500">Bougies analysées</div>
                          <div className="font-mono font-bold text-right">{result.results.candles_analyzed.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ArimaBacktest;
