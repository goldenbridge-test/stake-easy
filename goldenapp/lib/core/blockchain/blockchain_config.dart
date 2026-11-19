import 'package:web3dart/web3dart.dart';

/// Jeton pouvant être staké dans le TokenFarm.
class StakeableToken {
  const StakeableToken({
    required this.symbol,
    required this.name,
    required this.address,
    required this.decimals,
  });

  final String symbol;
  final String name;
  final String address;
  final int decimals;

  EthereumAddress get ethAddress => EthereumAddress.fromHex(address);
}

/// Réseau et adresses des contrats GoldenBridge.
///
/// Sources : `backend_dave/api_client_reference/helper-config.json` (chainId -> nom),
/// `brownie-config-json.json` (jetons Sepolia) et `DEPLOYMENT_GUIDE.md`
/// (contrats déployés sur Sepolia).
///
/// Tout est surchargeable au build :
/// `--dart-define=CHAIN_ID=11155111 --dart-define=RPC_URL=https://...`
/// `--dart-define=TOKEN_FARM_ADDRESS=0x... --dart-define=GOLDEN_TOKEN_ADDRESS=0x...`
class BlockchainConfig {
  const BlockchainConfig({
    required this.chainId,
    required this.rpcUrl,
    required this.tokenFarmAddress,
    required this.goldenTokenAddress,
    this.stakeableTokens = const [],
  });

  final int chainId;
  final String rpcUrl;
  final String tokenFarmAddress;
  final String goldenTokenAddress;
  final List<StakeableToken> stakeableTokens;

  EthereumAddress get tokenFarm => EthereumAddress.fromHex(tokenFarmAddress);
  EthereumAddress get goldenToken =>
      EthereumAddress.fromHex(goldenTokenAddress);

  String get networkName => networkNames[chainId] ?? 'Réseau $chainId';

  /// Équivalent de helper-config.json.
  static const networkNames = <int, String>{
    1: 'mainnet',
    4: 'Goerli',
    42: 'kovan',
    97: 'BSCTestnet',
    1337: 'ganache',
    11155111: 'sepolia',
  };

  static const sepoliaChainId = 11155111;

  /// Contrats déployés sur Sepolia (DEPLOYMENT_GUIDE.md).
  static const sepoliaTokenFarm = '0x00307df619c9A812bD934ecf22225386b606BAF1';
  static const sepoliaGoldenToken =
      '0x1E80FA92066E96d7B2D1776A065165Cb8e7Ad300';

  /// USDC de test Sepolia (brownie-config, `usdc_token`), jeton autorisé au staking.
  static const sepoliaUsdc = StakeableToken(
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    decimals: 6,
  );

  /// Configuration issue des `--dart-define`, Sepolia par défaut.
  factory BlockchainConfig.fromEnvironment() {
    const chainId = int.fromEnvironment(
      'CHAIN_ID',
      defaultValue: sepoliaChainId,
    );
    const rpcUrl = String.fromEnvironment(
      'RPC_URL',
      defaultValue: 'https://ethereum-sepolia-rpc.publicnode.com',
    );
    const farm = String.fromEnvironment(
      'TOKEN_FARM_ADDRESS',
      defaultValue: sepoliaTokenFarm,
    );
    const gld = String.fromEnvironment(
      'GOLDEN_TOKEN_ADDRESS',
      defaultValue: sepoliaGoldenToken,
    );
    return BlockchainConfig(
      chainId: chainId,
      rpcUrl: rpcUrl,
      tokenFarmAddress: farm,
      goldenTokenAddress: gld,
      stakeableTokens: [
        sepoliaUsdc,
        StakeableToken(
          symbol: 'GLD',
          name: 'Golden Token',
          address: gld,
          decimals: 18,
        ),
      ],
    );
  }
}
