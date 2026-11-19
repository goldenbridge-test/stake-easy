import 'json_utils.dart';

/// Bougie journalière renvoyée par `/execution/chart-data/`.
class Candle {
  const Candle({
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

  bool get isBullish => close >= open;

  factory Candle.fromJson(Map<String, dynamic> json) => Candle(
    date: toDate(json['date']) ?? DateTime.fromMillisecondsSinceEpoch(0),
    open: toDouble(json['open']),
    high: toDouble(json['high']),
    low: toDouble(json['low']),
    close: toDouble(json['close']),
  );
}

/// Zone de support détectée par l'algorithme.
class ChartZone {
  const ChartZone({
    required this.id,
    required this.priceLow,
    required this.priceHigh,
    this.firstSeen,
    this.lastTouched,
    required this.touchCount,
    required this.isActive,
    required this.isValidated,
    required this.zoneType,
  });

  final int id;
  final double priceLow;
  final double priceHigh;
  final DateTime? firstSeen;
  final DateTime? lastTouched;
  final int touchCount;
  final bool isActive;
  final bool isValidated;

  /// Toujours `support` aujourd'hui.
  final String zoneType;

  factory ChartZone.fromJson(Map<String, dynamic> json) => ChartZone(
    id: toInt(json['id']),
    priceLow: toDouble(json['price_low']),
    priceHigh: toDouble(json['price_high']),
    firstSeen: toDate(json['first_seen']),
    lastTouched: toDate(json['last_touched']),
    touchCount: toInt(json['touch_count']),
    isActive: toBool(json['is_active']),
    isValidated: toBool(json['is_validated']),
    zoneType: toStr(json['zone_type'], 'support'),
  );
}

/// Données du graphique : `GET /execution/chart-data/?symbol=BTC/USDT&days=365`.
class ChartData {
  const ChartData({
    required this.symbol,
    required this.candles,
    required this.zones,
    required this.candlesCount,
    required this.zonesCount,
  });

  final String symbol;
  final List<Candle> candles;
  final List<ChartZone> zones;
  final int candlesCount;
  final int zonesCount;

  Candle? get lastCandle => candles.isEmpty ? null : candles.last;

  /// Variation en % entre la première et la dernière clôture.
  double get changePct {
    if (candles.length < 2 || candles.first.close == 0) return 0;
    return (candles.last.close - candles.first.close) /
        candles.first.close *
        100;
  }

  List<ChartZone> get activeZones => zones.where((z) => z.isActive).toList();

  factory ChartData.fromJson(Map<String, dynamic> json) {
    final candles = toList(json['candles'], Candle.fromJson);
    final zones = toList(json['zones'], ChartZone.fromJson);
    return ChartData(
      symbol: toStr(json['symbol']),
      candles: candles,
      zones: zones,
      candlesCount: toInt(json['candles_count'], candles.length),
      zonesCount: toInt(json['zones_count'], zones.length),
    );
  }
}
