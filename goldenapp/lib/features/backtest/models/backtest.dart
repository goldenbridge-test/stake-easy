import '../../../shared/utils/json_parsing.dart';

/// Statuts de BacktestRequest.STATUS_CHOICES.
enum BacktestStatus {
  pending('pending', 'En attente'),
  running('running', 'En cours'),
  completed('completed', 'Terminé'),
  failed('failed', 'Échoué');

  const BacktestStatus(this.apiValue, this.label);

  final String apiValue;
  final String label;

  bool get isInProgress => this == pending || this == running;

  static BacktestStatus fromApi(Object? value) => BacktestStatus.values.firstWhere(
        (s) => s.apiValue == value,
        orElse: () => BacktestStatus.pending,
      );
}

/// Bloc "cagr" des résultats (calculate_cagr).
class CagrMetrics {
  const CagrMetrics({
    required this.performanceTotalePct,
    required this.moyenneAnnualiseePct,
    required this.cagrPct,
  });

  final double performanceTotalePct;
  final double moyenneAnnualiseePct;
  final double cagrPct;

  factory CagrMetrics.fromJson(Object? json) {
    final m = json is Map ? json : const {};
    return CagrMetrics(
      performanceTotalePct: parseDouble(m['performance_totale_pct']),
      moyenneAnnualiseePct: parseDouble(m['moyenne_annualisee_pct']),
      cagrPct: parseDouble(m['cagr_pct']),
    );
  }
}

/// Champ JSON "results" rempli par la tâche run_client_backtest.
class BacktestResults {
  const BacktestResults({
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
    this.riskFreeRate = 0.04,
  });

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
  final List<String> equityDates; // ISO yyyy-mm-dd
  final CagrMetrics cagr;
  final double nbYears;
  final double finalCapital;
  final double riskFreeRate;

  factory BacktestResults.fromJson(Map<String, dynamic> json) => BacktestResults(
        candlesAnalyzed: parseInt(json['candles_analyzed']),
        totalBuys: parseInt(json['total_buys']),
        totalSells: parseInt(json['total_sells']),
        realizedPnl: parseDouble(json['realized_pnl']),
        realizedPnlPct: parseDouble(json['realized_pnl_pct']),
        unrealizedPnl: parseDouble(json['unrealized_pnl']),
        unrealizedPnlPct: parseDouble(json['unrealized_pnl_pct']),
        totalPnl: parseDouble(json['total_pnl']),
        totalPnlPct: parseDouble(json['total_pnl_pct']),
        openPositions: parseInt(json['open_positions']),
        closedPositions: parseInt(json['closed_positions']),
        investedInOpen: parseDouble(json['invested_in_open']),
        winRatePct: parseDouble(json['win_rate_pct']),
        winRateSampleSize: parseInt(json['win_rate_sample_size']),
        maxDrawdownPct: parseDouble(json['max_drawdown_pct']),
        sharpeRatio: parseDouble(json['sharpe_ratio']),
        equityCurve: parseDoubleList(json['equity_curve']),
        equityDates: json['equity_dates'] is List
            ? List.unmodifiable((json['equity_dates'] as List).map((e) => e.toString()))
            : const [],
        cagr: CagrMetrics.fromJson(json['cagr']),
        nbYears: parseDouble(json['nb_years']),
        finalCapital: parseDouble(json['final_capital']),
        riskFreeRate: parseDouble(json['risk_free_rate'], 0.04),
      );
}

/// Backtest (GET/POST /api/execution/backtests/), champs de BacktestRequestSerializer.
class BacktestRequest {
  const BacktestRequest({
    required this.id,
    required this.exchange,
    required this.symbol,
    required this.capital,
    required this.discountPct,
    required this.status,
    this.startDate,
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
  final BacktestStatus status;
  final BacktestResults? results;
  final String error;
  final DateTime? createdAt;
  final DateTime? completedAt;

  factory BacktestRequest.fromJson(Map<String, dynamic> json) => BacktestRequest(
        id: parseInt(json['id']),
        exchange: json['exchange']?.toString() ?? 'binance',
        symbol: json['symbol']?.toString() ?? '',
        capital: parseDouble(json['capital']),
        startDate: parseDate(json['start_date']),
        discountPct: parseDouble(json['discount_pct'], 75),
        status: BacktestStatus.fromApi(json['status']),
        results: json['results'] is Map<String, dynamic>
            ? BacktestResults.fromJson(json['results'] as Map<String, dynamic>)
            : null,
        error: json['error']?.toString() ?? '',
        createdAt: parseDate(json['created_at']),
        completedAt: parseDate(json['completed_at']),
      );
}

/// Saisie du formulaire de backtest (champs écrits du serializer).
class BacktestDraft {
  const BacktestDraft({
    required this.symbol,
    required this.capital,
    this.exchange = 'binance',
    this.startDate,
    this.discountPct = 75,
  });

  final String exchange;
  final String symbol;
  final double capital;
  final DateTime? startDate;
  final double discountPct;

  Map<String, dynamic> toJson() => {
        'exchange': exchange,
        'symbol': symbol,
        'capital': capital.toStringAsFixed(2),
        if (startDate != null)
          'start_date': '${startDate!.year.toString().padLeft(4, '0')}-'
              '${startDate!.month.toString().padLeft(2, '0')}-'
              '${startDate!.day.toString().padLeft(2, '0')}',
        'discount_pct': discountPct.toStringAsFixed(2),
      };
}

/// Actifs disponibles côté backend (AVAILABLE_SYMBOLS de execution/views.py).
const List<String> backtestSymbols = [
  'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT',
  'ADA/USDT', 'AVAX/USDT', 'DOT/USDT', 'LINK/USDT', 'MATIC/USDT',
];
