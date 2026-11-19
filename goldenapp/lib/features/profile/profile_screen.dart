import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../app_theme.dart';
import '../../shared/utils/formatters.dart';
import '../../shared/widgets/widgets.dart';
import '../auth/login_screen.dart';
import '../exchanges/exchanges_screen.dart';
import 'models/user_profile.dart';
import 'profile_mock_data.dart';

/// Profil : infos utilisateur, connexions exchange, paramètres, déconnexion.
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key, this.loader = loadMockProfile, this.onLogout});

  final DataLoader<ProfileData> loader;

  /// Déconnexion (effacer les jetons JWT…). Par défaut : retour à l'écran de connexion.
  final Future<void> Function()? onLogout;

  Future<void> _confirmLogout(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Se déconnecter ?'),
        content: const Text('Vous devrez vous reconnecter pour accéder à votre compte.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Annuler')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: AppColors.danger),
            child: const Text('Déconnexion'),
          ),
        ],
      ),
    );
    if (confirmed != true || !context.mounted) return;
    // TODO(intégration) : effacer les jetons access/refresh via le service d'auth.
    await onLogout?.call();
    if (!context.mounted) return;
    Navigator.of(context, rootNavigator: true).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (_) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Mon profil')),
      body: AsyncView<ProfileData>(
        load: loader,
        loadingMessage: 'Chargement du profil…',
        builder: (context, data, refresh) => RefreshIndicator(
          onRefresh: refresh,
          child: ListView(
            padding: const EdgeInsets.all(24),
            children: [
              _ProfileHeader(user: data.user),
              const SizedBox(height: 32),
              _Section(
                title: 'Compte',
                children: [
                  _InfoTile(icon: Icons.alternate_email_rounded, title: 'Nom d\'utilisateur', value: data.user.username),
                  _InfoTile(icon: Icons.email_outlined, title: 'Email', value: data.user.email),
                  _InfoTile(
                    icon: Icons.account_balance_wallet_outlined,
                    title: 'Wallet',
                    value: data.walletAddress == null ? 'Non connecté' : shortenAddress(data.walletAddress!),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              _Section(
                title: 'Connexions exchange',
                children: [
                  if (data.connections.isEmpty)
                    const _InfoTile(icon: Icons.link_off_rounded, title: 'Aucune connexion', value: '')
                  else
                    for (final c in data.connections)
                      _InfoTile(
                        icon: Icons.link_rounded,
                        title: c.displayName,
                        value: c.exchange.label,
                      ),
                  _InfoTile(
                    icon: Icons.settings_input_component_outlined,
                    title: 'Gérer les connexions',
                    value: '',
                    showChevron: true,
                    onTap: () async {
                      await Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const ExchangesScreen()),
                      );
                      await refresh();
                    },
                  ),
                ],
              ),
              const SizedBox(height: 24),
              const _Section(
                title: 'Paramètres',
                children: [
                  _InfoTile(icon: Icons.translate_rounded, title: 'Langue', value: 'Français'),
                  _InfoTile(icon: Icons.light_mode_outlined, title: 'Thème', value: 'Clair'),
                  _InfoTile(icon: Icons.help_outline_rounded, title: 'Aide et support', value: ''),
                ],
              ),
              const SizedBox(height: 32),
              ElevatedButton.icon(
                onPressed: () => _confirmLogout(context),
                icon: const Icon(Icons.logout_rounded),
                label: const Text('Déconnexion'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ProfileHeader extends StatelessWidget {
  const _ProfileHeader({required this.user});

  final UserProfile user;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(4),
          decoration: const BoxDecoration(color: AppColors.gold, shape: BoxShape.circle),
          child: Container(
            width: 100,
            height: 100,
            alignment: Alignment.center,
            decoration: const BoxDecoration(
              gradient: AppColors.futuristicGradient,
              shape: BoxShape.circle,
            ),
            child: Text(
              user.initials,
              style: GoogleFonts.montserrat(
                color: AppColors.white,
                fontSize: 34,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
        const SizedBox(height: 16),
        Text(
          user.fullName,
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.displayMedium,
        ),
        const SizedBox(height: 4),
        Text(
          '@${user.username}',
          style: GoogleFonts.openSans(color: AppColors.mutedText),
        ),
        if (user.isStaff) ...[
          const SizedBox(height: 8),
          const StatusBadge(
            label: 'Administrateur',
            color: AppColors.violet,
            icon: Icons.verified_user_outlined,
          ),
        ],
      ],
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({required this.title, required this.children});

  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 8),
          child: Text(
            title,
            style: GoogleFonts.montserrat(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.mutedText,
            ),
          ),
        ),
        AppCard(
          padding: EdgeInsets.zero,
          child: Column(
            children: [
              for (var i = 0; i < children.length; i++) ...[
                if (i > 0) const Divider(height: 1, indent: 56, color: AppColors.border),
                children[i],
              ],
            ],
          ),
        ),
      ],
    );
  }
}

class _InfoTile extends StatelessWidget {
  const _InfoTile({
    required this.icon,
    required this.title,
    required this.value,
    this.onTap,
    this.showChevron = false,
  });

  final IconData icon;
  final String title;
  final String value;
  final VoidCallback? onTap;
  final bool showChevron;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: onTap,
      leading: Icon(icon, color: AppColors.primaryBlue),
      title: Text(title, style: GoogleFonts.openSans(fontWeight: FontWeight.w600)),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (value.isNotEmpty)
            ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 160),
              child: Text(
                value,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.openSans(color: AppColors.mutedText, fontSize: 13),
              ),
            ),
          if (showChevron) ...[
            const SizedBox(width: 8),
            const Icon(Icons.chevron_right, size: 20, color: AppColors.mutedText),
          ],
        ],
      ),
    );
  }
}
