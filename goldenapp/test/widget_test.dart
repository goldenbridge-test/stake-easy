import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:goldenapp/core/api/api_client.dart';
import 'package:goldenapp/core/api/token_storage.dart';
import 'package:goldenapp/core/providers/api_providers.dart';
import 'package:goldenapp/core/providers/auth_providers.dart';
import 'package:goldenapp/main.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

Widget gate(TokenStorage storage, MockClient http) => ProviderScope(
  overrides: [
    tokenStorageProvider.overrideWithValue(storage),
    apiClientProvider.overrideWithValue(
      ApiClient(
        baseUrl: 'http://test/api',
        tokenStorage: storage,
        httpClient: http,
      ),
    ),
  ],
  child: MaterialApp(
    home: AuthGate(
      authenticated: (_) => const Text('accueil'),
      unauthenticated: (_) => const Text('onboarding'),
    ),
  ),
);

void main() {
  testWidgets('sans jeton : écran d\'onboarding', (tester) async {
    var calls = 0;
    await tester.pumpWidget(
      gate(
        MemoryTokenStorage(),
        MockClient((_) async {
          calls++;
          return http.Response('{}', 200);
        }),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('onboarding'), findsOneWidget);
    expect(calls, 0);
  });

  testWidgets('jeton valide : navigation principale', (tester) async {
    await tester.pumpWidget(
      gate(
        MemoryTokenStorage(access: 'A', refresh: 'R'),
        MockClient((req) async {
          expect(req.url.path, '/api/accounts/me/');
          return http.Response(
            jsonEncode({
              'id': 1,
              'username': 'alice',
              'email': '',
              'is_staff': false,
            }),
            200,
          );
        }),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('accueil'), findsOneWidget);
  });

  testWidgets('session expirée : retour à l\'onboarding', (tester) async {
    final storage = MemoryTokenStorage(access: 'A', refresh: 'R');
    await tester.pumpWidget(
      gate(
        storage,
        MockClient((_) async => http.Response('{"detail":"expired"}', 401)),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('onboarding'), findsOneWidget);
    expect(await storage.access(), isNull);
  });

  testWidgets('déconnexion depuis le provider', (tester) async {
    await tester.pumpWidget(
      gate(
        MemoryTokenStorage(access: 'A', refresh: 'R'),
        MockClient(
          (_) async => http.Response('{"id":1,"username":"alice"}', 200),
        ),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('accueil'), findsOneWidget);

    final container = ProviderScope.containerOf(
      tester.element(find.text('accueil')),
    );
    await container.read(authStateProvider.notifier).logout();
    await tester.pumpAndSettle();

    expect(find.text('onboarding'), findsOneWidget);
  });
}
