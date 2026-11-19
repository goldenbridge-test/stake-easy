import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:goldenapp/core/api/api_exception.dart';
import 'package:goldenapp/shared/widgets/widgets.dart';

import '../helpers.dart';

/// Écran minimal qui affiche [provider] avec AsyncValueView.
class _Probe<T> extends ConsumerWidget {
  const _Probe(this.provider, {this.isEmpty});

  final FutureProvider<T> provider;
  final bool Function(T)? isEmpty;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      body: AsyncValueView<T>(
        value: ref.watch(provider),
        onRetry: () => ref.invalidate(provider),
        onRefresh: () => refreshQuietly(ref, provider.future),
        isEmpty: isEmpty,
        emptyMessage: 'Rien ici',
        builder: (context, data) => Text('$data'),
      ),
    );
  }
}

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

  testWidgets('AsyncValueView : chargement puis contenu', (tester) async {
    final provider = FutureProvider<String>(
      (ref) => Future.delayed(const Duration(milliseconds: 100), () => 'Bonjour'),
    );
    await pumpApp(tester, ProviderScope(child: _Probe(provider)));
    expect(find.byType(LoadingView), findsOneWidget);
    await settle(tester);
    expect(find.text('Bonjour'), findsOneWidget);
  });

  testWidgets('AsyncValueView : message serveur puis nouvel essai réussi', (tester) async {
    var calls = 0;
    final provider = FutureProvider<String>((ref) async {
      calls++;
      if (calls == 1) throw ApiException(statusCode: 500, message: 'Serveur indisponible.');
      return 'OK';
    });
    await pumpApp(tester, ProviderScope(child: _Probe(provider)));
    await settle(tester);
    expect(find.byType(ErrorView), findsOneWidget);
    expect(find.text('Serveur indisponible.'), findsOneWidget);
    await tester.tap(find.text('Réessayer'));
    await settle(tester);
    expect(find.text('OK'), findsOneWidget);
  });

  testWidgets('AsyncValueView : état vide rafraîchissable', (tester) async {
    var calls = 0;
    final provider = FutureProvider<List<int>>((ref) async {
      calls++;
      return const [];
    });
    await pumpApp(tester, ProviderScope(child: _Probe(provider, isEmpty: (l) => l.isEmpty)));
    await settle(tester);
    expect(find.text('Rien ici'), findsOneWidget);
    await tester.fling(find.text('Rien ici'), const Offset(0, 400), 1000);
    await settle(tester);
    expect(calls, 2);
  });
}
