import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:goldenapp/shared/widgets/widgets.dart';

import '../helpers.dart';

void main() {
  setUpAll(disableFontFetching);

  testWidgets('ErrorView appelle onRetry', (tester) async {
    var retries = 0;
    await pumpApp(
      tester,
      Scaffold(body: ErrorView(message: 'Oups', onRetry: () => retries++)),
    );
    await tester.tap(find.text('Réessayer'));
    expect(retries, 1);
  });

  testWidgets('AsyncView : chargement puis contenu', (tester) async {
    await pumpApp(
      tester,
      Scaffold(
        body: AsyncView<String>(
          load: () => Future.delayed(const Duration(milliseconds: 100), () => 'Bonjour'),
          builder: (context, data, _) => Text(data),
        ),
      ),
    );
    expect(find.byType(LoadingView), findsOneWidget);
    await settle(tester);
    expect(find.text('Bonjour'), findsOneWidget);
  });

  testWidgets('AsyncView : erreur puis nouvel essai réussi', (tester) async {
    var calls = 0;
    await pumpApp(
      tester,
      Scaffold(
        body: AsyncView<String>(
          load: () async {
            calls++;
            if (calls == 1) throw Exception('réseau');
            return 'OK';
          },
          builder: (context, data, _) => Text(data),
        ),
      ),
    );
    await settle(tester);
    expect(find.byType(ErrorView), findsOneWidget);
    await tester.tap(find.text('Réessayer'));
    await settle(tester);
    expect(find.text('OK'), findsOneWidget);
  });

  testWidgets('AsyncView : état vide', (tester) async {
    await pumpApp(
      tester,
      Scaffold(
        body: AsyncView<List<int>>(
          load: () async => const [],
          isEmpty: (l) => l.isEmpty,
          emptyMessage: 'Rien ici',
          builder: (context, data, _) => const Text('liste'),
        ),
      ),
    );
    await settle(tester);
    expect(find.text('Rien ici'), findsOneWidget);
  });
}
