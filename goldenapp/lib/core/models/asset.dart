import 'json_utils.dart';

/// Actif disposant d'un historique de bougies : `GET /exchanges/assets/`.
class Asset {
  const Asset({
    required this.symbol,
    required this.base,
    required this.quote,
    required this.timeframe,
    this.firstCandle,
    this.lastCandle,
    required this.candleCount,
    required this.historyDays,
    required this.hasSufficientHistory,
  });

  /// Paire, ex. `BTC/USDT`.
  final String symbol;
  final String base;
  final String quote;
  final String timeframe;
  final DateTime? firstCandle;
  final DateTime? lastCandle;
  final int candleCount;
  final int historyDays;

  /// Au moins 365 jours d'historique : requis pour créer une stratégie.
  final bool hasSufficientHistory;

  factory Asset.fromJson(Map<String, dynamic> json) => Asset(
    symbol: toStr(json['symbol']),
    base: toStr(json['base']),
    quote: toStr(json['quote']),
    timeframe: toStr(json['timeframe'], '1d'),
    firstCandle: toDate(json['first_candle']),
    lastCandle: toDate(json['last_candle']),
    candleCount: toInt(json['candle_count']),
    historyDays: toInt(json['history_days']),
    hasSufficientHistory: toBool(json['has_sufficient_history']),
  );
}
