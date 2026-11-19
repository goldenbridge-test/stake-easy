// Modèles d'affichage des récompenses (GoldenToken + TokenFarm).
// Montants convertis depuis le wei par rewards_providers.dart.

enum RewardType {
  /// GLD reçus via TokenFarm.issueTokens (Transfer GoldenToken depuis TokenFarm).
  issuance('Distribution GLD'),

  /// Part des retours de prêts (TokenFarm.distributeLoanReturns).
  loanReturn('Retour de prêt');

  const RewardType(this.label);
  final String label;
}

/// Récompense reçue (lue depuis les événements on-chain).
class RewardEvent {
  const RewardEvent({
    required this.type,
    required this.amount,
    required this.symbol,
    required this.receivedAt,
    this.txHash,
  });

  final RewardType type;
  final double amount;
  final String symbol;
  final DateTime receivedAt;
  final String? txHash;
}

/// Vue d'ensemble des récompenses de l'utilisateur.
class RewardsOverview {
  const RewardsOverview({
    required this.walletAddress,
    required this.networkName,
    required this.goldenTokenBalance,
    required this.circulatingSupply,
    required this.maxSupply,
    required this.estimatedNextIssuance,
    this.history = const [],
    this.tokenSymbol = 'GLD',
  });

  /// Adresse consultée, null sans wallet.
  final String? walletAddress;
  final String networkName;

  /// GoldenToken.balanceOf(user).
  final double goldenTokenBalance;
  final String tokenSymbol;

  /// GoldenToken.circulatingSupply et MAX_SUPPLY.
  final double circulatingSupply;
  final double maxSupply;

  /// TokenFarm.getUserTotalValue(user) : GLD versés au prochain issueTokens.
  final double estimatedNextIssuance;

  /// Événements on-chain : pas encore lus par l'application (liste vide).
  final List<RewardEvent> history;

  bool get hasWallet => walletAddress != null && walletAddress!.isNotEmpty;

  double get remainingSupply => (maxSupply - circulatingSupply).clamp(0, double.infinity).toDouble();

  double get totalReceivedGld => history
      .where((e) => e.type == RewardType.issuance)
      .fold(0, (sum, e) => sum + e.amount);
}
