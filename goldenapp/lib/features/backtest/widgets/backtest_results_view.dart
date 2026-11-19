import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../app_theme.dart';
import '../../../shared/utils/formatters.dart';
import '../../../shared/widgets/widgets.dart';
import '../../../core/models/backtest.dart';

/// Résultats d'un backtest terminé : P&L, CAGR, courbe de capital, métriques.
class BacktestResultsView extends StatelessWidget {
  const BacktestResultsView({super.key, required this.backtest});

  final Backtest backtest;

  @override
  Widget build(BuildContext context) {
    final r = backtest.results!;
    final labels = [
      for (final d in r.equityDates) formatDate(d),
    ];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        HeroBalanceCard(
          label: '${backtest.symbol} · capital final',
          value: formatUsd(r.finalCapital),
          caption: 'Depuis le ${formatDate(backtest.startDate)} · ${formatAmount(r.nbYears, 'ans', decimals: 1)}',
          icon: Icons.insights_rounded,
          footer: Row(
            children: [
              Expanded(child: HeroStat(label: 'P&L total', value: formatSignedUsd(r.totalPnl))),
              Expanded(child: HeroStat(label: 'Performance', value: formatPercent(r.cagr.performanceTotalePct))),
              Expanded(child: HeroStat(label: 'CAGR', value: formatPercent(r.cagr.cagrPct))),
            ],
          ),
        ),
        const SizedBox(height: 20),
        AppCard(
          padding: const EdgeInsets.fromLTRB(8, 20, 16, 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.only(left: 12, bottom: 12),
                child: Text(
                  'Courbe de capital',
                  style: GoogleFonts.montserrat(fontWeight: FontWeight.bold, color: AppColors.primaryBlue),
                ),
              ),
              LineAreaChart(
                values: r.equityCurve,
                labels: labels,
                baseline: backtest.capital,
                color: r.totalPnl >= 0 ? AppColors.secondaryBlue : AppColors.danger,
                formatValue: (v) => formatAmount(v, '\$', decimals: 0),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        StatGrid(
          children: [
            StatCard(
              label: 'Moyenne annualisée',
              value: formatPercent(r.cagr.moyenneAnnualiseePct),
              icon: Icons.calendar_month_outlined,
              accent: AppColors.secondaryBlue,
            ),
            StatCard(
              label: 'Taux de réussite',
              value: formatPercent(r.winRatePct, signed: false),
              icon: Icons.emoji_events_outlined,
              accent: AppColors.gold,
              caption: 'Sur ${r.winRateSampleSize} positions clôturées',
            ),
            StatCard(
              label: 'Drawdown max',
              value: formatPercent(-r.maxDrawdownPct.abs()),
              valueColor: AppColors.danger,
              icon: Icons.trending_down_rounded,
              accent: AppColors.danger,
            ),
            StatCard(
              label: 'Ratio de Sharpe',
              value: r.sharpeRatio.toStringAsFixed(2).replaceAll('.', ','),
              icon: Icons.balance_rounded,
              accent: AppColors.violet,
              caption: 'Taux sans risque ${formatPercent(r.riskFreeRate * 100, signed: false)}',
            ),
            StatCard(
              label: 'P&L réalisé',
              value: formatSignedUsd(r.realizedPnl),
              valueColor: r.realizedPnl >= 0 ? AppColors.success : AppColors.danger,
              icon: Icons.check_circle_outline,
              accent: AppColors.success,
            ),
            StatCard(
              label: 'P&L latent',
              value: formatSignedUsd(r.unrealizedPnl),
              valueColor: r.unrealizedPnl >= 0 ? AppColors.success : AppColors.danger,
              icon: Icons.hourglass_bottom_rounded,
              accent: AppColors.warning,
              caption: '${formatUsd(r.investedInOpen)} investis en cours',
            ),
            StatCard(
              label: 'Trades',
              value: '${r.totalBuys} / ${r.totalSells}',
              icon: Icons.swap_vert_rounded,
              caption: 'Achats / ventes',
            ),
            StatCard(
              label: 'Positions',
              value: '${r.openPositions} / ${r.closedPositions}',
              icon: Icons.layers_outlined,
              caption: 'Ouvertes / clôturées · ${r.candlesAnalyzed} bougies',
            ),
          ],
        ),
      ],
    );
  }
}
