import '../../../shared/utils/json_parsing.dart';

/// Fourchette de prix d'une zone : {"low": ..., "high": ...}
/// (entry_zone_range de PositionSerializer, zone_range de TradeSerializer).
class PriceRange {
  const PriceRange({required this.low, required this.high});

  final double low;
  final double high;

  static PriceRange? fromJson(Object? json) {
    if (json is! Map) return null;
    return PriceRange(low: parseDouble(json['low']), high: parseDouble(json['high']));
  }
}
