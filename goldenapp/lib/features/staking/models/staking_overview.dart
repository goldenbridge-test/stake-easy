// Modèles d'affichage du staking (contrat TokenFarm).
// Les montants on-chain (uint256) sont convertis en double (÷ 10^decimals)
// par staking_providers.dart avant de construire ces objets.

/// Token autorisé au staking (TokenFarm.allowedTokens).
class AllowedToken {
  const AllowedToken({
    required this.address,
    required this.symbol,
    required this.name,
    required this.walletBalance,
    required this.stakingBalance,
    required this.stakedValue,
    required this.maxStake,
    this.decimals = 18,
  });

  /// Adresse du contrat ERC20.
  final String address;
  final String symbol;
  final String name;
  final int decimals;

  /// Solde ERC20 disponible dans le wallet (balanceOf(user)).
  final double walletBalance;

  /// TokenFarm.stakingBalance(token, user).
  final double stakingBalance;

  /// TokenFarm.getUserTokenStakingBalanceEthValue(user, token), dans l'unité
  /// des price feeds (USD).
  final double stakedValue;

  /// TokenFarm.maxStakePerUser, exprimé dans les décimales de ce token.
  final double maxStake;

  bool get isStaked => stakingBalance > 0;
}

/// Vue d'ensemble du staking pour l'adresse consultée.
class StakingOverview {
  const StakingOverview({
    required this.walletAddress,
    required this.networkName,
    required this.userTotalValue,
    required this.tokens,
    this.valueUnit = 'USD',
    this.canSign = false,
  });

  /// Adresse du wallet consulté (null si aucune).
  final String? walletAddress;
  final String networkName;

  /// Somme des valeurs stakées par token, dans [valueUnit].
  final double userTotalValue;

  /// Unité des valeurs renvoyées par les price feeds Chainlink (*/USD).
  final String valueUnit;
  final List<AllowedToken> tokens;

  /// Vrai si un wallet peut signer les transactions (WalletConnect).
  final bool canSign;

  bool get hasWallet => walletAddress != null && walletAddress!.isNotEmpty;

  int get stakedTokenCount => tokens.where((t) => t.isStaked).length;
}
