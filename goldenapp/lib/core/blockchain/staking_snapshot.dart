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

  /// `getUserTotalValue` brut : somme des `stakingBalance * prix / 10^8`,
  /// chaque terme gardant les décimales de son jeton.
  final BigInt totalValueRaw;

  /// Solde GLD brut (18 décimales).
  final BigInt goldenTokenRaw;
  final List<TokenStake> stakes;

  double get goldenTokenBalance => StakingService.fromUnits(goldenTokenRaw, 18);

  /// GLD versés au prochain `issueTokens` : le contrat transfère
  /// `getUserTotalValue` tel quel, en unités GLD (18 décimales).
  double get estimatedIssuanceGld =>
      StakingService.fromUnits(totalValueRaw, 18);

  bool get hasStakes => stakes.any((s) => s.raw > BigInt.zero);
}
