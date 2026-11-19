import 'dart:math' as math;

import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../app_theme.dart';

/// Bande horizontale à surligner (zone de support, fourchette…).
class ChartBand {
  const ChartBand({required this.low, required this.high, this.color = AppColors.gold});

  final double low;
  final double high;
  final Color color;
}

/// Courbe à aire dégradée (prix de clôture, courbe de capital…).
///
/// [labels] sert aux étiquettes de l'axe X et à l'infobulle ;
/// [formatValue] formate l'axe Y et l'infobulle.
class LineAreaChart extends StatelessWidget {
  const LineAreaChart({
    super.key,
    required this.values,
    required this.labels,
    required this.formatValue,
    this.bands = const [],
    this.color = AppColors.secondaryBlue,
    this.height = 220,
    this.baseline,
  });

  final List<double> values;
  final List<String> labels;
  final String Function(double value) formatValue;
  final List<ChartBand> bands;
  final Color color;
  final double height;

  /// Ligne de référence horizontale (ex. capital initial).
  final double? baseline;

  @override
  Widget build(BuildContext context) {
    if (values.length < 2) {
      return SizedBox(
        height: height,
        child: Center(
          child: Text(
            'Pas assez de données pour tracer la courbe.',
            style: GoogleFonts.openSans(color: AppColors.mutedText),
          ),
        ),
      );
    }

    var minY = values.reduce(math.min);
    var maxY = values.reduce(math.max);
    if (baseline != null) {
      minY = math.min(minY, baseline!);
      maxY = math.max(maxY, baseline!);
    }
    final pad = (maxY - minY).abs() * 0.08 + (maxY == minY ? 1 : 0);
    minY -= pad;
    maxY += pad;
    final step = math.max(1.0, (values.length / 4).ceilToDouble());

    final axisStyle = GoogleFonts.openSans(fontSize: 10, color: AppColors.mutedText);

    return SizedBox(
      height: height,
      child: LineChart(
        LineChartData(
          minY: minY,
          maxY: maxY,
          minX: 0,
          maxX: (values.length - 1).toDouble(),
          gridData: FlGridData(
            show: true,
            drawVerticalLine: false,
            horizontalInterval: (maxY - minY) / 4,
            getDrawingHorizontalLine: (_) => const FlLine(
              color: AppColors.border,
              strokeWidth: 1,
              dashArray: [4, 4],
            ),
          ),
          borderData: FlBorderData(show: false),
          rangeAnnotations: RangeAnnotations(
            horizontalRangeAnnotations: [
              for (final b in bands)
                if (b.high >= minY && b.low <= maxY)
                  HorizontalRangeAnnotation(
                    y1: math.max(b.low, minY),
                    y2: math.min(b.high, maxY),
                    color: b.color.withValues(alpha: 0.18),
                  ),
            ],
          ),
          extraLinesData: ExtraLinesData(
            horizontalLines: [
              if (baseline != null)
                HorizontalLine(
                  y: baseline!,
                  color: AppColors.mutedText.withValues(alpha: 0.6),
                  strokeWidth: 1,
                  dashArray: [6, 4],
                ),
            ],
          ),
          titlesData: FlTitlesData(
            topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            leftTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                reservedSize: 56,
                interval: (maxY - minY) / 4,
                getTitlesWidget: (value, meta) {
                  if (value == meta.min || value == meta.max) return const SizedBox();
                  return Padding(
                    padding: const EdgeInsets.only(right: 6),
                    child: Text(
                      formatValue(value),
                      style: axisStyle,
                      textAlign: TextAlign.right,
                      maxLines: 1,
                    ),
                  );
                },
              ),
            ),
            bottomTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                reservedSize: 24,
                interval: step,
                getTitlesWidget: (value, meta) {
                  final i = value.round();
                  if (i < 0 || i >= labels.length || value != i.toDouble()) {
                    return const SizedBox();
                  }
                  return Padding(
                    padding: const EdgeInsets.only(top: 6),
                    child: Text(labels[i], style: axisStyle),
                  );
                },
              ),
            ),
          ),
          lineTouchData: LineTouchData(
            touchTooltipData: LineTouchTooltipData(
              getTooltipColor: (_) => AppColors.darkGrey,
              tooltipRoundedRadius: 10,
              fitInsideHorizontally: true,
              fitInsideVertically: true,
              getTooltipItems: (spots) => [
                for (final s in spots)
                  LineTooltipItem(
                    '${formatValue(s.y)}\n',
                    GoogleFonts.openSans(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                      fontSize: 12,
                    ),
                    children: [
                      TextSpan(
                        text: s.spotIndex < labels.length ? labels[s.spotIndex] : '',
                        style: GoogleFonts.openSans(color: Colors.white70, fontSize: 11),
                      ),
                    ],
                  ),
              ],
            ),
          ),
          lineBarsData: [
            LineChartBarData(
              spots: [
                for (var i = 0; i < values.length; i++) FlSpot(i.toDouble(), values[i]),
              ],
              isCurved: true,
              curveSmoothness: 0.2,
              preventCurveOverShooting: true,
              color: color,
              barWidth: 2.5,
              isStrokeCapRound: true,
              dotData: const FlDotData(show: false),
              belowBarData: BarAreaData(
                show: true,
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [color.withValues(alpha: 0.28), color.withValues(alpha: 0.0)],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
