import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../app_theme.dart';
import '../../core/models/performance.dart';
import '../../shared/utils/formatters.dart';
import '../../shared/widgets/widgets.dart';
import '../backtest/backtest_screen.dart';
import '../exchanges/exchanges_screen.dart';
import '../learn/learn_screen.dart';
import '../portfolio/widgets/position_card.dart';
import 'dashboard_providers.dart';
import 'models/dashboard_data.dart';
import 'widgets/market_chart_card.dart';
import 'widgets/quick_actions.dart';

/// Tableau de bord : KPIs de performance, graphique de marché, aperçu des positions.
class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key, this.onOpenPortfolio});

  /// Bascule vers l'onglet Portfolio (fourni par MainNavigation).
  final VoidCallback? onOpenPortfolio;

  void _push(BuildContext context, Widget screen) {
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => screen));
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tableau de bord'),
        actions: [
          IconButton(
            tooltip: 'Notifications',
            icon: const Icon(Icons.notifications_none_rounded),
            onPressed: () {},
          ),
        ],
      ),
      body: AsyncValueView<DashboardData>(
        value: ref.watch(dashboardProvider),
        onRetry: () => invalidateDashboard(ref),
        loadingMessage: 'Chargement du tableau de bord…',
        builder: (context, data) => RefreshIndicator(
          onRefresh: () => refreshDashboard(ref),
          child: ListView(
            padding: const EdgeInsets.all(20),
            children: [
              if (data.performance case final perf?)
                _PerformanceHero(performance: perf)
              else
                AppCard(
                  child: EmptyView(
                    icon: Icons.auto_graph_rounded,
                    title: 'Aucune stratégie active',
                    message: 'Testez la stratégie sur l\'historique avant de la lancer.',
                    actionLabel: 'Lancer un backtest',
                    onAction: () => _push(context, const BacktestScreen()),
                  ),
                ),
              const SizedBox(height: 20),
              QuickActions(
                actions: [
                  QuickAction(
                    icon: Icons.query_stats_rounded,
                    label: 'Backtest',
                    onTap: () => _push(context, const BacktestScreen()),
                  ),
                  QuickAction(
                    icon: Icons.link_rounded,
                    label: 'Exchanges',
                    onTap: () => _push(context, const ExchangesScreen()),
                  ),
                  QuickAction(
                    icon: Icons.school_outlined,
                    label: 'Apprendre',
                    onTap: () => _push(context, const LearnPage()),
                  ),
                ],
              ),
              if (data.performance case final perf?) ...[
                const SizedBox(height: 28),
                const SectionHeader(title: 'Performance', subtitle: 'Toutes stratégies confondues'),
                _PerformanceGrid(performance: perf),
              ],
              const SizedBox(height: 28),
              const SectionHeader(title: 'Marché', subtitle: 'Clôtures journalières et zones de support'),
              const MarketChartCard(),
              const SizedBox(height: 28),
              SectionHeader(
                title: 'Positions ouvertes',
                actionLabel: onOpenPortfolio == null ? null : 'Voir tout',
                onAction: onOpenPortfolio,
              ),
              if (data.openPositions.isEmpty)
                const AppCard(
                  child: EmptyView(
                    icon: Icons.pie_chart_outline_rounded,
                    message: 'Aucune position ouverte pour le moment.',
                  ),
                )
              else
                for (final p in data.openPositions.take(3)) ...[
                  PositionCard(position: p, compact: true, onTap: onOpenPortfolio),
                  const SizedBox(height: 12),
                ],
            ],
          ),
        ),
      ),
    );
  }
}

class _PerformanceHero extends StatelessWidget {
  const _PerformanceHero({required this.performance});

  final Performance performance;

  @override
  Widget build(BuildContext context) {
    final p = performance;
    return HeroBalanceCard(
      label: 'Capital investi',
      value: formatUsd(p.totalInvested),
      icon: Icons.account_balance_wallet_outlined,
      footer: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              'P&L réalisé ${formatSignedUsd(p.realizedPnl)} (${formatPercent(p.realizedPnlPct)})',
              style: GoogleFonts.openSans(
                color: Colors.white,
                fontWeight: FontWeight.w600,
                fontSize: 13,
              ),
            ),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(child: HeroStat(label: 'Récupéré', value: formatUsd(p.totalRecoveredFromSells))),
              Expanded(child: HeroStat(label: 'Réussite', value: formatPercent(p.winRatePct, signed: false))),
              Expanded(child: HeroStat(label: 'Ouvertes', value: '${p.openPositions}')),
            ],
          ),
        ],
      ),
    );
  }
}

class _PerformanceGrid extends StatelessWidget {
  const _PerformanceGrid({required this.performance});

  final Performance performance;

  @override
  Widget build(BuildContext context) {
    final p = performance;
    return StatGrid(
      children: [
        StatCard(
          label: 'Ratio de Sharpe',
          value: p.sharpeRatio.toStringAsFixed(2).replaceAll('.', ','),
          icon: Icons.balance_rounded,
          accent: AppColors.violet,
          caption: 'Taux sans risque ${formatPercent(p.riskFreeRate * 100, signed: false)}',
        ),
        StatCard(
          label: 'Drawdown max',
          value: formatPercent(-p.maxDrawdownPct.abs()),
          valueColor: AppColors.danger,
          icon: Icons.trending_down_rounded,
          accent: AppColors.danger,
        ),
        StatCard(
          label: 'Trades',
          value: '${p.totalBuys} / ${p.totalSells}',
          icon: Icons.swap_vert_rounded,
          accent: AppColors.secondaryBlue,
          caption: 'Achats / ventes',
        ),
        StatCard(
          label: 'Positions',
          value: '${p.openPositions} / ${p.sealedPositions} / ${p.closedPositions}',
          icon: Icons.layers_outlined,
          accent: AppColors.gold,
          caption: 'Ouvertes / scellées / clôturées',
        ),
      ],
    );
  }
}
