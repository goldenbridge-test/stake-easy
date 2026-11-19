import '../api/api_client.dart';
import '../api/api_exception.dart';
import '../models/asset.dart';
import '../models/exchange_connection.dart';
import '../models/json_utils.dart';

/// Connexions exchange et actifs disponibles : `/exchanges/...`.
class ExchangeService {
  ExchangeService(this._api);

  final ApiClient _api;

  /// Actifs ayant un historique de bougies.
  Future<List<Asset>> assets({
    String timeframe = '1d',
    String exchange = 'binance',
  }) async => toList(
    await _api.get(
      '/exchanges/assets/',
      query: {'timeframe': timeframe, 'exchange': exchange},
    ),
    Asset.fromJson,
  );

  Future<List<ExchangeConnection>> connections() async => toList(
    await _api.get('/exchanges/connections/'),
    ExchangeConnection.fromJson,
  );

  Future<ExchangeConnection> connection(int id) async =>
      ExchangeConnection.fromJson(
        toMap(await _api.get('/exchanges/connections/$id/')),
      );

  /// Crée la connexion. Le backend teste les clés avant d'enregistrer
  /// (erreur de champ `api_key` si elles sont refusées).
  Future<ExchangeConnection> createConnection(
    ExchangeConnectionInput input,
  ) async => ExchangeConnection.fromJson(
    toMap(await _api.post('/exchanges/connections/', body: input.toJson())),
  );

  Future<ExchangeConnection> updateConnection(
    int id,
    ExchangeConnectionInput input,
  ) async => ExchangeConnection.fromJson(
    toMap(await _api.put('/exchanges/connections/$id/', body: input.toJson())),
  );

  /// Modification partielle (ex. `{'label': 'Compte principal'}`).
  Future<ExchangeConnection> patchConnection(
    int id,
    Map<String, dynamic> fields,
  ) async => ExchangeConnection.fromJson(
    toMap(await _api.patch('/exchanges/connections/$id/', body: fields)),
  );

  Future<void> deleteConnection(int id) =>
      _api.delete('/exchanges/connections/$id/');

  /// Vérifie les clés stockées. Un échec (HTTP 400) est renvoyé comme résultat,
  /// pas comme exception.
  Future<ConnectionTestResult> testConnection(int id) async {
    try {
      final data = await _api.post('/exchanges/connections/$id/test/');
      return ConnectionTestResult.fromJson(toMap(data));
    } on ApiException catch (e) {
      final body = e.data;
      if (e.isValidationError && body is Map && body['status'] != null) {
        return ConnectionTestResult.fromJson(toMap(body));
      }
      rethrow;
    }
  }
}
