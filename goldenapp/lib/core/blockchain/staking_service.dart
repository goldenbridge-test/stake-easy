import 'package:http/http.dart' as http;
import 'package:web3dart/web3dart.dart';

import 'abi_loader.dart';
import 'blockchain_config.dart';

/// Lectures et écritures on-chain sur le TokenFarm et le GoldenToken.
///
/// Sécurité : ce service ne stocke ni ne demande jamais de clé privée. Les
/// écritures reçoivent un [Credentials] fourni par le wallet de l'utilisateur.
///
/// TODO(wallet): brancher WalletConnect / Reown AppKit. Le wallet externe
/// fournira l'adresse (lectures) et un `Credentials` implémentant
/// `CustomTransactionSender` (écritures signées dans le wallet, jamais ici).
class StakingService {
  StakingService({
    required this.config,
    Web3Client? client,
    AbiLoader? abiLoader,
  }) : _client = client ?? Web3Client(config.rpcUrl, http.Client()),
       _abis = abiLoader ?? AbiLoader();

  final BlockchainConfig config;
  final Web3Client _client;
  final AbiLoader _abis;

  DeployedContract? _farm;
  DeployedContract? _gld;
  final _erc20 = <EthereumAddress, DeployedContract>{};

  Future<DeployedContract> _tokenFarm() async =>
      _farm ??= await _abis.tokenFarm(config.tokenFarm);

  Future<DeployedContract> _goldenToken() async =>
      _gld ??= await _abis.goldenToken(config.goldenToken);

  Future<DeployedContract> _token(EthereumAddress token) async =>
      _erc20[token] ??= await _abis.erc20(token);

  Future<List<dynamic>> _call(
    DeployedContract contract,
    String function,
    List<dynamic> params,
  ) => _client.call(
    contract: contract,
    function: contract.function(function),
    params: params,
  );

  // --- Lectures --------------------------------------------------------------

  /// Valeur totale stakée par [user], dans l'unité des price feeds Chainlink.
  Future<BigInt> getUserTotalValue(EthereumAddress user) async =>
      (await _call(await _tokenFarm(), 'getUserTotalValue', [user])).first
          as BigInt;

  /// Montant (unités brutes) de [token] staké par [user].
  Future<BigInt> stakingBalance(
    EthereumAddress token,
    EthereumAddress user,
  ) async =>
      (await _call(await _tokenFarm(), 'stakingBalance', [token, user])).first
          as BigInt;

  /// Valeur stakée de [token] par [user] :
  /// `stakingBalance * prix / 10^décimales du price feed`, donc exprimée avec
  /// les décimales du jeton (en USD pour les feeds Chainlink */USD).
  Future<BigInt> tokenStakedValue(
    EthereumAddress user,
    EthereumAddress token,
  ) async =>
      (await _call(await _tokenFarm(), 'getUserTokenStakingBalanceEthValue', [
            user,
            token,
          ])).first
          as BigInt;

  /// Plafond de stake par jeton et par utilisateur (unités brutes du jeton).
  Future<BigInt> maxStakePerUser() async =>
      (await _call(await _tokenFarm(), 'maxStakePerUser', [])).first as BigInt;

  Future<bool> tokenIsAllowed(EthereumAddress token) async =>
      (await _call(await _tokenFarm(), 'tokenIsAllowed', [token])).first
          as bool;

  /// Solde de GoldenToken (GLD, 18 décimales) de [owner].
  Future<BigInt> goldenTokenBalance(EthereumAddress owner) async =>
      (await _call(await _goldenToken(), 'balanceOf', [owner])).first as BigInt;

  /// GLD en circulation (18 décimales).
  Future<BigInt> goldenTokenCirculatingSupply() async =>
      (await _call(await _goldenToken(), 'circulatingSupply', [])).first
          as BigInt;

  /// Offre maximale de GLD (18 décimales).
  Future<BigInt> goldenTokenMaxSupply() async =>
      (await _call(await _goldenToken(), 'MAX_SUPPLY', [])).first as BigInt;

  /// Solde d'un ERC20 quelconque.
  Future<BigInt> tokenBalance(
    EthereumAddress token,
    EthereumAddress owner,
  ) async =>
      (await _call(await _token(token), 'balanceOf', [owner])).first as BigInt;

  /// Autorisation déjà accordée au TokenFarm pour [token].
  Future<BigInt> allowance(
    EthereumAddress token,
    EthereumAddress owner,
  ) async =>
      (await _call(await _token(token), 'allowance', [
            owner,
            config.tokenFarm,
          ])).first
          as BigInt;

  // --- Écritures (signées par le wallet) -------------------------------------

  /// Autorise le TokenFarm à prélever [amount] de [token]. Renvoie le hash.
  Future<String> approve(
    Credentials credentials,
    EthereumAddress token,
    BigInt amount,
  ) async {
    final contract = await _token(token);
    return _send(credentials, contract, 'approve', [config.tokenFarm, amount]);
  }

  /// Stake [amount] de [token] (nécessite un [approve] préalable).
  Future<String> stakeTokens(
    Credentials credentials,
    EthereumAddress token,
    BigInt amount,
  ) async =>
      _send(credentials, await _tokenFarm(), 'stakeTokens', [amount, token]);

  /// Retire la totalité du solde staké de [token].
  Future<String> unstakeTokens(
    Credentials credentials,
    EthereumAddress token,
  ) async => _send(credentials, await _tokenFarm(), 'unstakeTokens', [token]);

  Future<String> _send(
    Credentials credentials,
    DeployedContract contract,
    String function,
    List<dynamic> params,
  ) => _client.sendTransaction(
    credentials,
    Transaction.callContract(
      contract: contract,
      function: contract.function(function),
      parameters: params,
    ),
    chainId: config.chainId,
  );

  /// Attend le reçu d'une transaction (null si toujours en attente).
  Future<TransactionReceipt?> receipt(String txHash) =>
      _client.getTransactionReceipt(txHash);

  Future<void> dispose() => _client.dispose();

  // --- Conversions -----------------------------------------------------------

  /// Unités brutes -> montant décimal (ex. 1500000 avec 6 décimales -> 1.5).
  static double fromUnits(BigInt raw, int decimals) {
    final divisor = BigInt.from(10).pow(decimals);
    final whole = raw ~/ divisor;
    final fraction = raw.remainder(divisor);
    return whole.toDouble() + fraction.toDouble() / divisor.toDouble();
  }

  /// Montant décimal saisi (« 12,5 » ou « 12.5 ») -> unités brutes.
  static BigInt toUnits(String amount, int decimals) {
    final normalized = amount.trim().replaceAll(',', '.');
    if (!RegExp(r'^\d*\.?\d*$').hasMatch(normalized) || normalized.isEmpty) {
      throw const FormatException('Montant invalide.');
    }
    final parts = normalized.split('.');
    final whole = parts[0].isEmpty ? '0' : parts[0];
    var fraction = parts.length > 1 ? parts[1] : '';
    if (fraction.length > decimals) fraction = fraction.substring(0, decimals);
    fraction = fraction.padRight(decimals, '0');
    return BigInt.parse(whole + fraction);
  }
}
