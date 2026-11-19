import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../app_theme.dart';
import '../../shared/utils/formatters.dart';
import '../../shared/widgets/widgets.dart';
import '../staking/widgets/no_wallet_view.dart';
import 'models/rewards_overview.dart';
import 'rewards_providers.dart';

/// Rewards : solde GoldenToken, prochaine distribution, offre (lectures on-chain).
class RewardsScreen extends ConsumerWidget {
  const RewardsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Récompenses')),
      body: AsyncValueView<RewardsOverview>(
        value: ref.watch(rewardsOverviewProvider),
        onRetry: () => ref.invalidate(rewardsOverviewProvider),
        loadingMessage: 'Chargement des récompenses…',
        builder: (context, r) => !r.hasWallet
            ? const NoWalletView(message: 'Connectez votre wallet pour suivre vos GLD et vos distributions.')
            : RefreshIndicator(
              onRefresh: () => refreshQuietly(ref, rewardsOverviewProvider.future),
              child: ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  HeroBalanceCard(
                    label: 'Solde Golden Token',
                    value: formatAmount(r.goldenTokenBalance, r.tokenSymbol),
                    caption: r.history.isEmpty
                        ? '${shortenAddress(r.walletAddress!)} · ${r.networkName}'
                        : 'Total reçu en distributions : ${formatAmount(r.totalReceivedGld, r.tokenSymbol)}',
                    icon: Icons.workspace_premium_rounded,
                  ),
                  const SizedBox(height: 24),
                  StatGrid(
                    children: [
                      StatCard(
                        label: 'Prochaine distribution',
                        value: '≈ ${formatAmount(r.estimatedNextIssuance, r.tokenSymbol, decimals: 4)}',
                        icon: Icons.schedule_rounded,
                        accent: AppColors.gold,
                        caption: 'Selon votre valeur stakée',
                      ),
                      StatCard(
                        label: 'Offre restante',
                        value: _compact(r.remainingSupply),
                        icon: Icons.savings_outlined,
                        accent: AppColors.success,
                        caption: 'GLD encore distribuables',
                      ),
                      StatCard(
                        label: 'Offre en circulation',
                        value: _compact(r.circulatingSupply),
                        icon: Icons.donut_large_rounded,
                        accent: AppColors.secondaryBlue,
                        caption: 'sur ${_compact(r.maxSupply)} max',
                      ),
                      StatCard(
                        label: 'Votre part de l\'offre',
                        value: formatPercent(
                          r.circulatingSupply == 0 ? 0 : r.goldenTokenBalance / r.circulatingSupply * 100,
                          signed: false,
                        ),
                        icon: Icons.pie_chart_outline_rounded,
                        accent: AppColors.violet,
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  const _HowItWorks(),
                  const SizedBox(height: 28),
                  const SectionHeader(title: 'Historique'),
                  if (r.history.isEmpty)
                    const EmptyView(
                      icon: Icons.card_giftcard_outlined,
                      title: 'Historique bientôt disponible',
                      message: 'Les distributions reçues seront listées ici. Stakez des tokens pour recevoir des GLD.',
                    )
                  else
                    AppCard(
                      padding: EdgeInsets.zero,
                      child: Column(
                        children: [
                          for (var i = 0; i < r.history.length; i++) ...[
                            if (i > 0)
                              const Divider(height: 1, indent: 16, endIndent: 16, color: AppColors.border),
                            _RewardTile(event: r.history[i]),
                          ],
                        ],
                      ),
                    ),
                ],
              ),
            ),
      ),
    );
  }

  static String _compact(double value) {
    if (value >= 1e6) return formatAmount(value / 1e6, 'M', decimals: 1);
    if (value >= 1e3) return formatAmount(value / 1e3, 'k', decimals: 1);
    return formatAmount(value, '', decimals: 0).trim();
  }
}

class _HowItWorks extends StatelessWidget {
  const _HowItWorks();

  @override
  Widget build(BuildContext context) {
    const steps = [
      (Icons.lock_outline_rounded, 'Stakez des tokens autorisés depuis l\'onglet Staking.'),
      (Icons.workspace_premium_outlined, 'À chaque distribution, vous recevez des GLD au prorata de votre valeur stakée.'),
      (Icons.account_balance_outlined, 'Les retours des prêts financés sont partagés entre les stakers.'),
    ];
    return AppCard(
      color: AppColors.gold.withValues(alpha: 0.08),
      borderColor: AppColors.gold.withValues(alpha: 0.4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Comment ça marche',
            style: GoogleFonts.montserrat(
              fontWeight: FontWeight.bold,
              fontSize: 16,
              color: AppColors.primaryBlue,
            ),
          ),
          const SizedBox(height: 12),
          for (final (icon, text) in steps)
            Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(icon, size: 18, color: AppColors.primaryBlue),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      text,
                      style: GoogleFonts.openSans(fontSize: 13, color: AppColors.darkGrey, height: 1.4),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _RewardTile extends StatelessWidget {
  const _RewardTile({required this.event});

  final RewardEvent event;

  @override
  Widget build(BuildContext context) {
    final isIssuance = event.type == RewardType.issuance;
    final color = isIssuance ? AppColors.gold : AppColors.success;
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      leading: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(
          isIssuance ? Icons.workspace_premium_rounded : Icons.savings_rounded,
          color: isIssuance ? const Color(0xFFB45309) : AppColors.success,
          size: 20,
        ),
      ),
      title: Text(
        event.type.label,
        style: GoogleFonts.openSans(fontWeight: FontWeight.w700, color: AppColors.darkGrey),
      ),
      subtitle: Text(
        event.txHash == null
            ? formatDateTime(event.receivedAt)
            : '${formatDateTime(event.receivedAt)} · ${shortenAddress(event.txHash!)}',
        style: GoogleFonts.openSans(fontSize: 12, color: AppColors.mutedText),
      ),
      trailing: Text(
        '+${formatAmount(event.amount, event.symbol, decimals: 4)}',
        style: GoogleFonts.openSans(fontWeight: FontWeight.w700, color: AppColors.success),
      ),
    );
  }
}
