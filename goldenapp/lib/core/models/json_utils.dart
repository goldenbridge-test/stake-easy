/// Conversions robustes pour les JSON Django REST Framework.
///
/// Les `DecimalField` sont sérialisés en chaînes (`"1234.5600000000"`), les
/// `SerializerMethodField` renvoyant un `Decimal` en nombres : on accepte les deux.
library;

double toDouble(Object? value, [double fallback = 0]) {
  if (value == null) return fallback;
  if (value is num) return value.toDouble();
  if (value is String) return double.tryParse(value.trim()) ?? fallback;
  return fallback;
}

double? toDoubleOrNull(Object? value) {
  if (value == null) return null;
  if (value is num) return value.toDouble();
  if (value is String) return double.tryParse(value.trim());
  return null;
}

int toInt(Object? value, [int fallback = 0]) => toIntOrNull(value) ?? fallback;

int? toIntOrNull(Object? value) {
  if (value == null) return null;
  if (value is int) return value;
  if (value is num) return value.toInt();
  if (value is String) {
    final v = value.trim();
    return int.tryParse(v) ?? double.tryParse(v)?.toInt();
  }
  return null;
}

bool toBool(Object? value, [bool fallback = false]) {
  if (value is bool) return value;
  if (value is num) return value != 0;
  if (value is String) {
    final v = value.toLowerCase();
    if (v == 'true' || v == '1') return true;
    if (v == 'false' || v == '0') return false;
  }
  return fallback;
}

String toStr(Object? value, [String fallback = '']) =>
    value == null ? fallback : value.toString();

String? toStrOrNull(Object? value) => value?.toString();

/// Date ISO 8601 (`2024-05-01T12:00:00Z` ou `2024-05-01`), convertie en heure locale.
DateTime? toDate(Object? value) {
  if (value is! String || value.isEmpty) return null;
  return DateTime.tryParse(value)?.toLocal();
}

Map<String, dynamic> toMap(Object? value) =>
    value is Map ? Map<String, dynamic>.from(value) : <String, dynamic>{};

/// Liste d'objets, y compris si la réponse est paginée (`{"results": [...]}`).
List<T> toList<T>(Object? value, T Function(Map<String, dynamic>) fromJson) {
  final raw = value is Map ? value['results'] : value;
  if (raw is! List) return <T>[];
  return raw
      .whereType<Map>()
      .map((e) => fromJson(Map<String, dynamic>.from(e)))
      .toList();
}

/// Date seule au format `AAAA-MM-JJ` (champs `DateField` Django).
String? formatDate(DateTime? date) {
  if (date == null) return null;
  final m = date.month.toString().padLeft(2, '0');
  final d = date.day.toString().padLeft(2, '0');
  return '${date.year}-$m-$d';
}
