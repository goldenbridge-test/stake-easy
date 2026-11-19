import '../../../core/models/position.dart';
import '../../../core/models/trade.dart';

/// Contenu de l'écran Portfolio : positions + historique des trades.
class PortfolioData {
  PortfolioData({required this.positions, required this.trades})
      : _symbols = {for (final p in positions) p.id: p.symbol};

  final List<Position> positions;
  final List<Trade> trades;
  final Map<int, String> _symbols;

  List<Position> get openPositions =>
      positions.where((p) => !p.isFullyClosed).toList(growable: false);

  List<Position> get closedPositions =>
      positions.where((p) => p.isFullyClosed).toList(growable: false);

  /// TradeSerializer ne renvoie pas l'actif : on le retrouve via la position.
  String? symbolOf(Trade trade) => trade.position == null ? null : _symbols[trade.position];
}
