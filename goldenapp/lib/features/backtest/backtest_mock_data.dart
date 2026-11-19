import 'dart:math' as math;

import 'models/backtest.dart';

// Données factices des backtests. À remplacer par
// POST /api/execution/backtests/ puis GET .../backtests/{id}/ (polling).

BacktestResults _mockResults(double capital, DateTime start) {
  // Courbe de capital déterministe : tendance haussière + oscillations.
  final days = DateTime(2026, 11, 1).difference(start).inDays.clamp(60, 2400);
  const points = 60;
  final curve = <double>[];
  final dates = <String>[];
  for (var i = 0; i < points; i++) {
    final t = i / (points - 1);
    final value = capital * (1 + 0.85 * t + 0.08 * math.sin(i / 3) - 0.12 * math.sin(i / 11));
    curve.add(double.parse(value.toStringAsFixed(2)));
    final d = start.add(Duration(days: (days * t).round()));
    dates.add(d.toIso8601String().substring(0, 10));
  }
  final finalCapital = curve.last;
  final years = days / 365.25;
  final totalPct = (finalCapital / capital - 1) * 100;
  final cagr = (math.pow(finalCapital / capital, 1 / years) - 1) * 100;
  return BacktestResults(
    candlesAnalyzed: days,
    totalBuys: 18,
    totalSells: 11,
    realizedPnl: finalCapital - capital - 142.3,
    realizedPnlPct: (finalCapital - capital - 142.3) / capital * 100,
    unrealizedPnl: 142.3,
    unrealizedPnlPct: 6.4,
    totalPnl: finalCapital - capital,
    totalPnlPct: totalPct,
    openPositions: 2,
    closedPositions: 9,
    investedInOpen: 2210,
    winRatePct: 77.8,
    winRateSampleSize: 9,
    maxDrawdownPct: 18.42,
    sharpeRatio: 1.37,
    equityCurve: curve,
    equityDates: dates,
    cagr: CagrMetrics(
      performanceTotalePct: double.parse(totalPct.toStringAsFixed(2)),
      moyenneAnnualiseePct: double.parse((totalPct / years).toStringAsFixed(2)),
      cagrPct: double.parse(cagr.toStringAsFixed(2)),
    ),
    nbYears: double.parse(years.toStringAsFixed(2)),
    finalCapital: finalCapital,
  );
}

final List<BacktestRequest> _mockHistory = [
  BacktestRequest(
    id: 31,
    exchange: 'binance',
    symbol: 'ETH/USDT',
    capital: 5000,
    startDate: DateTime(2022, 1, 1),
    discountPct: 75,
    status: BacktestStatus.completed,
    results: _mockResults(5000, DateTime(2022, 1, 1)),
    createdAt: DateTime(2026, 11, 12, 10, 4),
    completedAt: DateTime(2026, 11, 12, 10, 6),
  ),
  BacktestRequest(
    id: 29,
    exchange: 'binance',
    symbol: 'DOT/USDT',
    capital: 1000,
    startDate: DateTime(2023, 6, 1),
    discountPct: 75,
    status: BacktestStatus.failed,
    error: 'Aucun historique suffisant pour DOT/USDT.',
    createdAt: DateTime(2026, 11, 9, 17, 40),
  ),
];

Future<List<BacktestRequest>> loadMockBacktests() async {
  await Future<void>.delayed(const Duration(milliseconds: 400));
  return List.unmodifiable(_mockHistory);
}

/// Simule la création + l'attente de fin du backtest.
Future<BacktestRequest> mockRunBacktest(BacktestDraft draft) async {
  await Future<void>.delayed(const Duration(milliseconds: 1500));
  final start = draft.startDate ?? DateTime(2020, 1, 1);
  final bt = BacktestRequest(
    id: DateTime.now().millisecondsSinceEpoch,
    exchange: draft.exchange,
    symbol: draft.symbol,
    capital: draft.capital,
    startDate: start,
    discountPct: draft.discountPct,
    status: BacktestStatus.completed,
    results: _mockResults(draft.capital, start),
    createdAt: DateTime.now(),
    completedAt: DateTime.now(),
  );
  _mockHistory.insert(0, bt);
  return bt;
}
