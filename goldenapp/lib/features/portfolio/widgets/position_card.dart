import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../app_theme.dart';
import '../../../shared/utils/formatters.dart';
import '../../../shared/widgets/widgets.dart';
import '../models/position.dart';

Color positionStatusColor(PositionStatus status) => switch (status) {
      PositionStatus.open => AppColors.secondaryBlue,
      PositionStatus.sealed => AppColors.violet,
      PositionStatus.closed => AppColors.mutedText,
    };

/// Pastille ronde avec les initiales de l'actif.
class AssetAvatar extends StatelessWidget {
  const AssetAvatar({super.key, required this.asset, this.size = 44});

  final String asset;
  final double size;

  @override
  Widget build(BuildContext context) {
    final initials = asset.length > 3 ? asset.substring(0, 3) : asset;
    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: const BoxDecoration(
        gradient: AppColors.futuristicGradient,
        shape: BoxShape.circle,
      ),
      child: Text(
        initials,
        style: GoogleFonts.montserrat(
          color: AppColors.gold,
          fontWeight: FontWeight.bold,
          fontSize: size * 0.28,
        ),
      ),
    );
  }
}

/// Carte d'une position : actif, statut, valeur de marché et P&L.
class PositionCard extends StatelessWidget {
  const PositionCard({super.key, required this.position, this.compact = false, this.onTap});

  final Position position;
  final bool compact;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final p = position;
    return AppCard(
      padding: const EdgeInsets.all(16),
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              AssetAvatar(asset: p.baseAsset),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      p.symbol,
                      style: GoogleFonts.montserrat(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: AppColors.darkGrey,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${p.exchange.toUpperCase()} · ${p.buyCount} achat${p.buyCount > 1 ? 's' : ''}',
                      style: GoogleFonts.openSans(fontSize: 12, color: AppColors.mutedText),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  PnlText(p.totalPnl),
                  const SizedBox(height: 2),
                  PnlText(p.pnlPct, percent: true, fontSize: 12),
                ],
              ),
            ],
          ),
          if (!compact) ...[
            const SizedBox(height: 16),
            const Divider(height: 1, color: AppColors.border),
            const SizedBox(height: 12),
            Row(
              children: [
                _Metric(label: 'Prix d\'entrée', value: formatUsd(p.entryPrice)),
                _Metric(label: 'Prix actuel', value: formatUsd(p.currentPrice)),
                _Metric(label: 'Valeur', value: formatUsd(p.marketValue)),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                StatusBadge(label: p.status.label, color: positionStatusColor(p.status)),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Détenu : ${formatQuantity(p.remainingBase)} ${p.baseAsset}',
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.openSans(fontSize: 12, color: AppColors.mutedText),
                  ),
                ),
                Text(
                  formatDate(p.firstBuyAt ?? p.createdAt),
                  style: GoogleFonts.openSans(fontSize: 12, color: AppColors.mutedText),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class _Metric extends StatelessWidget {
  const _Metric({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: GoogleFonts.openSans(fontSize: 11, color: AppColors.mutedText)),
          const SizedBox(height: 2),
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.centerLeft,
            child: Text(
              value,
              style: GoogleFonts.openSans(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.darkGrey,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
