import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:goldenapp/main_navigation.dart';

import '../helpers.dart';

void main() {
  setUpAll(disableFontFetching);

  testWidgets('La navigation affiche les 5 onglets et change d\'écran', (tester) async {
    await pumpApp(tester, const MainNavigation());
    await settle(tester);

    for (final label in ['Tableau', 'Staking', 'Rewards', 'Portfolio', 'Profil']) {
      expect(find.text(label), findsWidgets);
    }
    expect(find.text('Tableau de bord'), findsOneWidget);

    await tester.tap(find.byIcon(Icons.pie_chart_outline));
    await tester.pumpAndSettle();
    expect(find.text('Historique'), findsOneWidget);
  });
}
