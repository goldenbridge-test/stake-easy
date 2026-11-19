import 'json_utils.dart';

/// Fourchette de prix d'une zone : `{"low": ..., "high": ...}`.
class ZoneRange {
  const ZoneRange({required this.low, required this.high});

  final double low;
  final double high;

  double get mid => (low + high) / 2;

  static ZoneRange? fromJson(Object? json) {
    if (json is! Map) return null;
    return ZoneRange(low: toDouble(json['low']), high: toDouble(json['high']));
  }
}
