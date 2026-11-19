import 'models/course.dart';

// Données factices du centre d'apprentissage. À remplacer par GET /api/courses/.

final List<Course> mockCourses = [
  Course(
    id: 1,
    title: 'Les fondamentaux de l\'investissement Web3',
    description: 'Comprendre la blockchain, les wallets et les critères pour évaluer un projet avant d\'investir.',
    instructor: 2,
    instructorName: 'GoldenBridge Academy',
    price: 0,
    createdAt: DateTime(2026, 9, 2),
  ),
  Course(
    id: 2,
    title: 'Staking et rendement en DeFi',
    description: 'Fonctionnement du staking, risques des protocoles et calcul du rendement réel.',
    instructor: 2,
    instructorName: 'GoldenBridge Academy',
    price: 49,
    createdAt: DateTime(2026, 9, 18),
  ),
  Course(
    id: 3,
    title: 'Trader avec les zones de support',
    description: 'Lire un graphique journalier, repérer les zones de support et dimensionner ses achats.',
    instructor: 5,
    instructorName: 'Dave M.',
    price: 79,
    createdAt: DateTime(2026, 10, 4),
  ),
  Course(
    id: 4,
    title: 'Sécuriser ses actifs numériques',
    description: 'Bonnes pratiques pour protéger ses clés, ses comptes d\'exchange et éviter les arnaques.',
    instructor: 2,
    instructorName: 'GoldenBridge Academy',
    price: 0,
    createdAt: DateTime(2026, 10, 27),
  ),
  Course(
    id: 5,
    title: 'Lire un backtest',
    description: 'CAGR, drawdown, ratio de Sharpe : interpréter les métriques avant de lancer une stratégie.',
    instructor: 5,
    instructorName: 'Dave M.',
    price: 29,
    createdAt: DateTime(2026, 11, 6),
  ),
];

/// Source unique de l'écran : à remplacer par l'appel API.
Future<List<Course>> loadMockCourses() async {
  await Future<void>.delayed(const Duration(milliseconds: 400));
  return mockCourses;
}
