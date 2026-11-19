/// Erreur renvoyée par le backend (ou réseau), avec un message lisible en français.
class ApiException implements Exception {
  ApiException({
    required this.statusCode,
    required this.message,
    this.fieldErrors = const {},
    this.data,
  });

  /// Code HTTP (0 = pas de réponse : réseau, délai dépassé…).
  final int statusCode;

  /// Message prêt à afficher.
  final String message;

  /// Erreurs de validation par champ (`{"username": ["Ce champ est obligatoire."]}`).
  final Map<String, List<String>> fieldErrors;

  /// Corps JSON décodé de la réponse, si disponible.
  final Object? data;

  bool get isNetworkError => statusCode == 0;
  bool get isUnauthorized => statusCode == 401;
  bool get isNotFound => statusCode == 404;
  bool get isValidationError => statusCode == 400;

  /// Première erreur pour un champ donné, pratique pour un `TextFormField`.
  String? fieldError(String field) {
    final errors = fieldErrors[field];
    return (errors == null || errors.isEmpty) ? null : errors.first;
  }

  factory ApiException.network([Object? cause]) => ApiException(
    statusCode: 0,
    message:
        'Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.',
    data: cause,
  );

  factory ApiException.timeout() => ApiException(
    statusCode: 0,
    message: 'Le serveur met trop de temps à répondre. Réessayez.',
  );

  /// Construit l'exception à partir d'une réponse d'erreur Django REST Framework.
  ///
  /// Formes gérées : `{"detail": "..."}`, `{"non_field_errors": [...]}`,
  /// `{"champ": ["..."]}`, `{"champ": "..."}`, `["..."]` ou un texte brut.
  factory ApiException.fromResponse(int statusCode, Object? body) {
    final fieldErrors = <String, List<String>>{};
    String? message;

    if (body is Map) {
      final detail = body['detail'];
      if (detail != null) message = _flatten(detail).join(' ');
      body.forEach((key, value) {
        final k = key.toString();
        if (k == 'detail') return;
        final messages = _flatten(value);
        if (messages.isEmpty) return;
        if (k == 'non_field_errors') {
          message ??= messages.join(' ');
        } else {
          fieldErrors[k] = messages;
        }
      });
      if (message == null && fieldErrors.isNotEmpty) {
        message = fieldErrors.entries
            .map((e) => '${_fieldLabel(e.key)} : ${e.value.join(' ')}')
            .join('\n');
      }
    } else if (body is List) {
      final messages = _flatten(body);
      if (messages.isNotEmpty) message = messages.join(' ');
    } else if (body is String && body.trim().isNotEmpty && body.length < 200) {
      message = body.trim();
    }

    return ApiException(
      statusCode: statusCode,
      message: message ?? _defaultMessage(statusCode),
      fieldErrors: fieldErrors,
      data: body,
    );
  }

  static List<String> _flatten(Object? value) {
    if (value == null) return const [];
    if (value is List) return value.expand(_flatten).toList();
    if (value is Map) return value.values.expand(_flatten).toList();
    final text = value.toString().trim();
    return text.isEmpty ? const [] : [text];
  }

  static const _labels = {
    'username': "Nom d'utilisateur",
    'email': 'E-mail',
    'password': 'Mot de passe',
    'first_name': 'Prénom',
    'last_name': 'Nom',
    'symbol': 'Actif',
    'capital': 'Capital',
    'api_key': 'Clé API',
    'api_secret': 'Secret API',
    'api_passphrase': 'Passphrase',
    'exchange': 'Exchange',
    'exchange_connection': 'Connexion exchange',
  };

  static String _fieldLabel(String field) => _labels[field] ?? field;

  static String _defaultMessage(int statusCode) {
    if (statusCode == 400) return 'Requête invalide.';
    if (statusCode == 401) return 'Session expirée. Veuillez vous reconnecter.';
    if (statusCode == 403) return "Vous n'avez pas accès à cette ressource.";
    if (statusCode == 404) return 'Ressource introuvable.';
    if (statusCode == 429) return 'Trop de requêtes. Patientez un instant.';
    if (statusCode >= 500) return 'Erreur du serveur. Réessayez plus tard.';
    return 'Erreur inattendue ($statusCode).';
  }

  @override
  String toString() => 'ApiException($statusCode): $message';
}
