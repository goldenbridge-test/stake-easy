import 'dart:math' as math;

import '../portfolio/portfolio_mock_data.dart';
import 'models/chart_data.dart';
import 'models/dashboard_data.dart';
import 'models/performance.dart';

// Données factices du tableau de bord. À remplacer par
// GET /api/execution/performance/, /positions/ et /chart-data/.

const Performance mockPerformance = Performance(
  totalInvested: 5338.55,
  totalRecoveredFromSells: 2103.9,
  realizedPnl: 263.9,
  realizedPnlPct: 4.94,
  totalBuys: 8,
  totalSells: 2,
  openPositions: 3,
  closedPositions: 1,
  sealedPositions: 1,
  winRatePct: 100,
  maxDrawdownPct: 12.37,
  sharpeRatio: 1.42,
);

Future<DashboardData> loadMockDashboard() async {
  await Future<void>.delayed(const Duration(milliseconds: 400));
  return DashboardData(performance: mockPerformance, positions: mockPositions);
}

const Map<String, double> _basePrices = {
  'BTC/USDT': 67000,
  'ETH/USDT': 2650,
  'SOL/USDT': 150,
  'BNB/USDT': 590,
};

/// Bougies déterministes sur 90 jours + deux zones de support.
Future<ChartData> loadMockChart(String symbol) async {
  await Future<void>.delayed(const Duration(milliseconds: 300));
  final base = _basePrices[symbol] ?? 1;
  final seed = symbol.codeUnits.fold<int>(0, (a, b) => a + b);
  const days = 90;
  final end = DateTime(2026, 11, 18);
  final candles = <ChartCandle>[];
  var close = base * 0.86;
  for (var i = 0; i < days; i++) {
    final open = close;
    close = open * (1 + 0.0035 + 0.022 * math.sin((i + seed) / 4.5) * math.cos(i / 13));
    final high = math.max(open, close) * 1.012;
    final low = math.min(open, close) * 0.988;
    candles.add(ChartCandle(
      date: end.subtract(Duration(days: days - 1 - i)),
      open: open,
      high: high,
      low: low,
      close: close,
    ));
  }
  return ChartData(
    symbol: symbol,
    candles: candles,
    zones: [
      ChartZone(
        id: seed,
        priceLow: base * 0.88,
        priceHigh: base * 0.905,
        touchCount: 3,
        isActive: true,
        isValidated: true,
        firstSeen: DateTime(2026, 8, 30),
      ),
      ChartZone(
        id: seed + 1,
        priceLow: base * 0.95,
        priceHigh: base * 0.965,
        touchCount: 2,
        isActive: true,
        isValidated: false,
        firstSeen: DateTime(2026, 10, 2),
      ),
    ],
  );
}
