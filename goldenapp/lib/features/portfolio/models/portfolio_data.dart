import 'position.dart';
import 'trade.dart';

/// Contenu de l'écran Portfolio : positions + historique des trades.
class PortfolioData {
  const PortfolioData({required this.positions, required this.trades});

  final List<Position> positions;
  final List<Trade> trades;

  List<Position> get openPositions =>
      positions.where((p) => !p.isFullyClosed).toList(growable: false);

  List<Position> get closedPositions =>
      positions.where((p) => p.isFullyClosed).toList(growable: false);
}
