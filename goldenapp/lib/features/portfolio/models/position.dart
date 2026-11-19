import '../../../shared/utils/json_parsing.dart';
import 'price_range.dart';

/// Statut calculé par PositionSerializer.get_status.
enum PositionStatus {
  open('open', 'Ouverte'),
  sealed('sealed', 'Scellée'),
  closed('closed', 'Clôturée');

  const PositionStatus(this.apiValue, this.label);

  final String apiValue;
  final String label;

  static PositionStatus fromApi(Object? value) => PositionStatus.values.firstWhere(
        (s) => s.apiValue == value,
        orElse: () => PositionStatus.open,
      );
}

/// Position (GET /api/execution/positions/), champs de PositionSerializer.
class Position {
  const Position({
    required this.id,
    required this.strategyConfig,
    required this.symbol,
    required this.exchange,
    required this.mode,
    required this.entryPrice,
    required this.totalAmountBase,
    required this.totalQuoteSpent,
    required this.buyCount,
    required this.highWaterMark,
    required this.isSealed,
    required this.isFullyClosed,
    required this.createdAt,
    required this.remainingBase,
    required this.currentPrice,
    required this.marketValue,
    required this.realizedPnl,
    required this.unrealizedPnl,
    required this.totalPnl,
    required this.pnlPct,
    required this.status,
    this.entryZone,
    this.entryZoneRange,
    this.firstBuyAt,
    this.updatedAt,
  });

  final int id;
  final int strategyConfig;
  final String symbol; // ex. BTC/USDT
  final String exchange; // binance | bybit | okx
  final String mode; // test | live | walkforward
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
  // Champs calculés
  final PriceRange? entryZoneRange;
  final double remainingBase;
  final double currentPrice;
  final double marketValue;
  final double realizedPnl;
  final double unrealizedPnl;
  final double totalPnl;
  final double pnlPct;
  final PositionStatus status;

  /// Actif de base (BTC pour BTC/USDT).
  String get baseAsset => symbol.split('/').first;

  factory Position.fromJson(Map<String, dynamic> json) => Position(
        id: parseInt(json['id']),
        strategyConfig: parseInt(json['strategy_config']),
        symbol: json['symbol']?.toString() ?? '',
        exchange: json['exchange']?.toString() ?? '',
        mode: json['mode']?.toString() ?? '',
        entryZone: json['entry_zone'] == null ? null : parseInt(json['entry_zone']),
        entryPrice: parseDouble(json['entry_price']),
        totalAmountBase: parseDouble(json['total_amount_base']),
        totalQuoteSpent: parseDouble(json['total_quote_spent']),
        buyCount: parseInt(json['buy_count']),
        highWaterMark: parseDouble(json['high_water_mark']),
        isSealed: json['is_sealed'] == true,
        isFullyClosed: json['is_fully_closed'] == true,
        firstBuyAt: parseDate(json['first_buy_at']),
        createdAt: parseDate(json['created_at']),
        updatedAt: parseDate(json['updated_at']),
        entryZoneRange: PriceRange.fromJson(json['entry_zone_range']),
        remainingBase: parseDouble(json['remaining_base']),
        currentPrice: parseDouble(json['current_price']),
        marketValue: parseDouble(json['market_value']),
        realizedPnl: parseDouble(json['realized_pnl']),
        unrealizedPnl: parseDouble(json['unrealized_pnl']),
        totalPnl: parseDouble(json['total_pnl']),
        pnlPct: parseDouble(json['pnl_pct']),
        status: PositionStatus.fromApi(json['status']),
      );
}
