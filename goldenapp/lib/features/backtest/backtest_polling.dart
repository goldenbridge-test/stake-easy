import '../../core/models/backtest.dart';

/// Suit un backtest traité en tâche de fond par le backend : émet [initial],
/// puis interroge `GET /execution/backtests/{id}/` toutes les [interval]
/// jusqu'à un statut terminé (`completed` ou `failed`).
///
/// Lève une [StateError] si le backtest est toujours en cours après [timeout].
Stream<Backtest> pollBacktest(
  Backtest initial,
  Future<Backtest> Function(int id) fetch, {
  Duration interval = const Duration(seconds: 3),
  Duration timeout = const Duration(minutes: 10),
}) async* {
  var current = initial;
  yield current;
  final deadline = DateTime.now().add(timeout);
  while (current.isPending) {
    if (DateTime.now().isAfter(deadline)) {
      throw StateError('Le backtest prend plus de temps que prévu. Consultez-le plus tard dans l\'historique.');
    }
    await Future<void>.delayed(interval);
    current = await fetch(current.id);
    yield current;
  }
}
