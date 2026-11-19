import '../../../core/models/exchange_connection.dart';
import '../../../core/models/user.dart';

/// Contenu de l'écran Profil.
class ProfileData {
  const ProfileData({required this.user, required this.connections, this.walletAddress});

  final User user;
  final List<ExchangeConnection> connections;

  /// Wallet connecté (WalletConnect / MetaMask), s'il y en a un.
  final String? walletAddress;
}
