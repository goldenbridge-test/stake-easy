// Petits helpers de lecture JSON pour les modèles d'affichage.
// DRF sérialise les DecimalField en chaînes ("123.4500000000") : on accepte
// donc indifféremment num ou String.

double parseDouble(Object? value, [double fallback = 0]) {
  if (value == null) return fallback;
  if (value is num) return value.toDouble();
  return double.tryParse(value.toString()) ?? fallback;
}

int parseInt(Object? value, [int fallback = 0]) {
  if (value == null) return fallback;
  if (value is int) return value;
  if (value is num) return value.toInt();
  return int.tryParse(value.toString()) ?? fallback;
}

DateTime? parseDate(Object? value) {
  if (value == null) return null;
  return DateTime.tryParse(value.toString());
}

List<double> parseDoubleList(Object? value) {
  if (value is! List) return const [];
  return List.unmodifiable(value.map(parseDouble));
}
