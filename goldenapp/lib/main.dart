import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app_theme.dart';
import 'core/providers/auth_providers.dart';
import 'features/auth/onboarding_screen.dart';
import 'main_navigation.dart';

void main() {
  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'GoldenBridge',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const AuthGate(),
    );
  }
}

/// Porte d'entrée : session valide (`/accounts/me/` OK) -> [MainNavigation],
/// sinon -> [OnboardingScreen]. Réagit à la connexion, à la déconnexion et à
/// l'expiration de session.
class AuthGate extends ConsumerWidget {
  const AuthGate({
    super.key,
    this.authenticated = _defaultAuthenticated,
    this.unauthenticated = _defaultUnauthenticated,
  });

  final WidgetBuilder authenticated;
  final WidgetBuilder unauthenticated;

  static Widget _defaultAuthenticated(BuildContext context) =>
      const MainNavigation();
  static Widget _defaultUnauthenticated(BuildContext context) =>
      const OnboardingScreen();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Déconnexion ou session expirée : on ferme les écrans ouverts par-dessus
    // (Exchanges, Backtest…) pour revenir à l'onboarding.
    ref.listen(authStateProvider, (previous, next) {
      final wasLoggedIn = previous?.valueOrNull != null;
      if (wasLoggedIn && next.hasValue && next.value == null) {
        Navigator.of(context).popUntil((route) => route.isFirst);
      }
    });
    final session = ref.watch(authStateProvider);
    return session.when(
      skipLoadingOnRefresh: false,
      loading: () => const _SplashScreen(),
      error: (_, __) => unauthenticated(context),
      data: (user) =>
          user != null ? authenticated(context) : unauthenticated(context),
    );
  }
}

class _SplashScreen extends StatelessWidget {
  const _SplashScreen();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: DecoratedBox(
        decoration: BoxDecoration(gradient: AppColors.futuristicGradient),
        child: Center(
          child: CircularProgressIndicator(color: AppColors.gold),
        ),
      ),
    );
  }
}
