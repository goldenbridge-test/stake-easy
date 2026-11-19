import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Stockage des jetons JWT (access + refresh) émis par SimpleJWT.
abstract class TokenStorage {
  /// Stockage chiffré de la plateforme (Keychain / Keystore / WebCrypto).
  factory TokenStorage() = SecureTokenStorage;

  Future<void> saveTokens({required String access, String? refresh});
  Future<String?> access();
  Future<String?> refresh();
  Future<void> clear();
}

/// Implémentation par défaut, basée sur flutter_secure_storage.
class SecureTokenStorage implements TokenStorage {
  SecureTokenStorage([FlutterSecureStorage? storage])
      : _storage = storage ?? const FlutterSecureStorage();

  static const _accessKey = 'gb_access_token';
  static const _refreshKey = 'gb_refresh_token';

  final FlutterSecureStorage _storage;

  @override
  Future<void> saveTokens({required String access, String? refresh}) async {
    await _storage.write(key: _accessKey, value: access);
    if (refresh != null) {
      await _storage.write(key: _refreshKey, value: refresh);
    }
  }

  @override
  Future<String?> access() => _storage.read(key: _accessKey);

  @override
  Future<String?> refresh() => _storage.read(key: _refreshKey);

  @override
  Future<void> clear() async {
    await _storage.delete(key: _accessKey);
    await _storage.delete(key: _refreshKey);
  }
}

/// Stockage en mémoire : tests et prévisualisations.
class MemoryTokenStorage implements TokenStorage {
  MemoryTokenStorage({String? access, String? refresh})
      : _access = access,
        _refresh = refresh;

  String? _access;
  String? _refresh;

  @override
  Future<void> saveTokens({required String access, String? refresh}) async {
    _access = access;
    if (refresh != null) _refresh = refresh;
  }

  @override
  Future<String?> access() async => _access;

  @override
  Future<String?> refresh() async => _refresh;

  @override
  Future<void> clear() async {
    _access = null;
    _refresh = null;
  }
}
