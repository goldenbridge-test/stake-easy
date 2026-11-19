import 'json_utils.dart';

/// Exchanges acceptés par le backend (`ExchangeConnection.EXCHANGE_CHOICES`).
const supportedExchanges = <String, String>{
  'binance': 'Binance',
  'bybit': 'Bybit',
  'okx': 'OKX',
};

/// Connexion API à un exchange : `ExchangeConnectionSerializer`.
///
/// Les secrets sont en écriture seule : le backend ne renvoie que
/// `api_key_masked` (ex. `abcd...wxyz`).
class ExchangeConnection {
  const ExchangeConnection({
    required this.id,
    required this.exchange,
    this.label = '',
    this.apiKeyMasked = '****',
  });

  final int id;
  final String exchange;
  final String label;
  final String apiKeyMasked;

  String get exchangeName => supportedExchanges[exchange] ?? exchange;

  /// « Binance (Compte principal) » ou « Binance ».
  String get displayName =>
      label.isEmpty ? exchangeName : '$exchangeName ($label)';

  factory ExchangeConnection.fromJson(Map<String, dynamic> json) =>
      ExchangeConnection(
        id: toInt(json['id']),
        exchange: toStr(json['exchange']),
        label: toStr(json['label']),
        apiKeyMasked: toStr(json['api_key_masked'], '****'),
      );
}

/// Données envoyées pour créer / modifier une connexion.
///
/// À ne jamais persister côté app : les clés partent au backend qui les chiffre.
class ExchangeConnectionInput {
  const ExchangeConnectionInput({
    required this.exchange,
    required this.apiKey,
    required this.apiSecret,
    this.apiPassphrase = '',
    this.label = '',
  });

  final String exchange;
  final String apiKey;
  final String apiSecret;

  /// Obligatoire pour OKX.
  final String apiPassphrase;
  final String label;

  bool get requiresPassphrase => exchange == 'okx';

  Map<String, dynamic> toJson() => {
    'exchange': exchange,
    'label': label,
    'api_key': apiKey,
    'api_secret': apiSecret,
    'api_passphrase': apiPassphrase,
  };
}

/// Résultat de `POST /exchanges/connections/{id}/test/`.
class ConnectionTestResult {
  const ConnectionTestResult({
    required this.status,
    this.balances = const {},
    this.detail,
  });

  /// `ok`, `auth_error`, `network_error` ou `error`.
  final String status;

  /// Soldes non nuls par actif (si `ok`).
  final Map<String, double> balances;
  final String? detail;

  bool get isOk => status == 'ok';

  String get message => switch (status) {
    'ok' => 'Connexion réussie.',
    'auth_error' => "Clés refusées par l'exchange.",
    'network_error' => "L'exchange est injoignable pour le moment.",
    _ => detail ?? 'Échec du test de connexion.',
  };

  factory ConnectionTestResult.fromJson(Map<String, dynamic> json) {
    final balances = toMap(
      json['balances'],
    ).map((key, value) => MapEntry(key, toDouble(value)));
    return ConnectionTestResult(
      status: toStr(json['status'], 'error'),
      balances: balances,
      detail: toStrOrNull(json['detail']),
    );
  }
}
