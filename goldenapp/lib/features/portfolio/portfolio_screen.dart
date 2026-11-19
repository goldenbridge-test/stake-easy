import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../app_theme.dart';
import '../../core/providers/providers.dart';
import '../../shared/utils/formatters.dart';
import '../../shared/widgets/widgets.dart';
import 'models/portfolio_data.dart';
import 'portfolio_providers.dart';
import 'widgets/position_card.dart';
import 'widgets/trade_tile.dart';

/// Portfolio : positions (ouvertes / clôturées) et historique des trades.
class PortfolioScreen extends ConsumerWidget {
  const PortfolioScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    Future<void> refresh() => refreshPortfolio(ref);
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Portfolio'),
          bottom: TabBar(
            indicatorColor: AppColors.gold,
            indicatorWeight: 3,
            labelColor: AppColors.white,
            unselectedLabelColor: Colors.white60,
            labelStyle: GoogleFonts.openSans(fontWeight: FontWeight.w700),
            tabs: const [
              Tab(text: 'Positions'),
              Tab(text: 'Historique'),
            ],
          ),
        ),
        body: AsyncValueView<PortfolioData>(
          value: ref.watch(portfolioProvider),
          onRetry: () {
            ref.invalidate(positionsProvider);
            ref.invalidate(tradesProvider);
          },
          loadingMessage: 'Chargement du portfolio…',
          builder: (context, data) => TabBarView(
            children: [
              _PositionsTab(data: data, onRefresh: refresh),
              _TradesTab(data: data, onRefresh: refresh),
            ],
          ),
        ),
      ),
    );
  }
}

enum _PositionFilter {
  open('En cours'),
  closed('Clôturées');

  const _PositionFilter(this.label);
  final String label;
}

class _PositionsTab extends StatefulWidget {
  const _PositionsTab({required this.data, required this.onRefresh});

  final PortfolioData data;
  final Future<void> Function() onRefresh;

  @override
  State<_PositionsTab> createState() => _PositionsTabState();
}

class _PositionsTabState extends State<_PositionsTab> {
  _PositionFilter _filter = _PositionFilter.open;

  @override
  Widget build(BuildContext context) {
    final open = widget.data.openPositions;
    final positions = _filter == _PositionFilter.open ? open : widget.data.closedPositions;
    final marketValue = open.fold<double>(0, (sum, p) => sum + p.marketValue);
    final invested = open.fold<double>(0, (sum, p) => sum + p.totalQuoteSpent);
    final pnl = widget.data.positions.fold<double>(0, (sum, p) => sum + p.totalPnl);

    return RefreshIndicator(
      onRefresh: widget.onRefresh,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          HeroBalanceCard(
            label: 'Valeur des positions ouvertes',
            value: formatUsd(marketValue),
            icon: Icons.pie_chart_rounded,
            footer: Row(
              children: [
                Expanded(child: HeroStat(label: 'Investi', value: formatUsd(invested))),
                Expanded(child: HeroStat(label: 'P&L total', value: formatSignedUsd(pnl))),
                Expanded(child: HeroStat(label: 'Positions', value: '${open.length}')),
              ],
            ),
          ),
          const SizedBox(height: 24),
          ChoicePills<_PositionFilter>(
            options: _PositionFilter.values,
            selected: _filter,
            labelOf: (f) => f.label,
            onSelected: (f) => setState(() => _filter = f),
          ),
          const SizedBox(height: 16),
          if (positions.isEmpty)
            EmptyView(
              icon: Icons.pie_chart_outline,
              message: _filter == _PositionFilter.open
                  ? 'Aucune position ouverte pour le moment.'
                  : 'Aucune position clôturée.',
            )
          else
            for (final p in positions) ...[
              PositionCard(position: p),
              const SizedBox(height: 12),
            ],
        ],
      ),
    );
  }
}

class _TradesTab extends StatelessWidget {
  const _TradesTab({required this.data, required this.onRefresh});

  final PortfolioData data;
  final Future<void> Function() onRefresh;

  @override
  Widget build(BuildContext context) {
    final trades = data.trades;
    final buys = trades.where((t) => t.isBuy).length;
    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          SectionHeader(
            title: 'Historique des trades',
            subtitle: '$buys achat${buys > 1 ? 's' : ''} · ${trades.length - buys} vente${trades.length - buys > 1 ? 's' : ''}',
          ),
          if (trades.isEmpty)
            const EmptyView(
              icon: Icons.receipt_long_outlined,
              message: 'Aucun trade exécuté pour le moment.',
            )
          else
            AppCard(
              padding: EdgeInsets.zero,
              child: Column(
                children: [
                  for (var i = 0; i < trades.length; i++) ...[
                    if (i > 0) const Divider(height: 1, indent: 16, endIndent: 16, color: AppColors.border),
                    TradeTile(trade: trades[i], symbol: data.symbolOf(trades[i])),
                  ],
                ],
              ),
            ),
        ],
      ),
    );
  }
}
