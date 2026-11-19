import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:web3dart/web3dart.dart';

import '../../core/blockchain/staking_service.dart';
import '../../core/providers/providers.dart';
import 'models/rewards_overview.dart';

/// Solde GLD, distribution estimée et offre du GoldenToken pour l'adresse
/// consultée ([walletAddressProvider]).
final rewardsOverviewProvider = FutureProvider<RewardsOverview>((ref) async {
  final config = ref.watch(blockchainConfigProvider);
  final address = ref.watch(walletAddressProvider);
  if (address == null || address.isEmpty) {
    return RewardsOverview(
      walletAddress: null,
      networkName: config.networkName,
      goldenTokenBalance: 0,
      circulatingSupply: 0,
      maxSupply: 0,
      estimatedNextIssuance: 0,
    );
  }

  final service = ref.watch(stakingServiceProvider);
  final user = EthereumAddress.fromHex(address);
  final raw = await Future.wait([
    service.goldenTokenBalance(user),
    service.getUserTotalValue(user),
    service.goldenTokenCirculatingSupply(),
    service.goldenTokenMaxSupply(),
  ]);
  double gld(BigInt value) => StakingService.fromUnits(value, 18);
  return RewardsOverview(
    walletAddress: address,
    networkName: config.networkName,
    goldenTokenBalance: gld(raw[0]),
    // issueTokens transfère getUserTotalValue tel quel, en unités GLD.
    estimatedNextIssuance: gld(raw[1]),
    circulatingSupply: gld(raw[2]),
    maxSupply: gld(raw[3]),
  );
});
