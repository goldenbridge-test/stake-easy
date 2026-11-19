import '../api/api_client.dart';
import '../api/api_exception.dart';
import '../models/user.dart';

/// Authentification JWT (SimpleJWT) auprès du backend Django.
///
/// Routes : `POST /accounts/register/`, `POST /accounts/login/`,
/// `GET /accounts/me/`, `PATCH /accounts/profile/{id}/`.
class AuthService {
  AuthService({ApiClient? client}) : _api = client ?? ApiClient();

  final ApiClient _api;

  ApiClient get client => _api;

  /// Émis quand la session expire (refresh refusé).
  Stream<void> get onSessionExpired => _api.onSessionExpired;

  /// Crée le compte puis ouvre la session.
  Future<User> register({
    required String username,
    required String password,
    String email = '',
    String firstName = '',
    String lastName = '',
  }) async {
    await _api.post(
      '/accounts/register/',
      auth: false,
      body: {
        'username': username,
        'email': email,
        'password': password,
        'first_name': firstName,
        'last_name': lastName,
      },
    );
    return login(username, password);
  }

  /// Ouvre la session avec le nom d'utilisateur Django (pas l'e-mail).
  Future<User> login(String username, String password) async {
    final dynamic data;
    try {
      data = await _api.post(
        '/accounts/login/',
        auth: false,
        body: {'username': username.trim(), 'password': password},
      );
    } on ApiException catch (e) {
      if (e.isUnauthorized) {
        throw ApiException(
          statusCode: 401,
          message: "Nom d'utilisateur ou mot de passe incorrect.",
          data: e.data,
        );
      }
      rethrow;
    }

    final access = data is Map ? data['access'] : null;
    final refresh = data is Map ? data['refresh'] : null;
    if (access is! String || access.isEmpty) {
      throw ApiException(
        statusCode: 500,
        message: 'Réponse de connexion invalide.',
      );
    }
    await _api.tokens.saveTokens(
      access: access,
      refresh: refresh is String ? refresh : null,
    );
    return me();
  }

  /// Utilisateur courant (`id`, `username`, `email`, `is_staff`).
  Future<User> me() async {
    final data = await _api.get('/accounts/me/');
    return User.fromJson(Map<String, dynamic>.from(data as Map));
  }

  /// Profil complet (`UserSerializer` : prénom et nom compris), que
  /// `/accounts/me/` ne renvoie pas. `get_object` renvoie toujours
  /// l'utilisateur connecté, d'où l'identifiant `me`.
  Future<User> profile() async {
    final data = await _api.get('/accounts/profile/me/');
    return User.fromJson(Map<String, dynamic>.from(data as Map));
  }

  /// Met à jour prénom / nom / e-mail. Le backend renvoie toujours
  /// l'utilisateur connecté quel que soit l'identifiant de l'URL.
  Future<User> updateProfile({
    String? firstName,
    String? lastName,
    String? email,
  }) async {
    final data = await _api.patch(
      '/accounts/profile/me/',
      body: {
        if (firstName != null) 'first_name': firstName,
        if (lastName != null) 'last_name': lastName,
        if (email != null) 'email': email,
      },
    );
    return User.fromJson(Map<String, dynamic>.from(data as Map));
  }

  /// Ferme la session locale (SimpleJWT n'a pas de route de logout côté serveur).
  Future<void> logout() => _api.tokens.clear();

  /// Vrai si un jeton d'accès est stocké (sans garantir qu'il soit encore valide).
  Future<bool> isLoggedIn() async {
    final access = await _api.tokens.access();
    return access != null && access.isNotEmpty;
  }

  // --- Compatibilité temporaire avec les écrans existants -------------------

  /// Ancienne inscription e-mail / mot de passe : l'e-mail sert de nom d'utilisateur.
  @Deprecated('Utiliser register(username: ..., password: ...)')
  Future<User> signup(String email, String password) =>
      register(username: email, email: email, password: password);

  /// Le backend n'expose pas d'authentification par signature de wallet.
  @Deprecated(
    "Pas de route backend : la connexion wallet passera par WalletConnect",
  )
  Future<String> getNonce(String publicAddress) => Future.error(
    UnsupportedError("La connexion par wallet n'est pas encore disponible."),
  );

  /// Le backend n'expose pas d'authentification par signature de wallet.
  @Deprecated(
    "Pas de route backend : la connexion wallet passera par WalletConnect",
  )
  Future<User> verifyWallet(String publicAddress, String signature) =>
      Future.error(
        UnsupportedError(
          "La connexion par wallet n'est pas encore disponible.",
        ),
      );
}
