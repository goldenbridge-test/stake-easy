import 'json_utils.dart';

/// Métriques de rendement annualisé (`calculate_cagr` côté backend).
class Cagr {
  const Cagr({
    this.performanceTotalePct = 0,
    this.moyenneAnnualiseePct = 0,
    this.cagrPct = 0,
  });

  final double performanceTotalePct;
  final double moyenneAnnualiseePct;
  final double cagrPct;

  factory Cagr.fromJson(Object? json) {
    final map = toMap(json);
    return Cagr(
      performanceTotalePct: toDouble(map['performance_totale_pct']),
      moyenneAnnualiseePct: toDouble(map['moyenne_annualisee_pct']),
      cagrPct: toDouble(map['cagr_pct']),
    );
  }
}
