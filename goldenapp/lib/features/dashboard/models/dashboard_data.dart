import '../../portfolio/models/position.dart';
import 'performance.dart';

/// Contenu principal du Tableau de bord.
class DashboardData {
  const DashboardData({required this.performance, required this.positions});

  /// null si l'utilisateur n'a encore aucune stratégie (404 de PerformanceView).
  final Performance? performance;
  final List<Position> positions;

  List<Position> get openPositions =>
      positions.where((p) => !p.isFullyClosed).toList(growable: false);
}
