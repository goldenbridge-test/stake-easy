import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:goldenapp/app_theme.dart';
import 'package:goldenapp/features/auth/login_screen.dart';
import 'package:goldenapp/features/auth/signup_screen.dart';
import 'package:goldenapp/main.dart';

import '../fake_backend.dart';
import '../helpers.dart';

/// AuthGate (déconnecté) avec [screen] ouvert par-dessus, comme depuis l'onboarding.
Future<void> _pumpOverGate(WidgetTester tester, FakeBackend backend, Widget screen) async {
  tester.view.physicalSize = const Size(1080, 2400);
  tester.view.devicePixelRatio = 2.75;
  addTearDown(tester.view.reset);
  await tester.pumpWidget(
    ProviderScope(
      overrides: backend.overrides,
      child: MaterialApp(
        theme: AppTheme.lightTheme,
        home: AuthGate(
          authenticated: (_) => const Text('accueil'),
          unauthenticated: (_) => const Text('onboarding'),
        ),
      ),
    ),
  );
  await tester.pumpAndSettle();
  Navigator.of(tester.element(find.text('onboarding'))).push(MaterialPageRoute<void>(builder: (_) => screen));
  await tester.pumpAndSettle();
}

void main() {
  setUpAll(disableFontFetching);

  testWidgets('Connexion refusée : message du serveur', (tester) async {
    final backend = FakeBackend(loggedIn: false)
      ..on('POST', '/accounts/login/', {'detail': 'No active account found with the given credentials'}, status: 401);
    await _pumpOverGate(tester, backend, const LoginScreen());
    await tester.enterText(find.widgetWithText(TextFormField, 'Nom d\'utilisateur'), 'alice');
    await tester.enterText(find.widgetWithText(TextFormField, 'Mot de passe'), 'mauvais');
    await tester.tap(find.text('Se connecter'));
    await settle(tester);
    expect(find.text('Nom d\'utilisateur ou mot de passe incorrect.'), findsOneWidget);
  });

  testWidgets('Connexion réussie : {username, password} puis navigation', (tester) async {
    final backend = FakeBackend(loggedIn: false)..on('POST', '/accounts/login/', {'access': 'A', 'refresh': 'R'});
    await _pumpOverGate(tester, backend, const LoginScreen());
    await tester.enterText(find.widgetWithText(TextFormField, 'Nom d\'utilisateur'), ' mouhsine ');
    await tester.enterText(find.widgetWithText(TextFormField, 'Mot de passe'), 'secret');
    await tester.tap(find.text('Se connecter'));
    await settle(tester);

    expect(jsonDecode(backend.calls('POST', '/accounts/login/').single.body), {
      'username': 'mouhsine',
      'password': 'secret',
    });
    expect(find.byType(LoginScreen), findsNothing);
    expect(find.text('accueil'), findsOneWidget);
  });

  testWidgets('Inscription : 5 champs envoyés et erreurs par champ', (tester) async {
    final backend = FakeBackend(loggedIn: false)
      ..on('POST', '/accounts/register/', {
        'username': ['Un utilisateur avec ce nom existe déjà.'],
      }, status: 400);
    await _pumpOverGate(tester, backend, const SignupScreen());
    await tester.enterText(find.widgetWithText(TextFormField, 'Nom d\'utilisateur'), 'mouhsine');
    await tester.enterText(find.widgetWithText(TextFormField, 'Prénom'), 'Mouhsine');
    await tester.enterText(find.widgetWithText(TextFormField, 'Nom'), 'Golden');
    await tester.enterText(find.widgetWithText(TextFormField, 'Email'), 'm@example.com');
    await tester.enterText(find.widgetWithText(TextFormField, 'Mot de passe'), 'motdepasse');
    await tester.tap(find.byType(Checkbox));
    await tester.ensureVisible(find.text('S\'inscrire'));
    await tester.tap(find.text('S\'inscrire'));
    await settle(tester);

    expect(jsonDecode(backend.calls('POST', '/accounts/register/').single.body), {
      'username': 'mouhsine',
      'email': 'm@example.com',
      'password': 'motdepasse',
      'first_name': 'Mouhsine',
      'last_name': 'Golden',
    });
    expect(find.text('Un utilisateur avec ce nom existe déjà.'), findsOneWidget);

    // Corriger le champ efface l'erreur serveur et débloque la validation.
    await tester.enterText(find.widgetWithText(TextFormField, 'mouhsine'), 'mouhsine2');
    await tester.pump();
    expect(find.text('Un utilisateur avec ce nom existe déjà.'), findsNothing);
  });
}
