import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers/providers.dart';
import 'models/dashboard_data.dart';

/// Performance agrégée et positions, chargées en parallèle.
final dashboardProvider = FutureProvider<DashboardData>((ref) async {
  final performance = ref.watch(performanceProvider.future);
  final positions = ref.watch(positionsProvider.future);
  return DashboardData(performance: await performance, positions: await positions);
});

/// Relance les requêtes du tableau de bord (graphique compris).
void invalidateDashboard(WidgetRef ref) {
  ref.invalidate(performanceProvider);
  ref.invalidate(positionsProvider);
  ref.invalidate(chartDataProvider);
}

/// Pull-to-refresh du tableau de bord.
Future<void> refreshDashboard(WidgetRef ref) async {
  invalidateDashboard(ref);
  try {
    await ref.read(dashboardProvider.future);
  } catch (_) {
    // L'erreur est affichée par l'écran.
  }
}
