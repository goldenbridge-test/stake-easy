import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:goldenapp/core/blockchain/blockchain_config.dart';
import 'package:goldenapp/core/blockchain/staking_service.dart';
import 'package:web3dart/web3dart.dart';

void main() {
  test('conversion montant <-> unités brutes', () {
    expect(StakingService.toUnits('1.5', 6), BigInt.from(1500000));
    expect(
      StakingService.toUnits('12,25', 18),
      BigInt.parse('12250000000000000000'),
    );
    expect(StakingService.toUnits('0.1234567', 6), BigInt.from(123456));
    expect(StakingService.fromUnits(BigInt.from(1500000), 6), 1.5);
    expect(() => StakingService.toUnits('abc', 6), throwsFormatException);
  });

  test('configuration Sepolia par défaut', () {
    final config = BlockchainConfig.fromEnvironment();
    expect(config.chainId, 11155111);
    expect(config.networkName, 'sepolia');
    expect(
      config.tokenFarm.hex.toLowerCase(),
      BlockchainConfig.sepoliaTokenFarm.toLowerCase(),
    );
    expect(config.stakeableTokens.map((t) => t.symbol), ['USDC', 'GLD']);
  });

  test('les ABIs embarqués sont valides pour web3dart', () {
    ContractAbi abi(String file, String name) =>
        ContractAbi.fromJson(File('assets/abi/$file').readAsStringSync(), name);

    final farm = abi('token_farm.json', 'TokenFarm');
    for (final f in [
      'stakeTokens',
      'unstakeTokens',
      'getUserTotalValue',
      'stakingBalance',
      'tokenIsAllowed',
    ]) {
      expect(
        farm.functions.where((fn) => fn.name == f),
        hasLength(1),
        reason: f,
      );
    }
    final gld = abi('golden_token.json', 'GoldenToken');
    expect(gld.functions.map((f) => f.name), contains('balanceOf'));
    final erc20 = abi('erc20.json', 'ERC20');
    expect(
      erc20.functions.map((f) => f.name),
      containsAll(['approve', 'allowance']),
    );
  });
}
