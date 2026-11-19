import 'json_utils.dart';
import 'zone_range.dart';

/// Statut calculé par le backend : `open`, `sealed` (accumulation scellée) ou `closed`.
enum PositionStatus {
  open('Ouverte'),
  sealed('Scellée'),
  closed('Clôturée');

  const PositionStatus(this.label);
  final String label;

  static PositionStatus parse(Object? value) => switch (value) {
    'closed' => PositionStatus.closed,
    'sealed' => PositionStatus.sealed,
    _ => PositionStatus.open,
  };
}

/// Position du bot : `PositionSerializer` (`GET /execution/positions/`).
class Position {
  const Position({
    required this.id,
    required this.strategyConfig,
    required this.symbol,
    required this.exchange,
    required this.mode,
    this.entryZone,
    required this.entryPrice,
    required this.totalAmountBase,
    required this.totalQuoteSpent,
    required this.buyCount,
    required this.highWaterMark,
    required this.isSealed,
    required this.isFullyClosed,
    this.firstBuyAt,
    this.createdAt,
    this.updatedAt,
    this.entryZoneRange,
    required this.remainingBase,
    required this.currentPrice,
    required this.marketValue,
    required this.realizedPnl,
    required this.unrealizedPnl,
    required this.totalPnl,
    required this.pnlPct,
    required this.status,
  });

  final int id;
  final int strategyConfig;
  final String symbol;
  final String exchange;

  /// `test`, `live` ou `walkforward`.
  final String mode;
  final int? entryZone;
  final double entryPrice;
  final double totalAmountBase;
  final double totalQuoteSpent;
  final int buyCount;
  final double highWaterMark;
  final bool isSealed;
  final bool isFullyClosed;
  final DateTime? firstBuyAt;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  // Champs calculés par le serializer.
  final ZoneRange? entryZoneRange;
  final double remainingBase;
  final double currentPrice;
  final double marketValue;
  final double realizedPnl;
  final double unrealizedPnl;
  final double totalPnl;
  final double pnlPct;
  final PositionStatus status;

  /// Actif de base (`BTC` pour `BTC/USDT`).
  String get baseAsset => symbol.split('/').first;

  /// Devise de cotation (`USDT` pour `BTC/USDT`).
  String get quoteAsset {
    final parts = symbol.split('/');
    return parts.length > 1 ? parts[1] : '';
  }

  bool get isOpen => status != PositionStatus.closed;
  bool get isProfitable => totalPnl >= 0;

  /// Date d'ouverture : premier achat, sinon création.
  DateTime? get openedAt => firstBuyAt ?? createdAt;

  factory Position.fromJson(Map<String, dynamic> json) => Position(
    id: toInt(json['id']),
    strategyConfig: toInt(json['strategy_config']),
    symbol: toStr(json['symbol']),
    exchange: toStr(json['exchange']),
    mode: toStr(json['mode']),
    entryZone: toIntOrNull(json['entry_zone']),
    entryPrice: toDouble(json['entry_price']),
    totalAmountBase: toDouble(json['total_amount_base']),
    totalQuoteSpent: toDouble(json['total_quote_spent']),
    buyCount: toInt(json['buy_count']),
    highWaterMark: toDouble(json['high_water_mark']),
    isSealed: toBool(json['is_sealed']),
    isFullyClosed: toBool(json['is_fully_closed']),
    firstBuyAt: toDate(json['first_buy_at']),
    createdAt: toDate(json['created_at']),
    updatedAt: toDate(json['updated_at']),
    entryZoneRange: ZoneRange.fromJson(json['entry_zone_range']),
    remainingBase: toDouble(json['remaining_base']),
    currentPrice: toDouble(json['current_price']),
    marketValue: toDouble(json['market_value']),
    realizedPnl: toDouble(json['realized_pnl']),
    unrealizedPnl: toDouble(json['unrealized_pnl']),
    totalPnl: toDouble(json['total_pnl']),
    pnlPct: toDouble(json['pnl_pct']),
    status: PositionStatus.parse(json['status']),
  );
}
