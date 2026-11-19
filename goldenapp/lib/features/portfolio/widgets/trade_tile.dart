import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../app_theme.dart';
import '../../../shared/utils/formatters.dart';
import '../../../core/models/trade.dart';

/// Ligne d'historique : sens (achat/vente), prix, montants, date.
class TradeTile extends StatelessWidget {
  const TradeTile({super.key, required this.trade, this.symbol});

  final Trade trade;

  /// Actif (`BTC/USDT`), absent de TradeSerializer : déduit de la position.
  final String? symbol;

  @override
  Widget build(BuildContext context) {
    final t = trade;
    final color = t.isBuy ? AppColors.success : AppColors.danger;
    final symbol = this.symbol;
    final base = symbol?.split('/').first ?? '';
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              t.isBuy ? Icons.south_west_rounded : Icons.north_east_rounded,
              color: color,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${t.sideLabel}${symbol != null ? ' · $symbol' : ''}',
                  style: GoogleFonts.openSans(
                    fontWeight: FontWeight.w700,
                    color: AppColors.darkGrey,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '${formatQuantity(t.amountBase)} $base à ${formatUsd(t.price)}',
                  style: GoogleFonts.openSans(fontSize: 12, color: AppColors.mutedText),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '${t.isBuy ? '-' : '+'}${formatUsd(t.amountQuote)}',
                style: GoogleFonts.openSans(fontWeight: FontWeight.w700, color: color),
              ),
              const SizedBox(height: 2),
              Text(
                formatDate(t.executedAt),
                style: GoogleFonts.openSans(fontSize: 12, color: AppColors.mutedText),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
