import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:goldenapp/app_theme.dart';
import 'package:goldenapp/core/api/api_client.dart';
import 'package:goldenapp/core/api/token_storage.dart';
import 'package:goldenapp/core/providers/providers.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

/// Réponse d'une route du faux backend.
typedef FakeHandler = http.Response Function(http.Request request);

/// Backend Django simulé : routes `"MÉTHODE /chemin/"` (sans `/api`, sans
/// paramètres de requête) -> réponse JSON. Les requêtes reçues sont gardées
/// pour vérifier les corps envoyés.
class FakeBackend {
  FakeBackend({bool loggedIn = true})
    : storage = loggedIn
          ? MemoryTokenStorage(access: 'A', refresh: 'R')
          : MemoryTokenStorage() {
    on('GET', '/accounts/me/', fixtureUser);
  }

  final MemoryTokenStorage storage;
  final _routes = <String, FakeHandler>{};
  final requests = <http.Request>[];

  /// Enregistre une réponse JSON fixe.
  void on(String method, String path, Object? body, {int status = 200}) =>
      handle(method, path, (_) => jsonResponse(body, status));

  void handle(String method, String path, FakeHandler handler) =>
      _routes['$method $path'] = handler;

  /// Requêtes reçues pour [method] [path].
  List<http.Request> calls(String method, String path) => [
    for (final r in requests)
      if (r.method == method && _path(r) == path) r,
  ];

  static String _path(http.Request r) =>
      r.url.path.replaceFirst(RegExp(r'^/api'), '');

  late final MockClient client = MockClient((request) async {
    requests.add(request);
    final handler = _routes['${request.method} ${_path(request)}'];
    if (handler == null) return jsonResponse({'detail': 'Introuvable.'}, 404);
    return handler(request);
  });

  List<Override> get overrides => [
    tokenStorageProvider.overrideWithValue(storage),
    apiClientProvider.overrideWithValue(
      ApiClient(baseUrl: 'http://test/api', tokenStorage: storage, httpClient: client),
    ),
  ];
}

http.Response jsonResponse(Object? body, [int status = 200]) => http.Response(
  jsonEncode(body),
  status,
  headers: {'content-type': 'application/json; charset=utf-8'},
);

/// Monte [child] avec le faux backend, sur un écran de téléphone.
Future<void> pumpWithBackend(
  WidgetTester tester,
  Widget child,
  FakeBackend backend, {
  List<Override> overrides = const [],
}) async {
  tester.view.physicalSize = const Size(1080, 2400);
  tester.view.devicePixelRatio = 2.75;
  addTearDown(tester.view.reset);
  await tester.pumpWidget(
    ProviderScope(
      overrides: [...backend.overrides, ...overrides],
      child: MaterialApp(theme: AppTheme.lightTheme, home: child),
    ),
  );
}

// --- Données renvoyées par le backend (forme des serializers Django) --------

const fixtureUser = {
  'id': 7,
  'username': 'mouhsine',
  'email': 'mouhsine@example.com',
  'is_staff': false,
};

const fixtureProfile = {
  'id': 7,
  'username': 'mouhsine',
  'email': 'mouhsine@example.com',
  'first_name': 'Mouhsine',
  'last_name': 'Golden',
};

const fixturePositions = [
  {
    'id': 12,
    'strategy_config': 3,
    'symbol': 'BTC/USDT',
    'exchange': 'binance',
    'mode': 'test',
    'entry_zone': 41,
    'entry_price': '61250.0000000000',
    'total_amount_base': '0.0326000000',
    'total_quote_spent': '1996.7500000000',
    'buy_count': 3,
    'high_water_mark': '68420.0000000000',
    'is_sealed': false,
    'is_fully_closed': false,
    'first_buy_at': '2026-09-14T09:30:00Z',
    'created_at': '2026-09-14T09:30:00Z',
    'updated_at': '2026-11-18T09:30:00Z',
    'entry_zone_range': {'low': '60400', 'high': '62100'},
    'remaining_base': '0.0326',
    'current_price': '67180',
    'market_value': '2190.07',
    'realized_pnl': '0',
    'unrealized_pnl': '193.32',
    'total_pnl': '193.32',
    'pnl_pct': 9.68,
    'status': 'open',
  },
  {
    'id': 9,
    'strategy_config': 3,
    'symbol': 'ETH/USDT',
    'exchange': 'binance',
    'mode': 'test',
    'entry_price': '2400',
    'total_amount_base': '0.5',
    'total_quote_spent': '1200',
    'buy_count': 1,
    'high_water_mark': '2900',
    'is_sealed': true,
    'is_fully_closed': true,
    'created_at': '2026-06-01T09:30:00Z',
    'remaining_base': '0',
    'current_price': '2700',
    'market_value': '0',
    'realized_pnl': '150',
    'unrealized_pnl': '0',
    'total_pnl': '150',
    'pnl_pct': 12.5,
    'status': 'closed',
  },
];

const fixtureTrades = [
  {
    'id': 31,
    'strategy_config': 3,
    'position': 12,
    'zone': 41,
    'mode': 'test',
    'side': 'buy',
    'executed_at': '2026-09-14T09:30:00Z',
    'price': '61250',
    'amount_quote': '665.58',
    'amount_base': '0.0108',
  },
];

const fixturePerformance = {
  'strategy_config': 3,
  'total_invested': '3196.75',
  'total_recovered_from_sells': '1350',
  'realized_pnl': '150',
  'realized_pnl_pct': 4.69,
  'total_buys': 4,
  'total_sells': 1,
  'open_positions': 1,
  'closed_positions': 1,
  'sealed_positions': 0,
  'win_rate_pct': 100,
  'max_drawdown_pct': 12.4,
  'sharpe_ratio': 1.32,
  'risk_free_rate': 0.04,
};

Map<String, Object> fixtureChart(String symbol) => {
  'symbol': symbol,
  'candles': [
    for (var i = 0; i < 30; i++)
      {
        'date': DateTime.utc(2026, 10, 1).add(Duration(days: i)).toIso8601String().substring(0, 10),
        'open': 60000 + i * 100,
        'high': 60500 + i * 100,
        'low': 59500 + i * 100,
        'close': 60200 + i * 100,
      },
  ],
  'zones': [
    {
      'id': 41,
      'price_low': '60400',
      'price_high': '62100',
      'touch_count': 3,
      'is_active': true,
      'is_validated': true,
      'zone_type': 'support',
    },
  ],
  'candles_count': 30,
  'zones_count': 1,
};

const fixtureConnections = [
  {'id': 4, 'exchange': 'binance', 'label': 'Compte principal', 'api_key_masked': 'vX9k...3fQa'},
  {'id': 2, 'exchange': 'bybit', 'label': '', 'api_key_masked': 'Bt72...m0Pz'},
];

const fixtureCourses = [
  {
    'id': 1,
    'title': 'Les fondamentaux de l\'investissement Web3',
    'description': 'Blockchain, wallets et premiers pas.',
    'instructor': 2,
    'price': '0.00',
    'created_at': '2026-03-01T10:00:00Z',
  },
  {
    'id': 2,
    'title': 'Staking et rendement en DeFi',
    'description': 'Comprendre les rendements du staking.',
    'instructor': 2,
    'price': '49.00',
    'created_at': '2026-04-01T10:00:00Z',
  },
];

Map<String, Object?> fixtureBacktest({required int id, required String status}) => {
  'id': id,
  'exchange': 'binance',
  'symbol': 'BTC/USDT',
  'capital': '1000.00',
  'start_date': '2020-01-01',
  'discount_pct': '75.00',
  'status': status,
  'error': '',
  'created_at': '2026-11-19T10:00:00Z',
  'completed_at': status == 'completed' ? '2026-11-19T10:01:00Z' : null,
  'results': status != 'completed'
      ? null
      : {
          'candles_analyzed': 2150,
          'total_buys': 12,
          'total_sells': 6,
          'realized_pnl': 640.5,
          'realized_pnl_pct': 64.05,
          'unrealized_pnl': 120.2,
          'unrealized_pnl_pct': 12.02,
          'total_pnl': 760.7,
          'total_pnl_pct': 76.07,
          'open_positions': 2,
          'closed_positions': 6,
          'invested_in_open': 400,
          'win_rate_pct': 83.3,
          'win_rate_sample_size': 6,
          'max_drawdown_pct': 21.4,
          'sharpe_ratio': 1.1,
          'equity_curve': [1000, 1100, 1350, 1760.7],
          'equity_dates': ['2020-01-01', '2021-01-01', '2023-01-01', '2026-11-01'],
          'cagr': {'performance_totale_pct': 76.07, 'moyenne_annualisee_pct': 11.2, 'cagr_pct': 8.6},
          'nb_years': 6.8,
          'final_capital': 1760.7,
          'risk_free_rate': 0.04,
        },
};

/// Backend d'un utilisateur avec positions, trades, performance et graphique.
FakeBackend fullBackend() {
  final backend = FakeBackend();
  backend
    ..on('GET', '/accounts/profile/me/', fixtureProfile)
    ..on('GET', '/execution/positions/', fixturePositions)
    ..on('GET', '/execution/trades/', fixtureTrades)
    ..on('GET', '/execution/performance/', fixturePerformance)
    ..on('GET', '/execution/backtests/', const [])
    ..on('GET', '/exchanges/connections/', fixtureConnections)
    ..on('GET', '/courses/', fixtureCourses)
    ..handle(
      'GET',
      '/execution/chart-data/',
      (r) => jsonResponse(fixtureChart(r.url.queryParameters['symbol'] ?? 'BTC/USDT')),
    );
  return backend;
}
