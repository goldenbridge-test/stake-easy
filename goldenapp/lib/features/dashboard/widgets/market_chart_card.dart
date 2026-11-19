import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../app_theme.dart';
import '../../../shared/utils/formatters.dart';
import '../../../shared/widgets/widgets.dart';
import '../models/chart_data.dart';

/// Carte « Marché » : sélecteur d'actif, cours de clôture et zones de support.
class MarketChartCard extends StatefulWidget {
  const MarketChartCard({
    super.key,
    required this.loader,
    this.symbols = const ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT'],
  });

  final Future<ChartData> Function(String symbol) loader;
  final List<String> symbols;

  @override
  State<MarketChartCard> createState() => _MarketChartCardState();
}

class _MarketChartCardState extends State<MarketChartCard> {
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
            child: AsyncView<ChartData>(
              key: ValueKey(_symbol),
              load: () => widget.loader(_symbol),
              isEmpty: (d) => d.candles.isEmpty,
              emptyIcon: Icons.show_chart_rounded,
              emptyMessage: 'Pas encore d\'historique pour cet actif.',
              embedded: true,
              builder: (context, data, _) => _ChartBody(data: data),
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
            Text(
              '${zones.length} zone${zones.length > 1 ? 's' : ''} de support active${zones.length > 1 ? 's' : ''}',
              style: GoogleFonts.openSans(fontSize: 12, color: AppColors.mutedText),
            ),
          ],
        ),
      ],
    );
  }
}
