import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/models.dart';
import 'api_providers.dart';
import 'auth_providers.dart';

// Chaque provider observe l'utilisateur courant : il se recharge à la
// connexion / déconnexion et renvoie une valeur vide hors session.
// Pull-to-refresh : `ref.invalidate(positionsProvider)` puis
// `await ref.read(positionsProvider.future)`, ou `ref.refreshAllData()`.

final positionsProvider = FutureProvider<List<Position>>((ref) async {
  if (ref.watch(currentUserProvider) == null) return const [];
  return ref.watch(executionServiceProvider).positions();
});

/// Positions non clôturées.
final openPositionsProvider = FutureProvider<List<Position>>((ref) async {
  final all = await ref.watch(positionsProvider.future);
  return all.where((p) => p.isOpen).toList();
});

final tradesProvider = FutureProvider<List<Trade>>((ref) async {
  if (ref.watch(currentUserProvider) == null) return const [];
  return ref.watch(executionServiceProvider).trades();
});

/// `null` si l'utilisateur n'a encore aucune stratégie.
final performanceProvider = FutureProvider<Performance?>((ref) async {
  if (ref.watch(currentUserProvider) == null) return null;
  return ref.watch(executionServiceProvider).performance();
});

/// Paramètres du graphique : actif + nombre de jours (max 1095).
typedef ChartQuery = ({String symbol, int days});

final chartDataProvider = FutureProvider.family<ChartData, ChartQuery>((
  ref,
  query,
) async {
  return ref
      .watch(executionServiceProvider)
      .chartData(query.symbol, days: query.days);
});

final backtestsProvider = FutureProvider<List<Backtest>>((ref) async {
  if (ref.watch(currentUserProvider) == null) return const [];
  return ref.watch(executionServiceProvider).backtests();
});

final backtestProvider = FutureProvider.family<Backtest, int>(
  (ref, id) => ref.watch(executionServiceProvider).getBacktest(id),
);

/// Identifiants des backtests de la dernière simulation lancée
/// (`PortfolioSimulationLaunch.batchIds`).
final portfolioBatchIdsProvider = StateProvider<List<int>>((ref) => const []);

/// Suivi de la simulation en cours, `null` si aucune n'a été lancée.
/// Interroger périodiquement via `ref.invalidate` tant que `!isCompleted`.
final portfolioSimulationProvider = FutureProvider<PortfolioSimulation?>((
  ref,
) async {
  final ids = ref.watch(portfolioBatchIdsProvider);
  if (ids.isEmpty) return null;
  return ref.watch(executionServiceProvider).portfolioSimulation(ids);
});

final exchangeConnectionsProvider = FutureProvider<List<ExchangeConnection>>((
  ref,
) async {
  if (ref.watch(currentUserProvider) == null) return const [];
  return ref.watch(exchangeServiceProvider).connections();
});

final assetsProvider = FutureProvider<List<Asset>>((ref) async {
  if (ref.watch(currentUserProvider) == null) return const [];
  return ref.watch(exchangeServiceProvider).assets();
});

final strategiesProvider = FutureProvider<List<StrategyConfig>>((ref) async {
  if (ref.watch(currentUserProvider) == null) return const [];
  return ref.watch(strategyServiceProvider).strategies();
});

/// Les cours sont publics côté backend.
final coursesProvider = FutureProvider<List<Course>>(
  (ref) => ref.watch(courseServiceProvider).courses(),
);

extension RefreshAllData on WidgetRef {
  /// Recharge toutes les données du compte (pull-to-refresh global).
  Future<void> refreshAllData() async {
    invalidate(positionsProvider);
    invalidate(tradesProvider);
    invalidate(performanceProvider);
    invalidate(exchangeConnectionsProvider);
    invalidate(strategiesProvider);
    invalidate(backtestsProvider);
    invalidate(chartDataProvider);
    await Future.wait([
      read(positionsProvider.future),
      read(tradesProvider.future),
      read(performanceProvider.future),
    ]).catchError((Object _) => <Object?>[]);
  }
}
