import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/api_exception.dart';
import '../models/user.dart';
import 'api_providers.dart';

/// Session : `null` = déconnecté, sinon l'utilisateur courant.
///
/// Au démarrage : jeton présent -> `GET /accounts/me/` ; 401 -> déconnecté.
/// Une erreur réseau est propagée (état `AsyncError`) pour permettre un « Réessayer ».
class AuthNotifier extends AsyncNotifier<User?> {
  @override
  Future<User?> build() async {
    final auth = ref.watch(authServiceProvider);
    final sub = auth.onSessionExpired.listen((_) {
      state = const AsyncData(null);
    });
    ref.onDispose(sub.cancel);

    if (!await auth.isLoggedIn()) return null;
    try {
      return await auth.me();
    } on ApiException catch (e) {
      if (e.isUnauthorized) return null;
      rethrow;
    }
  }

  /// Lève une [ApiException] (message en français) si la connexion échoue.
  Future<User> login(String username, String password) async {
    final user = await ref.read(authServiceProvider).login(username, password);
    state = AsyncData(user);
    return user;
  }

  Future<User> register({
    required String username,
    required String password,
    String email = '',
    String firstName = '',
    String lastName = '',
  }) async {
    final user = await ref
        .read(authServiceProvider)
        .register(
          username: username,
          password: password,
          email: email,
          firstName: firstName,
          lastName: lastName,
        );
    state = AsyncData(user);
    return user;
  }

  Future<User> updateProfile({
    String? firstName,
    String? lastName,
    String? email,
  }) async {
    final updated = await ref
        .read(authServiceProvider)
        .updateProfile(firstName: firstName, lastName: lastName, email: email);
    // PATCH renvoie UserSerializer (sans is_staff) : on conserve le reste.
    final current = state.valueOrNull;
    final user =
        current == null
            ? updated
            : current.copyWith(
              firstName: updated.firstName,
              lastName: updated.lastName,
              email: updated.email,
            );
    state = AsyncData(user);
    return user;
  }

  Future<void> logout() async {
    await ref.read(authServiceProvider).logout();
    state = const AsyncData(null);
  }

  /// Relance la vérification de session (après une erreur réseau).
  Future<void> retry() async {
    ref.invalidateSelf();
    await future;
  }
}

final authStateProvider = AsyncNotifierProvider<AuthNotifier, User?>(
  AuthNotifier.new,
);

/// Utilisateur connecté, ou `null`.
final currentUserProvider = Provider<User?>(
  (ref) => ref.watch(authStateProvider).valueOrNull,
);

final isLoggedInProvider = Provider<bool>(
  (ref) => ref.watch(currentUserProvider) != null,
);
