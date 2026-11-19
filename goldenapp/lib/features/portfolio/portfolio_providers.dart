import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers/providers.dart';
import 'models/portfolio_data.dart';

/// Positions et trades de l'utilisateur, chargés en parallèle.
final portfolioProvider = FutureProvider<PortfolioData>((ref) async {
  final positions = ref.watch(positionsProvider.future);
  final trades = ref.watch(tradesProvider.future);
  return PortfolioData(positions: await positions, trades: await trades);
});

/// Recharge positions et trades (pull-to-refresh).
Future<void> refreshPortfolio(WidgetRef ref) async {
  ref.invalidate(positionsProvider);
  ref.invalidate(tradesProvider);
  try {
    await ref.read(portfolioProvider.future);
  } catch (_) {
    // L'erreur est affichée par l'écran.
  }
}
