import '../api/api_client.dart';
import '../models/json_utils.dart';
import '../models/strategy_config.dart';

/// Configurations de stratégie : `/strategy/strategies/`.
class StrategyService {
  StrategyService(this._api);

  final ApiClient _api;

  Future<List<StrategyConfig>> strategies() async =>
      toList(await _api.get('/strategy/strategies/'), StrategyConfig.fromJson);

  Future<StrategyConfig> strategy(int id) async => StrategyConfig.fromJson(
    toMap(await _api.get('/strategy/strategies/$id/')),
  );

  /// Crée une stratégie. Le backend exige au moins 365 jours d'historique
  /// sur l'actif et une connexion exchange appartenant à l'utilisateur.
  Future<StrategyConfig> createStrategy({
    required String exchange,
    required String symbol,
    required String mode,
    required double balanceQuote,
    required int exchangeConnection,
    double? discountPct,
    bool? isActive,
  }) async => StrategyConfig.fromJson(
    toMap(
      await _api.post(
        '/strategy/strategies/',
        body: StrategyConfig.writeJson(
          exchange: exchange,
          symbol: symbol,
          mode: mode,
          balanceQuote: balanceQuote,
          discountPct: discountPct,
          isActive: isActive,
          exchangeConnection: exchangeConnection,
        ),
      ),
    ),
  );

  Future<StrategyConfig> updateStrategy(StrategyConfig config) async =>
      StrategyConfig.fromJson(
        toMap(
          await _api.put(
            '/strategy/strategies/${config.id}/',
            body: config.toJson(),
          ),
        ),
      );

  Future<void> deleteStrategy(int id) =>
      _api.delete('/strategy/strategies/$id/');

  /// Active la stratégie (`POST /strategy/strategies/{id}/start/`).
  Future<void> start(int id) => _api.post('/strategy/strategies/$id/start/');

  /// Désactive la stratégie (`POST /strategy/strategies/{id}/stop/`).
  Future<void> stop(int id) => _api.post('/strategy/strategies/$id/stop/');
}
