import '../../../shared/utils/json_parsing.dart';

/// Exchanges supportés (ExchangeConnection.EXCHANGE_CHOICES).
enum ExchangeType {
  binance('binance', 'Binance'),
  bybit('bybit', 'Bybit'),
  okx('okx', 'OKX');

  const ExchangeType(this.apiValue, this.label);

  final String apiValue;
  final String label;

  /// OKX exige un passphrase (ExchangeConnectionSerializer.validate).
  bool get requiresPassphrase => this == ExchangeType.okx;

  static ExchangeType fromApi(Object? value) => ExchangeType.values.firstWhere(
        (e) => e.apiValue == value,
        orElse: () => ExchangeType.binance,
      );
}

/// Connexion enregistrée (GET /api/exchanges/connections/).
/// Les secrets sont write-only côté API : seule la clé masquée revient.
class ExchangeConnection {
  const ExchangeConnection({
    required this.id,
    required this.exchange,
    required this.label,
    required this.apiKeyMasked,
  });

  final int id;
  final ExchangeType exchange;
  final String label;
  final String apiKeyMasked;

  String get displayName => label.isEmpty ? exchange.label : label;

  factory ExchangeConnection.fromJson(Map<String, dynamic> json) => ExchangeConnection(
        id: parseInt(json['id']),
        exchange: ExchangeType.fromApi(json['exchange']),
        label: json['label']?.toString() ?? '',
        apiKeyMasked: json['api_key_masked']?.toString() ?? '****',
      );
}

/// Saisie du formulaire (POST /api/exchanges/connections/).
class ExchangeConnectionDraft {
  const ExchangeConnectionDraft({
    required this.exchange,
    required this.apiKey,
    required this.apiSecret,
    this.label = '',
    this.apiPassphrase = '',
  });

  final ExchangeType exchange;
  final String label;
  final String apiKey;
  final String apiSecret;
  final String apiPassphrase;

  Map<String, dynamic> toJson() => {
        'exchange': exchange.apiValue,
        'label': label,
        'api_key': apiKey,
        'api_secret': apiSecret,
        'api_passphrase': apiPassphrase,
      };
}

/// Réponse de POST /api/exchanges/connections/{id}/test/.
class ConnectionTestResult {
  const ConnectionTestResult({required this.status, this.balances = const {}, this.detail});

  /// ok | auth_error | network_error | error
  final String status;

  /// Soldes non nuls par actif (uniquement si status == ok).
  final Map<String, double> balances;
  final String? detail;

  bool get isOk => status == 'ok';

  factory ConnectionTestResult.fromJson(Map<String, dynamic> json) {
    final raw = json['balances'];
    return ConnectionTestResult(
      status: json['status']?.toString() ?? 'error',
      balances: raw is Map
          ? {for (final e in raw.entries) e.key.toString(): parseDouble(e.value)}
          : const {},
      detail: json['detail']?.toString(),
    );
  }
}
