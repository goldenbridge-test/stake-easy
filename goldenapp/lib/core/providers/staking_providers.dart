import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:web3dart/web3dart.dart';

import '../blockchain/blockchain_config.dart';
import '../blockchain/staking_service.dart';
import '../blockchain/staking_snapshot.dart';

final blockchainConfigProvider = Provider<BlockchainConfig>(
  (ref) => BlockchainConfig.fromEnvironment(),
);

final stakingServiceProvider = Provider<StakingService>((ref) {
  final service = StakingService(config: ref.watch(blockchainConfigProvider));
  ref.onDispose(service.dispose);
  return service;
});

/// Adresse du wallet connecté (`0x...`), `null` tant qu'aucun wallet n'est relié.
///
/// TODO(wallet): alimenter depuis WalletConnect / Reown AppKit. Ne jamais
/// demander ni stocker de clé privée dans l'application.
final walletAddressProvider = StateProvider<String?>((ref) => null);

/// Lecture on-chain du staking, `null` sans wallet connecté.
final stakingProvider = FutureProvider<StakingSnapshot?>((ref) async {
  final address = ref.watch(walletAddressProvider);
  if (address == null || address.isEmpty) return null;

  final config = ref.watch(blockchainConfigProvider);
  final service = ref.watch(stakingServiceProvider);
  final user = EthereumAddress.fromHex(address);

  final results = await Future.wait([
    service.getUserTotalValue(user),
    service.goldenTokenBalance(user),
    for (final token in config.stakeableTokens)
      service.stakingBalance(token.ethAddress, user),
  ]);

  return StakingSnapshot(
    address: address,
    totalValueRaw: results[0],
    goldenTokenRaw: results[1],
    stakes: [
      for (var i = 0; i < config.stakeableTokens.length; i++)
        TokenStake(token: config.stakeableTokens[i], raw: results[i + 2]),
    ],
  );
});
