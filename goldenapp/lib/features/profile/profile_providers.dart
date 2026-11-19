import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/models/user.dart';
import '../../core/providers/providers.dart';
import 'models/profile_data.dart';

/// Profil affiché : utilisateur de la session complété par `/accounts/profile/me/`
/// (prénom, nom), connexions exchange et wallet. `null` hors session.
final profileProvider = FutureProvider<ProfileData?>((ref) async {
  final user = ref.watch(currentUserProvider);
  if (user == null) return null;

  final detailsFuture = _details(ref.watch(authServiceProvider).profile());
  final connections = await ref.watch(exchangeConnectionsProvider.future);
  final details = await detailsFuture;

  return ProfileData(
    user: details == null
        ? user
        : user.copyWith(firstName: details.firstName, lastName: details.lastName, email: details.email),
    connections: connections,
    walletAddress: ref.watch(walletAddressProvider),
  );
});

/// `/accounts/me/` ne renvoie ni prénom ni nom : si le profil complet échoue,
/// on garde l'utilisateur de la session plutôt que d'afficher une erreur.
Future<User?> _details(Future<User> request) async {
  try {
    return await request;
  } catch (_) {
    return null;
  }
}
