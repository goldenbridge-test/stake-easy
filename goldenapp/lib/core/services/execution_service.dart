import '../api/api_client.dart';
import '../api/api_exception.dart';
import '../models/backtest.dart';
import '../models/chart_data.dart';
import '../models/json_utils.dart';
import '../models/performance.dart';
import '../models/portfolio_simulation.dart';
import '../models/position.dart';
import '../models/trade.dart';

/// Données d'exécution du bot : `/execution/...`.
class ExecutionService {
  ExecutionService(this._api);

  final ApiClient _api;

  /// Actifs acceptés par `chart-data` et `portfolio-simulation`.
  static const availableSymbols = [
    'BTC/USDT',
    'ETH/USDT',
    'SOL/USDT',
    'BNB/USDT',
    'XRP/USDT',
    'ADA/USDT',
    'AVAX/USDT',
    'DOT/USDT',
    'LINK/USDT',
    'MATIC/USDT',
  ];

  Future<List<Position>> positions() async =>
      toList(await _api.get('/execution/positions/'), Position.fromJson);

  Future<Position> position(int id) async =>
      Position.fromJson(toMap(await _api.get('/execution/positions/$id/')));

  Future<List<Trade>> trades() async =>
      toList(await _api.get('/execution/trades/'), Trade.fromJson);

  /// Performance agrégée, ou `null` si l'utilisateur n'a aucune stratégie
  /// (le backend répond 404 « Aucune stratégie trouvée. »).
  Future<Performance?> performance({int? strategyConfig}) async {
    try {
      final data = await _api.get(
        '/execution/performance/',
        query: {'strategy_config': strategyConfig},
      );
      return Performance.fromJson(toMap(data));
    } on ApiException catch (e) {
      if (e.isNotFound) return null;
      rethrow;
    }
  }

  /// Bougies journalières + zones. [days] est plafonné à 1095 par le backend.
  Future<ChartData> chartData(String symbol, {int days = 365}) async =>
      ChartData.fromJson(
        toMap(
          await _api.get(
            '/execution/chart-data/',
            query: {'symbol': symbol, 'days': days},
          ),
        ),
      );

  Future<List<Backtest>> backtests() async =>
      toList(await _api.get('/execution/backtests/'), Backtest.fromJson);

  /// Lance un backtest (traité en tâche de fond : interroger [getBacktest]).
  Future<Backtest> createBacktest({
    required String symbol,
    required double capital,
    String exchange = 'binance',
    DateTime? startDate,
    double? discountPct,
  }) async => Backtest.fromJson(
    toMap(
      await _api.post(
        '/execution/backtests/',
        body: Backtest.createJson(
          symbol: symbol,
          capital: capital,
          exchange: exchange,
          startDate: startDate,
          discountPct: discountPct,
        ),
      ),
    ),
  );

  Future<Backtest> getBacktest(int id) async =>
      Backtest.fromJson(toMap(await _api.get('/execution/backtests/$id/')));

  Future<void> deleteBacktest(int id) =>
      _api.delete('/execution/backtests/$id/');

  /// État d'une simulation lancée par [launchPortfolioSimulation].
  Future<PortfolioSimulation> portfolioSimulation(List<int> ids) async =>
      PortfolioSimulation.fromJson(
        toMap(
          await _api.get(
            '/execution/portfolio-simulation/',
            query: {'ids': ids},
          ),
        ),
      );

  /// Lance un backtest par actif, capital réparti équitablement.
  Future<PortfolioSimulationLaunch> launchPortfolioSimulation({
    required List<String> symbols,
    required double capital,
    DateTime? startDate,
  }) async => PortfolioSimulationLaunch.fromJson(
    toMap(
      await _api.post(
        '/execution/portfolio-simulation/',
        body: PortfolioSimulationLaunch.requestJson(
          symbols: symbols,
          capital: capital,
          startDate: startDate,
        ),
      ),
    ),
  );
}
