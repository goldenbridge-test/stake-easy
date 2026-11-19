import 'cagr.dart';
import 'json_utils.dart';

/// Résultats d'un backtest terminé (champ JSON `results` de `BacktestRequest`).
class BacktestResults {
  const BacktestResults({
    required this.raw,
    required this.candlesAnalyzed,
    required this.totalBuys,
    required this.totalSells,
    required this.realizedPnl,
    required this.realizedPnlPct,
    required this.unrealizedPnl,
    required this.unrealizedPnlPct,
    required this.totalPnl,
    required this.totalPnlPct,
    required this.openPositions,
    required this.closedPositions,
    required this.investedInOpen,
    required this.winRatePct,
    required this.winRateSampleSize,
    required this.maxDrawdownPct,
    required this.sharpeRatio,
    required this.equityCurve,
    required this.equityDates,
    required this.cagr,
    required this.nbYears,
    required this.finalCapital,
  });

  /// JSON brut, pour les clés non modélisées.
  final Map<String, dynamic> raw;
  final int candlesAnalyzed;
  final int totalBuys;
  final int totalSells;
  final double realizedPnl;
  final double realizedPnlPct;
  final double unrealizedPnl;
  final double unrealizedPnlPct;
  final double totalPnl;
  final double totalPnlPct;
  final int openPositions;
  final int closedPositions;
  final double investedInOpen;
  final double winRatePct;
  final int winRateSampleSize;
  final double maxDrawdownPct;
  final double sharpeRatio;
  final List<double> equityCurve;
  final List<DateTime?> equityDates;
  final Cagr cagr;
  final double nbYears;
  final double finalCapital;

  factory BacktestResults.fromJson(Map<String, dynamic> json) {
    final curve = json['equity_curve'];
    final dates = json['equity_dates'];
    return BacktestResults(
      raw: json,
      candlesAnalyzed: toInt(json['candles_analyzed']),
      totalBuys: toInt(json['total_buys']),
      totalSells: toInt(json['total_sells']),
      realizedPnl: toDouble(json['realized_pnl']),
      realizedPnlPct: toDouble(json['realized_pnl_pct']),
      unrealizedPnl: toDouble(json['unrealized_pnl']),
      unrealizedPnlPct: toDouble(json['unrealized_pnl_pct']),
      totalPnl: toDouble(json['total_pnl']),
      totalPnlPct: toDouble(json['total_pnl_pct']),
      openPositions: toInt(json['open_positions']),
      closedPositions: toInt(json['closed_positions']),
      investedInOpen: toDouble(json['invested_in_open']),
      winRatePct: toDouble(json['win_rate_pct']),
      winRateSampleSize: toInt(json['win_rate_sample_size']),
      maxDrawdownPct: toDouble(json['max_drawdown_pct']),
      sharpeRatio: toDouble(json['sharpe_ratio']),
      equityCurve:
          curve is List ? curve.map((v) => toDouble(v)).toList() : const [],
      equityDates: dates is List ? dates.map(toDate).toList() : const [],
      cagr: Cagr.fromJson(json['cagr']),
      nbYears: toDouble(json['nb_years']),
      finalCapital: toDouble(json['final_capital']),
    );
  }
}

/// Demande de backtest : `BacktestRequestSerializer` (`/execution/backtests/`).
class Backtest {
  const Backtest({
    required this.id,
    required this.exchange,
    required this.symbol,
    required this.capital,
    this.startDate,
    required this.discountPct,
    required this.status,
    this.results,
    this.error = '',
    this.createdAt,
    this.completedAt,
  });

  final int id;
  final String exchange;
  final String symbol;
  final double capital;
  final DateTime? startDate;
  final double discountPct;

  /// `pending`, `running`, `completed` ou `failed`.
  final String status;
  final BacktestResults? results;
  final String error;
  final DateTime? createdAt;
  final DateTime? completedAt;

  bool get isCompleted => status == 'completed';
  bool get isFailed => status == 'failed';
  bool get isPending => status == 'pending' || status == 'running';

  String get statusLabel => switch (status) {
    'pending' => 'En attente',
    'running' => 'En cours',
    'completed' => 'Terminé',
    'failed' => 'Échoué',
    _ => status,
  };

  factory Backtest.fromJson(Map<String, dynamic> json) {
    final results = json['results'];
    return Backtest(
      id: toInt(json['id']),
      exchange: toStr(json['exchange'], 'binance'),
      symbol: toStr(json['symbol']),
      capital: toDouble(json['capital']),
      startDate: toDate(json['start_date']),
      discountPct: toDouble(json['discount_pct'], 75),
      status: toStr(json['status'], 'pending'),
      results:
          results is Map
              ? BacktestResults.fromJson(Map<String, dynamic>.from(results))
              : null,
      error: toStr(json['error']),
      createdAt: toDate(json['created_at']),
      completedAt: toDate(json['completed_at']),
    );
  }

  /// Corps du `POST /execution/backtests/` (champs modifiables uniquement).
  static Map<String, dynamic> createJson({
    required String symbol,
    required double capital,
    String exchange = 'binance',
    DateTime? startDate,
    double? discountPct,
  }) => {
    'exchange': exchange,
    'symbol': symbol,
    'capital': capital.toString(),
    if (startDate != null) 'start_date': formatDate(startDate),
    if (discountPct != null) 'discount_pct': discountPct.toString(),
  };
}
