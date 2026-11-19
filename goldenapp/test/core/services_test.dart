import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:goldenapp/core/api/api_client.dart';
import 'package:goldenapp/core/api/api_exception.dart';
import 'package:goldenapp/core/api/token_storage.dart';
import 'package:goldenapp/core/services/auth_service.dart';
import 'package:goldenapp/core/services/exchange_service.dart';
import 'package:goldenapp/core/services/execution_service.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

http.Response json(Object body, [int status = 200]) => http.Response(
  jsonEncode(body),
  status,
  headers: {'content-type': 'application/json'},
);

ApiClient client(
  TokenStorage storage,
  Future<http.Response> Function(http.Request) handler,
) => ApiClient(
  baseUrl: 'http://test/api',
  tokenStorage: storage,
  httpClient: MockClient(handler),
);

void main() {
  group('AuthService', () {
    test('login stocke les jetons puis charge /accounts/me/', () async {
      final storage = MemoryTokenStorage();
      final auth = AuthService(
        client: client(storage, (req) async {
          if (req.url.path == '/api/accounts/login/') {
            expect(jsonDecode(req.body), {
              'username': 'alice',
              'password': 'secret',
            });
            return json({'access': 'A', 'refresh': 'R'});
          }
          expect(req.url.path, '/api/accounts/me/');
          expect(req.headers['Authorization'], 'Bearer A');
          return json({
            'id': 1,
            'username': 'alice',
            'email': 'a@b.fr',
            'is_staff': false,
          });
        }),
      );

      final user = await auth.login('alice', 'secret');
      expect(user.username, 'alice');
      expect(await storage.access(), 'A');
      expect(await storage.refresh(), 'R');
      expect(await auth.isLoggedIn(), isTrue);

      await auth.logout();
      expect(await auth.isLoggedIn(), isFalse);
    });

    test('identifiants refusés : message en français', () async {
      final auth = AuthService(
        client: client(
          MemoryTokenStorage(),
          (_) async => json({
            'detail': 'No active account found with the given credentials',
          }, 401),
        ),
      );
      await expectLater(
        auth.login('alice', 'mauvais'),
        throwsA(
          isA<ApiException>().having(
            (e) => e.message,
            'message',
            "Nom d'utilisateur ou mot de passe incorrect.",
          ),
        ),
      );
    });

    test('register envoie les champs du RegisterSerializer', () async {
      final paths = <String>[];
      final auth = AuthService(
        client: client(MemoryTokenStorage(), (req) async {
          paths.add(req.url.path);
          if (req.url.path == '/api/accounts/register/') {
            expect(jsonDecode(req.body), {
              'username': 'bob',
              'email': 'bob@b.fr',
              'password': 'pw',
              'first_name': 'Bob',
              'last_name': 'Durand',
            });
            return json({'id': 2, 'username': 'bob'}, 201);
          }
          if (req.url.path == '/api/accounts/login/') {
            return json({'access': 'A', 'refresh': 'R'});
          }
          return json({'id': 2, 'username': 'bob', 'email': 'bob@b.fr'});
        }),
      );
      final user = await auth.register(
        username: 'bob',
        email: 'bob@b.fr',
        password: 'pw',
        firstName: 'Bob',
        lastName: 'Durand',
      );
      expect(user.id, 2);
      expect(paths, [
        '/api/accounts/register/',
        '/api/accounts/login/',
        '/api/accounts/me/',
      ]);
    });

    test('profile lit prénom et nom via /accounts/profile/me/', () async {
      final auth = AuthService(
        client: client(MemoryTokenStorage(access: 'A'), (req) async {
          expect(req.method, 'GET');
          expect(req.url.path, '/api/accounts/profile/me/');
          return json({
            'id': 2,
            'username': 'bob',
            'email': 'bob@b.fr',
            'first_name': 'Bob',
            'last_name': 'Durand',
          });
        }),
      );
      final user = await auth.profile();
      expect(user.displayName, 'Bob Durand');
    });
  });

  group('ExecutionService', () {
    test('routes avec slash final et paramètres', () async {
      final urls = <String>[];
      final service = ExecutionService(
        client(MemoryTokenStorage(access: 'A'), (req) async {
          urls.add(req.url.toString());
          if (req.url.path.endsWith('/chart-data/')) {
            return json({'symbol': 'BTC/USDT', 'candles': [], 'zones': []});
          }
          if (req.url.path.endsWith('/portfolio-simulation/')) {
            return json({
              'status': 'completed',
              'progress': '2/2',
              'portfolio_summary': {},
              'rankings': [],
            });
          }
          return json([]);
        }),
      );

      await service.positions();
      await service.trades();
      await service.chartData('BTC/USDT', days: 90);
      await service.portfolioSimulation([5, 6]);

      expect(urls, [
        'http://test/api/execution/positions/',
        'http://test/api/execution/trades/',
        'http://test/api/execution/chart-data/?symbol=BTC%2FUSDT&days=90',
        'http://test/api/execution/portfolio-simulation/?ids=5&ids=6',
      ]);
    });

    test('performance : null si aucune stratégie (404)', () async {
      final service = ExecutionService(
        client(
          MemoryTokenStorage(access: 'A'),
          (_) async => json({'detail': 'Aucune stratégie trouvée.'}, 404),
        ),
      );
      expect(await service.performance(), isNull);
    });
  });

  group('ExchangeService', () {
    test('échec du test de connexion renvoyé comme résultat', () async {
      final service = ExchangeService(
        client(MemoryTokenStorage(access: 'A'), (req) async {
          expect(req.method, 'POST');
          expect(req.url.path, '/api/exchanges/connections/3/test/');
          return json({'status': 'auth_error', 'detail': 'Invalid key'}, 400);
        }),
      );
      final result = await service.testConnection(3);
      expect(result.isOk, isFalse);
      expect(result.status, 'auth_error');
      expect(result.message, "Clés refusées par l'exchange.");
    });
  });
}
