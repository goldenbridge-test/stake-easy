import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../app_theme.dart';
import '../../../core/models/chart_data.dart';
import '../../../core/providers/providers.dart';
import '../../../shared/utils/formatters.dart';
import '../../../shared/widgets/widgets.dart';

/// Carte « Marché » : sélecteur d'actif, cours de clôture et zones de support
/// (`/execution/chart-data/`, 365 jours).
class MarketChartCard extends ConsumerStatefulWidget {
  const MarketChartCard({
    super.key,
    this.symbols = const ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT'],
    this.days = 365,
  });

  final List<String> symbols;
  final int days;

  @override
  ConsumerState<MarketChartCard> createState() => _MarketChartCardState();
}

class _MarketChartCardState extends ConsumerState<MarketChartCard> {
  late String _symbol = widget.symbols.first;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ChoicePills<String>(
            options: widget.symbols,
            selected: _symbol,
            labelOf: (s) => s.split('/').first,
            onSelected: (s) => setState(() => _symbol = s),
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 300,
            child: Builder(
              builder: (context) {
                final query = (symbol: _symbol, days: widget.days);
                return AsyncValueView<ChartData>(
                  value: ref.watch(chartDataProvider(query)),
                  onRetry: () => ref.invalidate(chartDataProvider(query)),
                  isEmpty: (d) => d.candles.isEmpty,
                  emptyIcon: Icons.show_chart_rounded,
                  emptyMessage: 'Pas encore d\'historique pour cet actif.',
                  embedded: true,
                  builder: (context, data) => _ChartBody(data: data),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _ChartBody extends StatelessWidget {
  const _ChartBody({required this.data});

  final ChartData data;

  @override
  Widget build(BuildContext context) {
    final last = data.candles.last;
    final zones = data.activeZones;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    data.symbol,
                    style: GoogleFonts.openSans(fontSize: 12, color: AppColors.mutedText),
                  ),
                  FittedBox(
                    fit: BoxFit.scaleDown,
                    alignment: Alignment.centerLeft,
                    child: Text(
                      formatUsd(last.close),
                      style: GoogleFonts.montserrat(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: AppColors.darkGrey,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                PnlText(data.changePct, percent: true),
                Text(
                  'sur ${data.candles.length} jours',
                  style: GoogleFonts.openSans(fontSize: 11, color: AppColors.mutedText),
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 12),
        Expanded(
          child: LineAreaChart(
            height: double.infinity,
            values: [for (final c in data.candles) c.close],
            labels: [for (final c in data.candles) formatDate(c.date)],
            bands: [for (final z in zones) ChartBand(low: z.priceLow, high: z.priceHigh)],
            formatValue: (v) => formatAmount(v, '', decimals: v >= 100 ? 0 : 2).trim(),
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                color: AppColors.gold.withValues(alpha: 0.35),
                borderRadius: BorderRadius.circular(3),
              ),
            ),
            const SizedBox(width: 6),
            Expanded(
              child: Text(
                '${zones.length} zone${zones.length > 1 ? 's' : ''} de support active${zones.length > 1 ? 's' : ''}',
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.openSans(fontSize: 12, color: AppColors.mutedText),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
