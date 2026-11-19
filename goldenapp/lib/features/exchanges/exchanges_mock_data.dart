import 'models/exchange_connection.dart';

// Données factices des connexions exchange. À remplacer par
// /api/exchanges/connections/ (GET, POST, DELETE, POST {id}/test/).

final List<ExchangeConnection> _mockConnections = [
  const ExchangeConnection(
    id: 4,
    exchange: ExchangeType.binance,
    label: 'Compte principal',
    apiKeyMasked: 'vX9k...3fQa',
  ),
  const ExchangeConnection(
    id: 2,
    exchange: ExchangeType.bybit,
    label: '',
    apiKeyMasked: 'Bt72...m0Pz',
  ),
];

Future<List<ExchangeConnection>> loadMockConnections() async {
  await Future<void>.delayed(const Duration(milliseconds: 400));
  return List.unmodifiable(_mockConnections);
}

Future<ExchangeConnection> mockCreateConnection(ExchangeConnectionDraft draft) async {
  await Future<void>.delayed(const Duration(milliseconds: 900));
  final key = draft.apiKey;
  final created = ExchangeConnection(
    id: DateTime.now().millisecondsSinceEpoch,
    exchange: draft.exchange,
    label: draft.label,
    apiKeyMasked: key.length <= 8 ? '****' : '${key.substring(0, 4)}...${key.substring(key.length - 4)}',
  );
  _mockConnections.insert(0, created);
  return created;
}

Future<void> mockDeleteConnection(int id) async {
  await Future<void>.delayed(const Duration(milliseconds: 500));
  _mockConnections.removeWhere((c) => c.id == id);
}

Future<ConnectionTestResult> mockTestConnection(int id) async {
  await Future<void>.delayed(const Duration(milliseconds: 800));
  return const ConnectionTestResult(
    status: 'ok',
    balances: {'USDT': 2450.18, 'BTC': 0.0326, 'ETH': 0.3},
  );
}
