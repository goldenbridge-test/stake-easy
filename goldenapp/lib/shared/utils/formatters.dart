import 'package:intl/intl.dart';

// Formatage des montants, pourcentages et dates en français.
// Les formats de nombres d'intl fonctionnent sans initialisation de locale ;
// les dates sont formatées à la main pour éviter initializeDateFormatting.

final NumberFormat _amount = NumberFormat.decimalPatternDigits(
  locale: 'fr_FR',
  decimalDigits: 2,
);

/// 12 345,67 $ (quote en USDT, affichée en dollars).
String formatUsd(double value) => '${_amount.format(value)} \$';

/// Montant suivi d'un symbole libre : 1 250,00 GLD.
String formatAmount(double value, String symbol, {int decimals = 2}) {
  final f = NumberFormat.decimalPatternDigits(
    locale: 'fr_FR',
    decimalDigits: decimals,
  );
  return '${f.format(value)} $symbol';
}

/// +12,34 % / -3,10 % (signe toujours affiché).
String formatPercent(double value, {bool signed = true}) {
  final sign = signed && value > 0 ? '+' : '';
  return '$sign${_amount.format(value)} %';
}

/// +123,45 $ avec signe, pour les P&L.
String formatSignedUsd(double value) {
  final sign = value > 0 ? '+' : '';
  return '$sign${formatUsd(value)}';
}

/// Quantité d'actif de base, jusqu'à 6 décimales significatives.
String formatQuantity(double value) {
  final f = NumberFormat.decimalPatternDigits(
    locale: 'fr_FR',
    decimalDigits: value.abs() >= 1 ? 4 : 6,
  );
  return f.format(value);
}

const _months = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
];

/// 19 nov. 2026
String formatDate(DateTime? date) {
  if (date == null) return '—';
  final d = date.toLocal();
  return '${d.day} ${_months[d.month - 1]} ${d.year}';
}

/// 19 nov. 2026 · 14:05
String formatDateTime(DateTime? date) {
  if (date == null) return '—';
  final d = date.toLocal();
  final hh = d.hour.toString().padLeft(2, '0');
  final mm = d.minute.toString().padLeft(2, '0');
  return '${formatDate(d)} · $hh:$mm';
}

/// Adresse ou clé raccourcie : 0x1234…5678
String shortenAddress(String value, {int head = 6, int tail = 4}) {
  if (value.length <= head + tail + 1) return value;
  return '${value.substring(0, head)}…${value.substring(value.length - tail)}';
}
