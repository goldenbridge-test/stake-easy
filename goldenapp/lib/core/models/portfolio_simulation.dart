import 'cagr.dart';
import 'json_utils.dart';

/// Synthèse du portefeuille simulé (`portfolio_summary`).
class PortfolioSummary {
  const PortfolioSummary({
    required this.totalAssets,
    required this.totalCapital,
    required this.finalCapital,
    required this.nbYears,
    required this.totalPnl,
    required this.totalPnlPct,
    required this.totalRealizedPnl,
    required this.totalRealizedPct,
    required this.totalUnrealizedPnl,
    required this.totalUnrealizedPct,
    required this.sharpeRatio,
    required this.maxDrawdownPct,
    required this.cagr,
    required this.riskFreeRate,
    this.bestPerformer,
    this.worstPerformer,
  });

  final int totalAssets;
  final double totalCapital;
  final double finalCapital;
  final double nbYears;
  final double totalPnl;
  final double totalPnlPct;
  final double totalRealizedPnl;
  final double totalRealizedPct;
  final double totalUnrealizedPnl;
  final double totalUnrealizedPct;
  final double sharpeRatio;
  final double maxDrawdownPct;
  final Cagr cagr;
  final double riskFreeRate;
  final String? bestPerformer;
  final String? worstPerformer;

  factory PortfolioSummary.fromJson(Map<String, dynamic> json) =>
      PortfolioSummary(
        totalAssets: toInt(json['total_assets']),
        totalCapital: toDouble(json['total_capital']),
        finalCapital: toDouble(json['final_capital']),
        nbYears: toDouble(json['nb_years']),
        totalPnl: toDouble(json['total_pnl']),
        totalPnlPct: toDouble(json['total_pnl_pct']),
        totalRealizedPnl: toDouble(json['total_realized_pnl']),
        totalRealizedPct: toDouble(json['total_realized_pct']),
        totalUnrealizedPnl: toDouble(json['total_unrealized_pnl']),
        totalUnrealizedPct: toDouble(json['total_unrealized_pct']),
        sharpeRatio: toDouble(json['sharpe_ratio']),
        maxDrawdownPct: toDouble(json['max_drawdown_pct']),
        cagr: Cagr.fromJson(json['cagr']),
        riskFreeRate: toDouble(json['risk_free_rate']),
        bestPerformer: toStrOrNull(json['best_performer']),
        worstPerformer: toStrOrNull(json['worst_performer']),
      );
}

/// Résultat d'un actif dans la simulation (`rankings[]`).
class PortfolioRanking {
  const PortfolioRanking({
    required this.id,
    required this.symbol,
    required this.status,
    required this.capitalAllocated,
    required this.realizedPnl,
    required this.realizedPnlPct,
    required this.unrealizedPnl,
    required this.unrealizedPnlPct,
    required this.totalPnl,
    required this.totalPnlPct,
    required this.winRatePct,
    required this.winRateSampleSize,
    required this.maxDrawdownPct,
    required this.sharpeRatio,
    required this.totalBuys,
    required this.totalSells,
    required this.candlesAnalyzed,
    required this.openPositions,
    required this.closedPositions,
    required this.investedInOpen,
    required this.cagr,
    required this.nbYears,
    required this.finalCapital,
  });

  final int id;
  final String symbol;
  final String status;
  final double capitalAllocated;
  final double realizedPnl;
  final double realizedPnlPct;
  final double unrealizedPnl;
  final double unrealizedPnlPct;
  final double totalPnl;
  final double totalPnlPct;
  final double winRatePct;
  final int winRateSampleSize;
  final double maxDrawdownPct;
  final double sharpeRatio;
  final int totalBuys;
  final int totalSells;
  final int candlesAnalyzed;
  final int openPositions;
  final int closedPositions;
  final double investedInOpen;
  final Cagr cagr;
  final double nbYears;
  final double finalCapital;

  bool get isCompleted => status == 'completed';

  factory PortfolioRanking.fromJson(Map<String, dynamic> json) =>
      PortfolioRanking(
        id: toInt(json['id']),
        symbol: toStr(json['symbol']),
        status: toStr(json['status']),
        capitalAllocated: toDouble(json['capital_allocated']),
        realizedPnl: toDouble(json['realized_pnl']),
        realizedPnlPct: toDouble(json['realized_pnl_pct']),
        unrealizedPnl: toDouble(json['unrealized_pnl']),
        unrealizedPnlPct: toDouble(json['unrealized_pnl_pct']),
        totalPnl: toDouble(json['total_pnl']),
        totalPnlPct: toDouble(json['total_pnl_pct']),
        winRatePct: toDouble(json['win_rate_pct']),
        winRateSampleSize: toInt(json['win_rate_sample_size']),
        maxDrawdownPct: toDouble(json['max_drawdown_pct']),
        sharpeRatio: toDouble(json['sharpe_ratio']),
        totalBuys: toInt(json['total_buys']),
        totalSells: toInt(json['total_sells']),
        candlesAnalyzed: toInt(json['candles_analyzed']),
        openPositions: toInt(json['open_positions']),
        closedPositions: toInt(json['closed_positions']),
        investedInOpen: toDouble(json['invested_in_open']),
        cagr: Cagr.fromJson(json['cagr']),
        nbYears: toDouble(json['nb_years']),
        finalCapital: toDouble(json['final_capital']),
      );
}

/// Simulation de portefeuille : `GET /execution/portfolio-simulation/?ids=1&ids=2`.
class PortfolioSimulation {
  const PortfolioSimulation({
    required this.status,
    required this.progress,
    required this.summary,
    required this.rankings,
  });

  /// `running` tant qu'un backtest n'est pas terminé, puis `completed`.
  final String status;

  /// Avancement « terminés/total », ex. `3/5`.
  final String progress;
  final PortfolioSummary summary;
  final List<PortfolioRanking> rankings;

  bool get isCompleted => status == 'completed';

  /// Avancement entre 0 et 1, déduit de [progress].
  double get progressRatio {
    final parts = progress.split('/');
    if (parts.length != 2) return isCompleted ? 1 : 0;
    final done = int.tryParse(parts[0]) ?? 0;
    final total = int.tryParse(parts[1]) ?? 0;
    return total == 0 ? 0 : done / total;
  }

  factory PortfolioSimulation.fromJson(Map<String, dynamic> json) =>
      PortfolioSimulation(
        status: toStr(json['status'], 'running'),
        progress: toStr(json['progress']),
        summary: PortfolioSummary.fromJson(toMap(json['portfolio_summary'])),
        rankings: toList(json['rankings'], PortfolioRanking.fromJson),
      );
}

/// Réponse du lancement : `POST /execution/portfolio-simulation/`.
class PortfolioSimulationLaunch {
  const PortfolioSimulationLaunch({
    required this.batchIds,
    required this.symbols,
    required this.capitalPerAsset,
    required this.totalCapital,
    required this.status,
  });

  final List<int> batchIds;
  final List<String> symbols;
  final double capitalPerAsset;
  final double totalCapital;
  final String status;

  factory PortfolioSimulationLaunch.fromJson(Map<String, dynamic> json) {
    final ids = json['batch_ids'];
    final symbols = json['symbols'];
    return PortfolioSimulationLaunch(
      batchIds: ids is List ? ids.map((v) => toInt(v)).toList() : const [],
      symbols:
          symbols is List
              ? symbols.map((v) => v.toString()).toList()
              : const [],
      capitalPerAsset: toDouble(json['capital_per_asset']),
      totalCapital: toDouble(json['total_capital']),
      status: toStr(json['status'], 'running'),
    );
  }

  /// Corps du `POST` : symboles parmi les actifs autorisés par le backend.
  static Map<String, dynamic> requestJson({
    required List<String> symbols,
    required double capital,
    DateTime? startDate,
  }) => {
    'symbols': symbols,
    'capital': capital.toString(),
    if (startDate != null) 'start_date': formatDate(startDate),
  };
}
