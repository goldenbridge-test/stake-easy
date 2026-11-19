import 'blockchain_config.dart';
import 'staking_service.dart';

/// Solde staké d'un jeton.
class TokenStake {
  const TokenStake({required this.token, required this.raw});

  final StakeableToken token;
  final BigInt raw;

  double get amount => StakingService.fromUnits(raw, token.decimals);
}

/// État on-chain du staking d'une adresse.
class StakingSnapshot {
  const StakingSnapshot({
    required this.address,
    required this.totalValueRaw,
    required this.goldenTokenRaw,
    required this.stakes,
  });

  final String address;

  /// `getUserTotalValue` brut (unité des price feeds, 8 décimales en général).
  final BigInt totalValueRaw;

  /// Solde GLD brut (18 décimales).
  final BigInt goldenTokenRaw;
  final List<TokenStake> stakes;

  double get goldenTokenBalance => StakingService.fromUnits(goldenTokenRaw, 18);

  /// Valeur totale en USD (price feeds Chainlink à 8 décimales).
  double get totalValueUsd => StakingService.fromUnits(totalValueRaw, 8);

  bool get hasStakes => stakes.any((s) => s.raw > BigInt.zero);
}
