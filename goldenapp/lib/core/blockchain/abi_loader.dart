import 'package:flutter/services.dart';
import 'package:web3dart/web3dart.dart';

/// Charge les ABIs JSON embarqués dans `assets/abi/`.
class AbiLoader {
  AbiLoader([AssetBundle? bundle]) : _bundle = bundle ?? rootBundle;

  static const tokenFarmAsset = 'assets/abi/token_farm.json';
  static const goldenTokenAsset = 'assets/abi/golden_token.json';
  static const erc20Asset = 'assets/abi/erc20.json';

  final AssetBundle _bundle;
  final _cache = <String, String>{};

  Future<String> _read(String asset) async =>
      _cache[asset] ??= await _bundle.loadString(asset);

  Future<DeployedContract> load(
    String asset,
    String contractName,
    EthereumAddress address,
  ) async {
    final abi = ContractAbi.fromJson(await _read(asset), contractName);
    return DeployedContract(abi, address);
  }

  Future<DeployedContract> tokenFarm(EthereumAddress address) =>
      load(tokenFarmAsset, 'TokenFarm', address);

  Future<DeployedContract> goldenToken(EthereumAddress address) =>
      load(goldenTokenAsset, 'GoldenToken', address);

  Future<DeployedContract> erc20(EthereumAddress address) =>
      load(erc20Asset, 'ERC20', address);
}
