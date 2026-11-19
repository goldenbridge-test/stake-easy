import '../../../shared/utils/json_parsing.dart';
import 'price_range.dart';

/// Trade exécuté (GET /api/execution/trades/), champs de TradeSerializer.
class Trade {
  const Trade({
    required this.id,
    required this.strategyConfig,
    required this.mode,
    required this.side,
    required this.price,
    required this.amountQuote,
    required this.amountBase,
    this.position,
    this.zone,
    this.executedAt,
    this.exchangeOrderId,
    this.zoneRange,
    this.symbol,
  });

  final int id;
  final int strategyConfig;
  final int? position;
  final int? zone;
  final String mode;
  final String side; // buy | sell
  final DateTime? executedAt;
  final double price;
  final double amountQuote;
  final double amountBase;
  final String? exchangeOrderId;
  final PriceRange? zoneRange;

  /// Absent de TradeSerializer : à déduire via la position / la stratégie.
  final String? symbol;

  bool get isBuy => side == 'buy';

  factory Trade.fromJson(Map<String, dynamic> json) => Trade(
        id: parseInt(json['id']),
        strategyConfig: parseInt(json['strategy_config']),
        position: json['position'] == null ? null : parseInt(json['position']),
        zone: json['zone'] == null ? null : parseInt(json['zone']),
        mode: json['mode']?.toString() ?? '',
        side: json['side']?.toString() ?? '',
        executedAt: parseDate(json['executed_at']),
        price: parseDouble(json['price']),
        amountQuote: parseDouble(json['amount_quote']),
        amountBase: parseDouble(json['amount_base']),
        exchangeOrderId: json['exchange_order_id']?.toString(),
        zoneRange: PriceRange.fromJson(json['zone_range']),
        symbol: json['symbol']?.toString(),
      );
}
