import 'package:flutter/material.dart';
import '../../app_theme.dart';

class WalletConnectionScreen extends StatefulWidget {
  const WalletConnectionScreen({super.key});

  @override
  State<WalletConnectionScreen> createState() => _WalletConnectionScreenState();
}

class _WalletConnectionScreenState extends State<WalletConnectionScreen> {
  /// Le backend n'expose pas encore d'authentification par signature de wallet
  /// (WalletConnect non branché) : on l'indique au lieu de simuler une connexion.
  void _handleWalletAuth(String walletName) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'La connexion avec $walletName n\'est pas encore disponible. '
          'Connectez-vous avec votre nom d\'utilisateur et votre mot de passe.',
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Connexion Wallet'),
        backgroundColor: Colors.transparent,
        foregroundColor: AppColors.primaryBlue,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Connectez votre wallet pour commencer',
              style: Theme.of(context).textTheme.displayMedium,
            ),
            const SizedBox(height: 12),
            Text(
              'Choisissez l\'une des méthodes sécurisées ci-dessous pour lier votre portefeuille à GoldenBridge.',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: Colors.grey[600]),
            ),
            const SizedBox(height: 40),
            _buildWalletButton(
              context,
              title: 'MetaMask',
              subtitle: 'Connectez-vous via l\'app MetaMask',
              icon: Icons.account_balance_wallet,
              color: const Color(0xFFF6851B),
            ),
            const SizedBox(height: 16),
            _buildWalletButton(
              context,
              title: 'WalletConnect',
              subtitle: 'Scannez un QR code pour vous connecter',
              icon: Icons.qr_code_scanner,
              color: const Color(0xFF3B99FC),
            ),
            const SizedBox(height: 16),
            _buildWalletButton(
              context,
              title: 'Trust Wallet',
              subtitle: 'Accès sécurisé pour utilisateurs Trust',
              icon: Icons.shield,
              color: const Color(0xFF3375BB),
            ),
            const SizedBox(height: 40),
            Center(
              child: Text(
                'En vous connectant, vous acceptez nos Conditions Générales d\'Utilisation',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWalletButton(
    BuildContext context, {
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
  }) {
    return InkWell(
      onTap: () => _handleWalletAuth(title),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey[200]!),
          borderRadius: BorderRadius.circular(16),
          color: AppColors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 32),
            ),
            const SizedBox(width: 20),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  Text(
                    subtitle,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.grey[500]),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: Colors.grey),
          ],
        ),
      ),
    );
  }
}
