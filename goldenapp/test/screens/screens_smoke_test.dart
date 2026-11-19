import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:goldenapp/core/providers/providers.dart';
import 'package:goldenapp/features/backtest/backtest_screen.dart';
import 'package:goldenapp/features/dashboard/dashboard_screen.dart';
import 'package:goldenapp/features/exchanges/exchanges_screen.dart';
import 'package:goldenapp/features/learn/learn_screen.dart';
import 'package:goldenapp/features/portfolio/portfolio_screen.dart';
import 'package:goldenapp/features/profile/profile_screen.dart';
import 'package:goldenapp/features/rewards/models/rewards_overview.dart';
import 'package:goldenapp/features/rewards/rewards_providers.dart';
import 'package:goldenapp/features/rewards/rewards_screen.dart';
import 'package:goldenapp/features/staking/models/staking_overview.dart';
import 'package:goldenapp/features/staking/staking_providers.dart';
import 'package:goldenapp/features/staking/staking_screen.dart';
import 'package:goldenapp/shared/widgets/widgets.dart';

import '../fake_backend.dart';
import '../helpers.dart';

const _wallet = '0x8f3A21cD94b7E0a5C61fD0B2e4A9c7D13e5B9a42';

const _stakingOverview = StakingOverview(
  walletAddress: _wallet,
  networkName: 'sepolia',
  userTotalValue: 1250,
  tokens: [
    AllowedToken(
      address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      walletBalance: 2450,
      stakingBalance: 1250,
      stakedValue: 1250,
      maxStake: 100000,
    ),
  ],
);

const _rewardsOverview = RewardsOverview(
  walletAddress: _wallet,
  networkName: 'sepolia',
  goldenTokenBalance: 1284.52,
  circulatingSupply: 10450000,
  maxSupply: 100000000,
  estimatedNextIssuance: 1.84,
);

/// Lectures on-chain remplacées par des valeurs fixes (pas de RPC en test).
List<Override> _onChain() => [
  stakingOverviewProvider.overrideWith((ref) async => _stakingOverview),
  rewardsOverviewProvider.overrideWith((ref) async => _rewardsOverview),
];

void main() {
  setUpAll(disableFontFetching);

  testWidgets('Tableau : KPIs, marché et positions de l\'API', (tester) async {
    final backend = fullBackend();
    await pumpWithBackend(tester, const DashboardScreen(), backend);
    await settle(tester);
    expect(find.text('Capital investi'), findsOneWidget);
    expect(find.text('Performance'), findsOneWidget);
    expect(backend.calls('GET', '/execution/chart-data/').single.url.queryParameters, {
      'symbol': 'BTC/USDT',
      'days': '365',
    });
    await tester.scrollUntilVisible(find.text('Positions ouvertes'), 300);
    expect(find.text('BTC/USDT'), findsWidgets);
    // La position clôturée n'apparaît pas dans l'aperçu.
    expect(find.text('ETH/USDT'), findsNothing);
  });

  testWidgets('Tableau sans stratégie (404) : invite à lancer un backtest', (tester) async {
    final backend = fullBackend()
      ..on('GET', '/execution/performance/', {'detail': 'Aucune stratégie trouvée.'}, status: 404);
    await pumpWithBackend(tester, const DashboardScreen(), backend);
    await settle(tester);
    expect(find.text('Aucune stratégie active'), findsOneWidget);
  });

  testWidgets('Tableau en erreur : Réessayer relance les requêtes', (tester) async {
    final backend = fullBackend()
      ..on('GET', '/execution/performance/', {'detail': 'Erreur interne.'}, status: 500);
    await pumpWithBackend(tester, const DashboardScreen(), backend);
    await settle(tester);
    expect(find.byType(ErrorView), findsOneWidget);
    expect(find.text('Erreur interne.'), findsOneWidget);

    backend.on('GET', '/execution/performance/', fixturePerformance);
    await tester.tap(find.text('Réessayer'));
    await settle(tester);
    expect(find.text('Capital investi'), findsOneWidget);
  });

  testWidgets('Portfolio : positions et historique avec l\'actif du trade', (tester) async {
    await pumpWithBackend(tester, const PortfolioScreen(), fullBackend());
    await settle(tester);
    expect(find.text('BTC/USDT'), findsWidgets);
    await tester.tap(find.text('Clôturées'));
    await tester.pumpAndSettle();
    expect(find.text('ETH/USDT'), findsOneWidget);
    await tester.tap(find.text('Historique'));
    await tester.pumpAndSettle();
    expect(find.text('Historique des trades'), findsOneWidget);
    expect(find.text('Achat · BTC/USDT'), findsOneWidget);
  });

  testWidgets('Portfolio vide', (tester) async {
    final backend = fullBackend()
      ..on('GET', '/execution/positions/', const [])
      ..on('GET', '/execution/trades/', const []);
    await pumpWithBackend(tester, const PortfolioScreen(), backend);
    await settle(tester);
    expect(find.text('Aucune position ouverte pour le moment.'), findsOneWidget);
  });

  testWidgets('Staking : validation, puis signature exigée sans wallet', (tester) async {
    await pumpWithBackend(tester, const StakingScreen(), FakeBackend(), overrides: _onChain());
    await settle(tester);
    expect(find.text('Valeur totale stakée'), findsOneWidget);
    final button = find.text('Staker USDC');
    await tester.scrollUntilVisible(button, 300, scrollable: find.byType(Scrollable).first);
    await tester.ensureVisible(button);
    await tester.pumpAndSettle();
    await tester.tap(button);
    await tester.pumpAndSettle();
    expect(find.text('Saisissez un montant supérieur à 0'), findsOneWidget);

    await tester.enterText(find.widgetWithText(TextFormField, 'Montant'), '10');
    await tester.tap(button);
    await tester.pump();
    expect(find.textContaining('Connectez votre wallet pour signer'), findsOneWidget);
  });

  testWidgets('Staking sans wallet : consultation d\'une adresse', (tester) async {
    await pumpWithBackend(tester, const StakingScreen(), FakeBackend());
    await settle(tester);
    expect(find.text('Aucun wallet connecté'), findsOneWidget);
    await tester.tap(find.text('Consulter une adresse'));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextFormField), '0x123');
    await tester.tap(find.text('Consulter'));
    await tester.pumpAndSettle();
    expect(find.textContaining('Adresse invalide'), findsOneWidget);

    final container = ProviderScope.containerOf(tester.element(find.byType(StakingScreen)));
    await tester.enterText(find.byType(TextFormField), _wallet);
    await tester.tap(find.text('Consulter'));
    await tester.pump();
    expect(container.read(walletAddressProvider), _wallet);
  });

  testWidgets('Rewards : solde GLD et offre', (tester) async {
    await pumpWithBackend(tester, const RewardsScreen(), FakeBackend(), overrides: _onChain());
    await settle(tester);
    expect(find.text('Solde Golden Token'), findsOneWidget);
    expect(find.text('Offre restante'), findsOneWidget);
  });

  testWidgets('Exchanges : liste, création (POST) et passphrase OKX', (tester) async {
    final backend = fullBackend()
      ..on('POST', '/exchanges/connections/', {
        'id': 8,
        'exchange': 'okx',
        'label': '',
        'api_key_masked': 'okx1...abcd',
      }, status: 201);
    await pumpWithBackend(tester, const ExchangesScreen(), backend);
    await settle(tester);
    expect(find.text('Compte principal'), findsOneWidget);
    await tester.tap(find.text('Ajouter'));
    await tester.pumpAndSettle();
    expect(find.text('Nouvelle connexion'), findsOneWidget);
    expect(find.text('Passphrase'), findsNothing);
    await tester.tap(find.text('OKX'));
    await tester.pumpAndSettle();
    await tester.enterText(find.widgetWithText(TextFormField, 'Clé API'), 'okx1-key-abcd');
    await tester.enterText(find.widgetWithText(TextFormField, 'Secret API'), 'secret');
    await tester.enterText(find.widgetWithText(TextFormField, 'Passphrase'), 'phrase');
    await tester.ensureVisible(find.text('Tester et enregistrer'));
    await tester.tap(find.text('Tester et enregistrer'));
    await settle(tester);

    expect(jsonDecode(backend.calls('POST', '/exchanges/connections/').single.body), {
      'exchange': 'okx',
      'label': '',
      'api_key': 'okx1-key-abcd',
      'api_secret': 'secret',
      'api_passphrase': 'phrase',
    });
    expect(find.text('Connexion ajoutée'), findsOneWidget);
    expect(backend.calls('GET', '/exchanges/connections/'), hasLength(2));
  });

  testWidgets('Exchanges : clés refusées, message du serveur', (tester) async {
    final backend = fullBackend()
      ..on('POST', '/exchanges/connections/', {
        'non_field_errors': ['Clés invalides : authentification refusée par binance.'],
      }, status: 400);
    await pumpWithBackend(tester, const ExchangesScreen(), backend);
    await settle(tester);
    await tester.tap(find.text('Ajouter'));
    await tester.pumpAndSettle();
    await tester.enterText(find.widgetWithText(TextFormField, 'Clé API'), 'key');
    await tester.enterText(find.widgetWithText(TextFormField, 'Secret API'), 'secret');
    await tester.ensureVisible(find.text('Tester et enregistrer'));
    await tester.tap(find.text('Tester et enregistrer'));
    await settle(tester);
    expect(find.textContaining('authentification refusée'), findsOneWidget);
  });

  testWidgets('Backtest : création puis interrogation jusqu\'au résultat', (tester) async {
    var polls = 0;
    final backend = fullBackend()
      ..on('POST', '/execution/backtests/', fixtureBacktest(id: 5, status: 'pending'), status: 201)
      ..handle('GET', '/execution/backtests/5/', (_) {
        polls++;
        return jsonResponse(fixtureBacktest(id: 5, status: polls < 2 ? 'running' : 'completed'));
      });
    await pumpWithBackend(
      tester,
      const BacktestScreen(pollInterval: Duration(milliseconds: 10)),
      backend,
    );
    await settle(tester);
    expect(
      find.text('Lancez un backtest pour voir la performance, le CAGR et la courbe de capital.'),
      findsOneWidget,
    );
    await tester.tap(find.text('Lancer le backtest'));
    await settle(tester);

    final body = jsonDecode(backend.calls('POST', '/execution/backtests/').single.body) as Map;
    expect(body['symbol'], 'BTC/USDT');
    expect(body['start_date'], '2020-01-01');
    expect(polls, 2);
    expect(find.text('Courbe de capital'), findsOneWidget);
  });

  testWidgets('Learn : cours de l\'API et filtre des gratuits', (tester) async {
    await pumpWithBackend(tester, const LearnPage(), fullBackend());
    await settle(tester);
    await tester.tap(find.text('Gratuits'));
    await tester.pumpAndSettle();
    expect(find.text('Staking et rendement en DeFi'), findsNothing);
    expect(find.text('Les fondamentaux de l\'investissement Web3'), findsOneWidget);
  });

  testWidgets('Profil : nom complet et déconnexion qui efface les jetons', (tester) async {
    final backend = fullBackend();
    await pumpWithBackend(tester, const ProfileScreen(), backend);
    await settle(tester);
    expect(find.text('Mouhsine Golden'), findsOneWidget);
    expect(find.text('@mouhsine'), findsOneWidget);
    await tester.scrollUntilVisible(find.text('Déconnexion'), 300);
    await tester.tap(find.text('Déconnexion'));
    await tester.pumpAndSettle();
    expect(find.text('Se déconnecter ?'), findsOneWidget);
    await tester.tap(find.widgetWithText(TextButton, 'Déconnexion'));
    await settle(tester);
    expect(await backend.storage.access(), isNull);
  });

  testWidgets('Les écrans ne débordent pas sur petit écran', (tester) async {
    for (final screen in const <Widget>[
      DashboardScreen(),
      StakingScreen(),
      RewardsScreen(),
      PortfolioScreen(),
      ProfileScreen(),
    ]) {
      await pumpWithBackend(tester, screen, fullBackend(), overrides: _onChain());
      tester.view.physicalSize = const Size(720, 1280);
      tester.view.devicePixelRatio = 2;
      await settle(tester);
      expect(tester.takeException(), isNull);
    }
  });
}
