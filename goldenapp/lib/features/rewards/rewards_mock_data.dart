import 'models/rewards_overview.dart';

// Données factices des récompenses. À remplacer par les lectures on-chain
// (GoldenToken.balanceOf, TokenFarm.pendingReturns, événements Transfer).

final RewardsOverview mockRewardsOverview = RewardsOverview(
  goldenTokenBalance: 1284.52,
  circulatingSupply: 10450000,
  maxSupply: 100000000,
  estimatedNextIssuance: 1.8425,
  pendingReturns: 0.0312,
  history: [
    RewardEvent(
      type: RewardType.issuance,
      amount: 1.79,
      symbol: 'GLD',
      receivedAt: DateTime(2026, 11, 15, 12, 0),
      txHash: '0x5a1f9c3e7b2d4a8f0e6c1b9d3a7e5f2c4b8d0a6e9f1c3b5d7a2e4f6c8b0d1a3e',
    ),
    RewardEvent(
      type: RewardType.loanReturn,
      amount: 0.0145,
      symbol: 'ETH',
      receivedAt: DateTime(2026, 11, 10, 9, 30),
      txHash: '0x9e2b7d1f4c8a3e6b0d5f9a2c7e1b4d8f3a6c0e5b9d2f7a1c4e8b3d6f0a5c9e2b',
    ),
    RewardEvent(
      type: RewardType.issuance,
      amount: 1.71,
      symbol: 'GLD',
      receivedAt: DateTime(2026, 11, 8, 12, 0),
    ),
    RewardEvent(
      type: RewardType.issuance,
      amount: 1.65,
      symbol: 'GLD',
      receivedAt: DateTime(2026, 11, 1, 12, 0),
    ),
  ],
);

/// Source unique de l'écran : à remplacer par la lecture on-chain.
Future<RewardsOverview> loadMockRewards() async {
  await Future<void>.delayed(const Duration(milliseconds: 400));
  return mockRewardsOverview;
}
