import '../../../shared/utils/json_parsing.dart';

/// Performance agrégée (GET /api/execution/performance/), réponse de PerformanceView.
/// L'API renvoie 404 « Aucune stratégie trouvée. » si l'utilisateur n'a pas de stratégie.
class Performance {
  const Performance({
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
    this.strategyConfig,
    this.riskFreeRate = 0.04,
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
  final double riskFreeRate;

  factory Performance.fromJson(Map<String, dynamic> json) => Performance(
        strategyConfig: json['strategy_config'] == null ? null : parseInt(json['strategy_config']),
        totalInvested: parseDouble(json['total_invested']),
        totalRecoveredFromSells: parseDouble(json['total_recovered_from_sells']),
        realizedPnl: parseDouble(json['realized_pnl']),
        realizedPnlPct: parseDouble(json['realized_pnl_pct']),
        totalBuys: parseInt(json['total_buys']),
        totalSells: parseInt(json['total_sells']),
        openPositions: parseInt(json['open_positions']),
        closedPositions: parseInt(json['closed_positions']),
        sealedPositions: parseInt(json['sealed_positions']),
        winRatePct: parseDouble(json['win_rate_pct']),
        maxDrawdownPct: parseDouble(json['max_drawdown_pct']),
        sharpeRatio: parseDouble(json['sharpe_ratio']),
        riskFreeRate: parseDouble(json['risk_free_rate'], 0.04),
      );
}
