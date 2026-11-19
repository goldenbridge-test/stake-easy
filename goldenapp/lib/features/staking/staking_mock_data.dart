import 'models/staking_overview.dart';

// Données factices du staking. À remplacer par les lectures web3dart sur
// TokenFarm (allowedTokens, stakingBalance, getUserTotalValue…).

const StakingOverview mockStakingOverview = StakingOverview(
  walletAddress: '0x8f3A21cD94b7E0a5C61fD0B2e4A9c7D13e5B9a42',
  networkName: 'Sepolia',
  userTotalValue: 1.8425,
  maxStakePerUser: 100000,
  tokens: [
    AllowedToken(
      address: '0x1c4E2fB8a7D9e3F06b5A92C1d8E7f4A3B6c0D951',
      symbol: 'GLD',
      name: 'Golden Token',
      walletBalance: 2450,
      stakingBalance: 5000,
      stakedValue: 1.25,
    ),
    AllowedToken(
      address: '0x7b9C3eA1F4d2B8c06E5a7D91f3C2b4E8A6d0F172',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      walletBalance: 0.42,
      stakingBalance: 0.5925,
      stakedValue: 0.5925,
    ),
    AllowedToken(
      address: '0x3e5D8fA2c7B1E9d04F6a3C8b2D7e1A5f9C4B0e63',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      walletBalance: 820,
      stakingBalance: 0,
      stakedValue: 0,
    ),
  ],
);

/// Source unique de l'écran : à remplacer par la lecture on-chain.
Future<StakingOverview> loadMockStakingOverview() async {
  await Future<void>.delayed(const Duration(milliseconds: 400));
  return mockStakingOverview;
}

/// Simule approve + TokenFarm.stakeTokens(amount, token).
Future<void> mockStake(String tokenAddress, double amount) =>
    Future<void>.delayed(const Duration(milliseconds: 900));

/// Simule TokenFarm.unstakeTokens(token) (retire tout le solde du token).
Future<void> mockUnstake(String tokenAddress) =>
    Future<void>.delayed(const Duration(milliseconds: 900));
