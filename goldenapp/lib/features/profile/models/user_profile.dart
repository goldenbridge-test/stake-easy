import '../../../shared/utils/json_parsing.dart';
import '../../exchanges/models/exchange_connection.dart';

/// Utilisateur courant.
/// GET /api/accounts/me/ renvoie {id, username, email, is_staff} ;
/// first_name / last_name viennent de UserSerializer (/api/accounts/profile/).
class UserProfile {
  const UserProfile({
    required this.id,
    required this.username,
    required this.email,
    this.firstName = '',
    this.lastName = '',
    this.isStaff = false,
  });

  final int id;
  final String username;
  final String email;
  final String firstName;
  final String lastName;
  final bool isStaff;

  String get fullName {
    final name = '$firstName $lastName'.trim();
    return name.isEmpty ? username : name;
  }

  String get initials {
    final parts = fullName.split(RegExp(r'\s+')).where((p) => p.isNotEmpty).toList();
    if (parts.isEmpty) return '?';
    if (parts.length == 1) return parts.first.substring(0, 1).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  factory UserProfile.fromJson(Map<String, dynamic> json) => UserProfile(
        id: parseInt(json['id']),
        username: json['username']?.toString() ?? '',
        email: json['email']?.toString() ?? '',
        firstName: json['first_name']?.toString() ?? '',
        lastName: json['last_name']?.toString() ?? '',
        isStaff: json['is_staff'] == true,
      );
}

/// Contenu de l'écran Profil.
class ProfileData {
  const ProfileData({required this.user, required this.connections, this.walletAddress});

  final UserProfile user;
  final List<ExchangeConnection> connections;

  /// Wallet connecté via WalletConnect / MetaMask, s'il y en a un.
  final String? walletAddress;
}
