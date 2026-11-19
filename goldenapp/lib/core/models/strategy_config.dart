import 'json_utils.dart';

/// Configuration de stratégie DCA-sur-zones : `StrategyConfigSerializer`.
class StrategyConfig {
  const StrategyConfig({
    required this.id,
    required this.exchange,
    required this.symbol,
    required this.mode,
    required this.balanceQuote,
    required this.discountPct,
    required this.isActive,
    this.exchangeConnection,
    required this.symbolBase,
    required this.isRunning,
    required this.positionCount,
  });

  final int id;
  final String exchange;
  final String symbol;

  /// `test` (paper trading), `live` ou `walkforward`.
  final String mode;
  final double balanceQuote;
  final double discountPct;
  final bool isActive;
  final int? exchangeConnection;

  // Lecture seule.
  final String symbolBase;
  final bool isRunning;
  final int positionCount;

  String get modeLabel => switch (mode) {
    'live' => 'Réel',
    'test' => 'Simulation',
    'walkforward' => 'Historique',
    _ => mode,
  };

  factory StrategyConfig.fromJson(Map<String, dynamic> json) => StrategyConfig(
    id: toInt(json['id']),
    exchange: toStr(json['exchange']),
    symbol: toStr(json['symbol']),
    mode: toStr(json['mode'], 'test'),
    balanceQuote: toDouble(json['balance_quote']),
    discountPct: toDouble(json['discount_pct'], 75),
    isActive: toBool(json['is_active'], true),
    exchangeConnection: toIntOrNull(json['exchange_connection']),
    symbolBase: toStr(json['symbol_base']),
    isRunning: toBool(json['is_running']),
    positionCount: toInt(json['position_count']),
  );

  /// Champs modifiables (création / mise à jour).
  Map<String, dynamic> toJson() => writeJson(
    exchange: exchange,
    symbol: symbol,
    mode: mode,
    balanceQuote: balanceQuote,
    discountPct: discountPct,
    isActive: isActive,
    exchangeConnection: exchangeConnection,
  );

  static Map<String, dynamic> writeJson({
    required String exchange,
    required String symbol,
    required String mode,
    required double balanceQuote,
    double? discountPct,
    bool? isActive,
    int? exchangeConnection,
  }) => {
    'exchange': exchange,
    'symbol': symbol,
    'mode': mode,
    'balance_quote': balanceQuote.toString(),
    if (discountPct != null) 'discount_pct': discountPct.toString(),
    if (isActive != null) 'is_active': isActive,
    'exchange_connection': exchangeConnection,
  };
}
