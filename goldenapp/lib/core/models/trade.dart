import 'json_utils.dart';
import 'zone_range.dart';

/// Ordre exécuté par le bot : `TradeSerializer` (`GET /execution/trades/`).
class Trade {
  const Trade({
    required this.id,
    required this.strategyConfig,
    this.position,
    this.zone,
    required this.mode,
    required this.side,
    this.executedAt,
    required this.price,
    required this.amountQuote,
    required this.amountBase,
    this.exchangeOrderId,
    this.zoneRange,
  });

  final int id;
  final int strategyConfig;
  final int? position;
  final int? zone;
  final String mode;

  /// `buy` ou `sell`.
  final String side;
  final DateTime? executedAt;
  final double price;
  final double amountQuote;
  final double amountBase;
  final String? exchangeOrderId;
  final ZoneRange? zoneRange;

  bool get isBuy => side == 'buy';
  bool get isSell => side == 'sell';
  String get sideLabel => isBuy ? 'Achat' : 'Vente';

  factory Trade.fromJson(Map<String, dynamic> json) => Trade(
    id: toInt(json['id']),
    strategyConfig: toInt(json['strategy_config']),
    position: toIntOrNull(json['position']),
    zone: toIntOrNull(json['zone']),
    mode: toStr(json['mode']),
    side: toStr(json['side'], 'buy'),
    executedAt: toDate(json['executed_at']),
    price: toDouble(json['price']),
    amountQuote: toDouble(json['amount_quote']),
    amountBase: toDouble(json['amount_base']),
    exchangeOrderId: toStrOrNull(json['exchange_order_id']),
    zoneRange: ZoneRange.fromJson(json['zone_range']),
  );
}
