import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Loader2, Download } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import api from '../services/api';

interface Candle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface Zone {
  id: number;
  price_low: number;
  price_high: number;
  first_seen: string;
  last_touched: string | null;
  touch_count: number;
  is_active: boolean;
  is_validated: boolean;
}

interface ChartData {
  symbol: string;
  candles: Candle[];
  zones: Zone[];
  candles_count: number;
  zones_count: number;
}

const AssetChart = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const [searchParams] = useSearchParams();
  const days = parseInt(searchParams.get('days') || '365');

  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tooltip, setTooltip] = useState<{ x: number; y: number; candle: Candle } | null>(null);
  const [showZones, setShowZones] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);

  const decodedSymbol = decodeURIComponent(symbol || '');

  useEffect(() => {
    loadData();
  }, [decodedSymbol, days]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: result } = await api.get(`/execution/chart-data/`, {
        params: { symbol: decodedSymbol, days },
      });
      setData(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  // === Télécharger PNG ===
  const downloadPNG = () => {
    if (!svgRef.current) return;

    const svgNode = svgRef.current;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgNode);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    const canvas = document.createElement('canvas');
    const scale = 2; // Haute résolution
    canvas.width = 1200 * scale;
    canvas.height = 600 * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${decodedSymbol.replace('/', '-')}-${days}d.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
      }, 'image/png');
    };
    img.src = url;
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen font-body text-dark flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-gold animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Chargement du graphique...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-gray-50 min-h-screen font-body text-dark flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || 'Données non disponibles'}</p>
            <Link to="/arima/charts" className="text-gold font-bold hover:underline">
              Retour à la liste
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // === Dimensions ===
  const width = 1200;
  const height = 600;
  const margin = { top: 30, right: 80, bottom: 50, left: 70 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const candles = data.candles;
  const zones = data.zones;

  // Map date -> index pour zones (first_seen)
  const dateToIndex = new Map<string, number>();
  candles.forEach((c, i) => dateToIndex.set(c.date, i));

  // Prix min/max uniquement sur les bougies (pas les zones, pour éviter de zoomer sur des zones lointaines)
  const allPrices = candles.flatMap(c => [c.high, c.low]);
  const minPrice = Math.min(...allPrices) * 0.99;
  const maxPrice = Math.max(...allPrices) * 1.01;
  const priceRange = maxPrice - minPrice;

  const xScale = (i: number) => margin.left + (i / Math.max(candles.length - 1, 1)) * chartWidth;
  const yScale = (price: number) => margin.top + (1 - (price - minPrice) / priceRange) * chartHeight;

  const candleWidth = Math.max(1.5, Math.min(8, chartWidth / candles.length * 0.6));

  // Ticks prix (seulement 5)
  const priceTicks = 5;
  const priceTickValues = Array.from({ length: priceTicks }, (_, i) =>
    minPrice + (priceRange * i) / (priceTicks - 1)
  );

  // Ticks dates (6 max)
  const dateTicks = Math.min(6, candles.length);
  const dateTickIndices = Array.from({ length: dateTicks }, (_, i) =>
    Math.floor((candles.length - 1) * i / (dateTicks - 1))
  );

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * width;

    const idx = Math.round(((mouseX - margin.left) / chartWidth) * (candles.length - 1));
    if (idx >= 0 && idx < candles.length) {
      setTooltip({ x: mouseX, y: 0, candle: candles[idx] });
    }
  };

  // Trouver l'index de la bougie courante pour le tooltip
  const currentIdx = tooltip ? candles.findIndex(c => c.date === tooltip.candle.date) : -1;

  return (
    <div className="bg-gray-50 min-h-screen font-body text-dark flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/arima/charts" className="p-2 hover:bg-gray-200 rounded-lg transition">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-heading font-bold text-primary">{decodedSymbol}</h1>
                <p className="text-sm text-gray-500">
                  {data.candles_count} bougies · {data.zones_count} zones · {days} jours
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowZones(!showZones)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                  showZones ? 'bg-gold text-white' : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                Zones
              </button>
              <button
                onClick={downloadPNG}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm bg-primary hover:bg-blue-900 text-white transition"
              >
                <Download className="w-4 h-4" />
                PNG
              </button>
            </div>
          </div>

          {/* Graphique SVG */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setTooltip(null)}
              style={{ cursor: 'crosshair' }}
            >
              {/* Fond blanc pour export PNG */}
              <rect width={width} height={height} fill="#ffffff" />

              {/* Grille horizontale uniquement */}
              {priceTickValues.map((price, i) => (
                <g key={i}>
                  <line
                    x1={margin.left}
                    y1={yScale(price)}
                    x2={margin.left + chartWidth}
                    y2={yScale(price)}
                    stroke="#f3f4f6"
                    strokeWidth="1"
                  />
                  <text
                    x={margin.left - 8}
                    y={yScale(price) + 4}
                    textAnchor="end"
                    className="text-xs fill-gray-400 font-mono"
                    style={{ fontSize: '11px', fontFamily: 'monospace' }}
                  >
                    {price.toFixed(2)}
                  </text>
                </g>
              ))}

              {/* Dates en bas */}
              {dateTickIndices.map((idx, i) => (
                <text
                  key={i}
                  x={xScale(idx)}
                  y={height - 15}
                  textAnchor="middle"
                  style={{ fontSize: '11px', fill: '#9ca3af', fontFamily: 'sans-serif' }}
                >
                  {new Date(candles[idx].date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' })}
                </text>
              ))}

              {/* Zones affichées uniquement à partir de first_seen */}
              {showZones && zones.map((zone) => {
                const startIdx = dateToIndex.get(zone.first_seen);
                if (startIdx === undefined) return null;

                const x1 = xScale(startIdx);
                const x2 = margin.left + chartWidth;
                const y1 = yScale(zone.price_high);
                const y2 = yScale(zone.price_low);
                const zoneHeight = y2 - y1;

                let fillColor = 'rgba(59, 130, 246, 0.08)';
                let strokeColor = 'rgba(59, 130, 246, 0.3)';

                if (!zone.is_active) {
                  fillColor = 'rgba(156, 163, 175, 0.08)';
                  strokeColor = 'rgba(156, 163, 175, 0.3)';
                } else if (zone.is_validated) {
                  fillColor = 'rgba(34, 197, 94, 0.10)';
                  strokeColor = 'rgba(34, 197, 94, 0.4)';
                }

                return (
                  <g key={zone.id}>
                    <rect
                      x={x1}
                      y={y1}
                      width={x2 - x1}
                      height={Math.max(1, zoneHeight)}
                      fill={fillColor}
                    />
                    <line x1={x1} y1={y1} x2={x2} y2={y1} stroke={strokeColor} strokeWidth="1" strokeDasharray="3,3" />
                    <line x1={x1} y1={y2} x2={x2} y2={y2} stroke={strokeColor} strokeWidth="1" strokeDasharray="3,3" />
                  </g>
                );
              })}

              {/* Bougies */}
              {candles.map((c, i) => {
                const x = xScale(i);
                const isBullish = c.close >= c.open;
                const color = isBullish ? '#22c55e' : '#ef4444';
                const bodyTop = yScale(Math.max(c.open, c.close));
                const bodyBottom = yScale(Math.min(c.open, c.close));
                const bodyHeight = Math.max(1, bodyBottom - bodyTop);

                return (
                  <g key={i}>
                    <line
                      x1={x}
                      y1={yScale(c.high)}
                      x2={x}
                      y2={yScale(c.low)}
                      stroke={color}
                      strokeWidth="1"
                    />
                    <rect
                      x={x - candleWidth / 2}
                      y={bodyTop}
                      width={candleWidth}
                      height={bodyHeight}
                      fill={isBullish ? '#ffffff' : color}
                      stroke={color}
                      strokeWidth="1"
                    />
                  </g>
                );
              })}

              {/* Crosshair vertical discret */}
              {tooltip && currentIdx >= 0 && (
                <line
                  x1={xScale(currentIdx)}
                  y1={margin.top}
                  x2={xScale(currentIdx)}
                  y2={margin.top + chartHeight}
                  stroke="#d1d5db"
                  strokeDasharray="3,3"
                  strokeWidth="1"
                />
              )}

              {/* Cadre léger */}
              <rect
                x={margin.left}
                y={margin.top}
                width={chartWidth}
                height={chartHeight}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            </svg>

            {/* Tooltip minimaliste sous le graphique */}
            {tooltip && (
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm font-mono text-gray-700">
                <span className="font-bold text-primary">
                  {new Date(tooltip.candle.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                <span>O <span className="font-bold">{tooltip.candle.open.toFixed(2)}</span></span>
                <span>H <span className="font-bold">{tooltip.candle.high.toFixed(2)}</span></span>
                <span>L <span className="font-bold">{tooltip.candle.low.toFixed(2)}</span></span>
                <span>C <span className={`font-bold ${tooltip.candle.close >= tooltip.candle.open ? 'text-green-600' : 'text-red-600'}`}>{tooltip.candle.close.toFixed(2)}</span></span>
                <span className={`font-bold ${tooltip.candle.close >= tooltip.candle.open ? 'text-green-600' : 'text-red-600'}`}>
                  {((tooltip.candle.close - tooltip.candle.open) / tooltip.candle.open * 100).toFixed(2)}%
                </span>
              </div>
            )}
          </div>

          {/* Légende compacte */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border border-green-500 bg-white" />
              <span>Haussière</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500" />
              <span>Baissière</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500/20 border border-dashed border-green-500" />
              <span>Support validé</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500/10 border border-dashed border-blue-500" />
              <span>Support détecté</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400/10 border border-dashed border-gray-400" />
              <span>Invalidée</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AssetChart;
