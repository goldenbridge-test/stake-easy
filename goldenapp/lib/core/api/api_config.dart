import 'package:flutter/foundation.dart';

/// Configuration de l'accès au backend Django.
///
/// L'URL de base peut être imposée au build :
/// `flutter run --dart-define=API_URL=https://mon-serveur/api`
///
/// Par défaut :
/// - web / desktop / iOS : `http://localhost:8000/api`
/// - émulateur Android : `http://10.0.2.2:8000/api` (l'hôte vu depuis l'émulateur)
class ApiConfig {
  ApiConfig._();

  static const String _fromEnvironment = String.fromEnvironment('API_URL');

  /// Délai maximal d'une requête HTTP.
  static const Duration timeout = Duration(seconds: 20);

  /// URL de base, sans slash final (ex. `http://localhost:8000/api`).
  static String get baseUrl => resolveBaseUrl(
        override: _fromEnvironment,
        isWeb: kIsWeb,
        platform: defaultTargetPlatform,
      );

  /// Logique de résolution, isolée pour pouvoir être testée.
  @visibleForTesting
  static String resolveBaseUrl({
    String override = '',
    required bool isWeb,
    required TargetPlatform platform,
  }) {
    if (override.isNotEmpty) return _stripTrailingSlash(override);
    if (!isWeb && platform == TargetPlatform.android) {
      return 'http://10.0.2.2:8000/api';
    }
    return 'http://localhost:8000/api';
  }

  static String _stripTrailingSlash(String url) =>
      url.endsWith('/') ? url.substring(0, url.length - 1) : url;
}
