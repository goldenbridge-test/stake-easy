// Modèles d'affichage du staking (contrat TokenFarm).
// Les montants on-chain sont en wei (uint256) : la couche d'intégration les
// convertit en double (÷ 10^decimals) avant de construire ces objets.

/// Token autorisé au staking (TokenFarm.allowedTokens).
class AllowedToken {
  const AllowedToken({
    required this.address,
    required this.symbol,
    required this.name,
    required this.walletBalance,
    required this.stakingBalance,
    required this.stakedValue,
    this.decimals = 18,
  });

  /// Adresse du contrat ERC20 (allowedTokens[i]).
  final String address;
  final String symbol;
  final String name;
  final int decimals;

  /// Solde ERC20 disponible dans le wallet (balanceOf(user)).
  final double walletBalance;

  /// TokenFarm.stakingBalance(token, user).
  final double stakingBalance;

  /// TokenFarm.getUserTokenStakingBalanceEthValue(user, token).
  final double stakedValue;

  bool get isStaked => stakingBalance > 0;
}

/// Vue d'ensemble du staking pour l'utilisateur connecté.
class StakingOverview {
  const StakingOverview({
    required this.walletAddress,
    required this.networkName,
    required this.userTotalValue,
    required this.maxStakePerUser,
    required this.tokens,
    this.valueUnit = 'ETH',
  });

  /// Adresse du wallet connecté (null si aucun wallet).
  final String? walletAddress;
  final String networkName;

  /// TokenFarm.getUserTotalValue(user), exprimé dans [valueUnit].
  final double userTotalValue;

  /// Unité des valeurs renvoyées par les price feeds (ETH, BNB…).
  final String valueUnit;

  /// TokenFarm.maxStakePerUser (par token).
  final double maxStakePerUser;
  final List<AllowedToken> tokens;

  bool get hasWallet => walletAddress != null && walletAddress!.isNotEmpty;

  int get stakedTokenCount => tokens.where((t) => t.isStaked).length;
}
