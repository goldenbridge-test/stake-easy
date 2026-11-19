import 'package:flutter_test/flutter_test.dart';
import 'package:goldenapp/shared/utils/formatters.dart';
import 'package:goldenapp/shared/utils/json_parsing.dart';

// Supprime les espaces insécables utilisés par la locale fr_FR.
String _plain(String s) => s.replaceAll(RegExp(r'[  ]'), ' ');

void main() {
  test('formatUsd utilise la virgule décimale', () {
    expect(_plain(formatUsd(1234.5)), '1 234,50 \$');
  });

  test('formatPercent affiche le signe des gains', () {
    expect(_plain(formatPercent(12.345)), '+12,35 %');
    expect(_plain(formatPercent(-3.1)), '-3,10 %');
    expect(_plain(formatPercent(5, signed: false)), '5,00 %');
  });

  test('formatDate en français', () {
    expect(formatDate(DateTime(2026, 11, 19)), '19 nov. 2026');
    expect(formatDate(null), '—');
  });

  test('shortenAddress raccourcit les adresses', () {
    expect(shortenAddress('0x8f3A21cD94b7E0a5C61fD0B2e4A9c7D13e5B9a42'), '0x8f3A…9a42');
    expect(shortenAddress('abc'), 'abc');
  });

  test('parseDouble accepte les décimaux DRF en chaîne', () {
    expect(parseDouble('61250.0000000000'), 61250);
    expect(parseDouble(3), 3.0);
    expect(parseDouble(null, 7), 7);
    expect(parseDouble('n/a'), 0);
  });
}
