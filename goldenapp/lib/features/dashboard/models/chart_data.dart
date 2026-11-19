import '../../../shared/utils/json_parsing.dart';

/// Bougie journalière de ChartDataView.
class ChartCandle {
  const ChartCandle({
    required this.date,
    required this.open,
    required this.high,
    required this.low,
    required this.close,
  });

  final DateTime date;
  final double open;
  final double high;
  final double low;
  final double close;

  factory ChartCandle.fromJson(Map<String, dynamic> json) => ChartCandle(
        date: parseDate(json['date']) ?? DateTime(1970),
        open: parseDouble(json['open']),
        high: parseDouble(json['high']),
        low: parseDouble(json['low']),
        close: parseDouble(json['close']),
      );
}

/// Zone de support détectée par la stratégie.
class ChartZone {
  const ChartZone({
    required this.id,
    required this.priceLow,
    required this.priceHigh,
    required this.touchCount,
    required this.isActive,
    required this.isValidated,
    this.firstSeen,
    this.lastTouched,
    this.zoneType = 'support',
  });

  final int id;
  final double priceLow;
  final double priceHigh;
  final DateTime? firstSeen;
  final DateTime? lastTouched;
  final int touchCount;
  final bool isActive;
  final bool isValidated;
  final String zoneType;

  factory ChartZone.fromJson(Map<String, dynamic> json) => ChartZone(
        id: parseInt(json['id']),
        priceLow: parseDouble(json['price_low']),
        priceHigh: parseDouble(json['price_high']),
        firstSeen: parseDate(json['first_seen']),
        lastTouched: parseDate(json['last_touched']),
        touchCount: parseInt(json['touch_count']),
        isActive: json['is_active'] == true,
        isValidated: json['is_validated'] == true,
        zoneType: json['zone_type']?.toString() ?? 'support',
      );
}

/// GET /api/execution/chart-data/?symbol=BTC/USDT&days=365
class ChartData {
  const ChartData({required this.symbol, required this.candles, required this.zones});

  final String symbol;
  final List<ChartCandle> candles;
  final List<ChartZone> zones;

  List<ChartZone> get activeZones => zones.where((z) => z.isActive).toList(growable: false);

  /// Variation entre la première et la dernière clôture, en %.
  double get changePct {
    if (candles.length < 2 || candles.first.close == 0) return 0;
    return (candles.last.close / candles.first.close - 1) * 100;
  }

  factory ChartData.fromJson(Map<String, dynamic> json) => ChartData(
        symbol: json['symbol']?.toString() ?? '',
        candles: [
          for (final c in (json['candles'] as List? ?? const []))
            ChartCandle.fromJson(Map<String, dynamic>.from(c as Map)),
        ],
        zones: [
          for (final z in (json['zones'] as List? ?? const []))
            ChartZone.fromJson(Map<String, dynamic>.from(z as Map)),
        ],
      );
}

/// Symboles acceptés par ChartDataView (AVAILABLE_SYMBOLS).
const List<String> chartSymbols = [
  'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT',
  'ADA/USDT', 'AVAX/USDT', 'DOT/USDT', 'LINK/USDT', 'MATIC/USDT',
];
