import 'json_utils.dart';

/// Performance agrégée : `GET /execution/performance/`.
class Performance {
  const Performance({
    this.strategyConfig,
    required this.totalInvested,
    required this.totalRecoveredFromSells,
    required this.realizedPnl,
    required this.realizedPnlPct,
    required this.totalBuys,
    required this.totalSells,
    required this.openPositions,
    required this.closedPositions,
    required this.sealedPositions,
    required this.winRatePct,
    required this.maxDrawdownPct,
    required this.sharpeRatio,
    required this.riskFreeRate,
  });

  final int? strategyConfig;
  final double totalInvested;
  final double totalRecoveredFromSells;
  final double realizedPnl;
  final double realizedPnlPct;
  final int totalBuys;
  final int totalSells;
  final int openPositions;
  final int closedPositions;
  final int sealedPositions;
  final double winRatePct;
  final double maxDrawdownPct;
  final double sharpeRatio;

  /// Taux sans risque annuel (0.04 = 4 %).
  final double riskFreeRate;

  int get totalTrades => totalBuys + totalSells;

  factory Performance.fromJson(Map<String, dynamic> json) => Performance(
    strategyConfig: toIntOrNull(json['strategy_config']),
    totalInvested: toDouble(json['total_invested']),
    totalRecoveredFromSells: toDouble(json['total_recovered_from_sells']),
    realizedPnl: toDouble(json['realized_pnl']),
    realizedPnlPct: toDouble(json['realized_pnl_pct']),
    totalBuys: toInt(json['total_buys']),
    totalSells: toInt(json['total_sells']),
    openPositions: toInt(json['open_positions']),
    closedPositions: toInt(json['closed_positions']),
    sealedPositions: toInt(json['sealed_positions']),
    winRatePct: toDouble(json['win_rate_pct']),
    maxDrawdownPct: toDouble(json['max_drawdown_pct']),
    sharpeRatio: toDouble(json['sharpe_ratio']),
    riskFreeRate: toDouble(json['risk_free_rate']),
  );
}
