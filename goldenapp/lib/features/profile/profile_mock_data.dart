import '../exchanges/exchanges_mock_data.dart';
import 'models/user_profile.dart';

// Données factices du profil. À remplacer par GET /api/accounts/me/
// (+ /api/accounts/profile/ pour prénom et nom) et /api/exchanges/connections/.

const UserProfile mockUser = UserProfile(
  id: 7,
  username: 'mouhsine',
  email: 'mouhsine@example.com',
  firstName: 'Mouhsine',
  lastName: 'Golden',
);

/// Source unique de l'écran : à remplacer par l'appel API.
Future<ProfileData> loadMockProfile() async {
  final connections = await loadMockConnections();
  return ProfileData(
    user: mockUser,
    connections: connections,
    walletAddress: '0x8f3A21cD94b7E0a5C61fD0B2e4A9c7D13e5B9a42',
  );
}
