import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:goldenapp/features/backtest/backtest_screen.dart';
import 'package:goldenapp/features/dashboard/dashboard_screen.dart';
import 'package:goldenapp/features/dashboard/models/dashboard_data.dart';
import 'package:goldenapp/features/exchanges/exchanges_screen.dart';
import 'package:goldenapp/features/learn/learn_screen.dart';
import 'package:goldenapp/features/portfolio/models/portfolio_data.dart';
import 'package:goldenapp/features/portfolio/portfolio_screen.dart';
import 'package:goldenapp/features/profile/profile_screen.dart';
import 'package:goldenapp/features/rewards/rewards_screen.dart';
import 'package:goldenapp/features/staking/models/staking_overview.dart';
import 'package:goldenapp/features/staking/staking_screen.dart';
import 'package:goldenapp/shared/widgets/widgets.dart';

import '../helpers.dart';

void main() {
  setUpAll(disableFontFetching);

  testWidgets('Tableau : KPIs, marché et positions', (tester) async {
    await pumpApp(tester, const DashboardScreen());
    await settle(tester);
    expect(find.text('Capital investi'), findsOneWidget);
    expect(find.text('Performance'), findsOneWidget);
    await tester.scrollUntilVisible(find.text('Positions ouvertes'), 300);
    expect(find.text('Positions ouvertes'), findsOneWidget);
  });

  testWidgets('Tableau sans stratégie : invite à lancer un backtest', (tester) async {
    await pumpApp(
      tester,
      DashboardScreen(
        loader: () async => const DashboardData(performance: null, positions: []),
      ),
    );
    await settle(tester);
    expect(find.text('Aucune stratégie active'), findsOneWidget);
  });

  testWidgets('Tableau en erreur : bouton Réessayer', (tester) async {
    await pumpApp(tester, DashboardScreen(loader: () async => throw Exception('500')));
    await settle(tester);
    expect(find.byType(ErrorView), findsOneWidget);
  });

  testWidgets('Portfolio : onglets positions et historique', (tester) async {
    await pumpApp(tester, const PortfolioScreen());
    await settle(tester);
    expect(find.text('BTC/USDT'), findsWidgets);
    await tester.tap(find.text('Historique'));
    await tester.pumpAndSettle();
    expect(find.text('Historique des trades'), findsOneWidget);
  });

  testWidgets('Portfolio vide', (tester) async {
    await pumpApp(
      tester,
      PortfolioScreen(loader: () async => const PortfolioData(positions: [], trades: [])),
    );
    await settle(tester);
    expect(find.text('Aucune position ouverte pour le moment.'), findsOneWidget);
  });

  testWidgets('Staking : validation du montant', (tester) async {
    await pumpApp(tester, const StakingScreen());
    await settle(tester);
    expect(find.text('Valeur totale stakée'), findsOneWidget);
    final button = find.text('Staker GLD');
    await tester.scrollUntilVisible(button, 300, scrollable: find.byType(Scrollable).first);
    await tester.ensureVisible(button);
    await tester.pumpAndSettle();
    await tester.tap(button);
    await tester.pumpAndSettle();
    expect(find.text('Saisissez un montant supérieur à 0'), findsOneWidget);
  });

  testWidgets('Staking sans wallet', (tester) async {
    await pumpApp(
      tester,
      StakingScreen(
        loader: () async => const StakingOverview(
          walletAddress: null,
          networkName: 'Sepolia',
          userTotalValue: 0,
          maxStakePerUser: 100000,
          tokens: [],
        ),
      ),
    );
    await settle(tester);
    expect(find.text('Aucun wallet connecté'), findsOneWidget);
  });

  testWidgets('Rewards : solde GLD et historique', (tester) async {
    await pumpApp(tester, const RewardsScreen());
    await settle(tester);
    expect(find.text('Solde Golden Token'), findsOneWidget);
  });

  testWidgets('Exchanges : liste et formulaire OKX avec passphrase', (tester) async {
    await pumpApp(tester, const ExchangesScreen());
    await settle(tester);
    expect(find.text('Compte principal'), findsOneWidget);
    await tester.tap(find.text('Ajouter'));
    await tester.pumpAndSettle();
    expect(find.text('Nouvelle connexion'), findsOneWidget);
    expect(find.text('Passphrase'), findsNothing);
    await tester.tap(find.text('OKX'));
    await tester.pumpAndSettle();
    expect(find.text('Passphrase'), findsOneWidget);
  });

  testWidgets('Backtest : lancement et résultats', (tester) async {
    await pumpApp(tester, const BacktestScreen());
    await settle(tester);
    expect(
      find.text('Lancez un backtest pour voir la performance, le CAGR et la courbe de capital.'),
      findsOneWidget,
    );
    await tester.tap(find.text('Lancer le backtest'));
    await settle(tester);
    expect(find.text('Courbe de capital'), findsOneWidget);
  });

  testWidgets('Learn : filtre des cours gratuits', (tester) async {
    await pumpApp(tester, const LearnPage());
    await settle(tester);
    await tester.tap(find.text('Gratuits'));
    await tester.pumpAndSettle();
    expect(find.text('Staking et rendement en DeFi'), findsNothing);
    expect(find.text('Les fondamentaux de l\'investissement Web3'), findsOneWidget);
  });

  testWidgets('Profil : infos et déconnexion', (tester) async {
    await pumpApp(tester, const ProfileScreen());
    await settle(tester);
    expect(find.text('Mouhsine Golden'), findsOneWidget);
    expect(find.text('@mouhsine'), findsOneWidget);
    await tester.scrollUntilVisible(find.text('Déconnexion'), 300);
    await tester.tap(find.text('Déconnexion'));
    await tester.pumpAndSettle();
    expect(find.text('Se déconnecter ?'), findsOneWidget);
  });

  testWidgets('Les écrans ne débordent pas sur petit écran', (tester) async {
    tester.view.physicalSize = const Size(720, 1280);
    tester.view.devicePixelRatio = 2;
    addTearDown(tester.view.reset);
    for (final screen in const <Widget>[
      DashboardScreen(),
      StakingScreen(),
      RewardsScreen(),
      PortfolioScreen(),
      ProfileScreen(),
    ]) {
      await tester.pumpWidget(MaterialApp(home: screen));
      await settle(tester);
      expect(tester.takeException(), isNull);
    }
  });
}
