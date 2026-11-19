import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:web3dart/web3dart.dart';

import '../../core/blockchain/blockchain_config.dart';
import '../../core/blockchain/staking_service.dart';
import '../../core/providers/providers.dart';
import 'models/staking_overview.dart';

/// Lecture on-chain du staking de l'adresse consultée ([walletAddressProvider]).
final stakingOverviewProvider = FutureProvider<StakingOverview>((ref) async {
  final config = ref.watch(blockchainConfigProvider);
  final address = ref.watch(walletAddressProvider);
  final canSign = ref.watch(walletCredentialsProvider) != null;
  if (address == null || address.isEmpty) {
    return StakingOverview(
      walletAddress: null,
      networkName: config.networkName,
      userTotalValue: 0,
      tokens: const [],
    );
  }

  final service = ref.watch(stakingServiceProvider);
  final user = EthereumAddress.fromHex(address);
  final maxRaw = await service.maxStakePerUser();
  final tokens = await Future.wait([
    for (final token in config.stakeableTokens) _readToken(service, token, user, maxRaw),
  ]);
  final allowed = tokens.whereType<AllowedToken>().toList(growable: false);

  return StakingOverview(
    walletAddress: address,
    networkName: config.networkName,
    // getUserTotalValue additionne des montants aux décimales différentes
    // (USDC 6, GLD 18) : on somme plutôt les valeurs converties par token.
    userTotalValue: allowed.fold(0, (sum, t) => sum + t.stakedValue),
    tokens: allowed,
    canSign: canSign,
  );
});

/// `null` si le token n'est pas (ou plus) autorisé par le TokenFarm.
Future<AllowedToken?> _readToken(
  StakingService service,
  StakeableToken token,
  EthereumAddress user,
  BigInt maxRaw,
) async {
  final address = token.ethAddress;
  if (!await service.tokenIsAllowed(address)) return null;
  final balances = await Future.wait([
    service.tokenBalance(address, user),
    service.stakingBalance(address, user),
    // Sans price feed configuré, le contrat refuse l'appel : valeur inconnue = 0.
    service.tokenStakedValue(user, address).catchError((Object _) => BigInt.zero),
  ]);
  double units(BigInt raw) => StakingService.fromUnits(raw, token.decimals);
  return AllowedToken(
    address: token.address,
    symbol: token.symbol,
    name: token.name,
    decimals: token.decimals,
    walletBalance: units(balances[0]),
    stakingBalance: units(balances[1]),
    stakedValue: units(balances[2]),
    maxStake: units(maxRaw),
  );
}

/// Aucune signature possible tant que WalletConnect n'est pas branché.
class WalletRequiredException implements Exception {
  const WalletRequiredException();

  @override
  String toString() => 'Connectez votre wallet pour signer la transaction.';
}

/// Écritures on-chain (approve + stake, unstake), signées par le wallet externe.
class StakingActions {
  StakingActions(this._ref);

  final Ref _ref;

  Credentials _credentials() {
    final credentials = _ref.read(walletCredentialsProvider);
    if (credentials == null) throw const WalletRequiredException();
    return credentials;
  }

  /// Autorise le TokenFarm si nécessaire puis stake [amount] (saisie « 12,5 »).
  Future<void> stake(AllowedToken token, String amount) async {
    final credentials = _credentials();
    final service = _ref.read(stakingServiceProvider);
    final tokenAddress = EthereumAddress.fromHex(token.address);
    final owner = credentials.address;
    final raw = StakingService.toUnits(amount, token.decimals);
    if (await service.allowance(tokenAddress, owner) < raw) {
      await _confirmed(service, await service.approve(credentials, tokenAddress, raw));
    }
    await _confirmed(service, await service.stakeTokens(credentials, tokenAddress, raw));
    _ref.invalidate(stakingOverviewProvider);
  }

  /// Retire tout le solde staké de [token] (TokenFarm.unstakeTokens).
  Future<void> unstake(AllowedToken token) async {
    final credentials = _credentials();
    final service = _ref.read(stakingServiceProvider);
    await _confirmed(
      service,
      await service.unstakeTokens(credentials, EthereumAddress.fromHex(token.address)),
    );
    _ref.invalidate(stakingOverviewProvider);
  }

  /// Attend que la transaction soit minée (2 minutes au plus).
  static Future<void> _confirmed(StakingService service, String txHash) async {
    for (var i = 0; i < 40; i++) {
      final receipt = await service.receipt(txHash);
      if (receipt != null) {
        if (receipt.status == false) throw StateError('Transaction annulée par le contrat.');
        return;
      }
      await Future<void>.delayed(const Duration(seconds: 3));
    }
    throw StateError('Transaction toujours en attente : vérifiez-la dans votre wallet.');
  }
}

final stakingActionsProvider = Provider<StakingActions>(StakingActions.new);
