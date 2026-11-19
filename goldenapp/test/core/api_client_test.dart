import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:goldenapp/core/api/api_client.dart';
import 'package:goldenapp/core/api/api_exception.dart';
import 'package:goldenapp/core/api/token_storage.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

const base = 'http://test/api';

http.Response json(Object body, int status) => http.Response(
      jsonEncode(body),
      status,
      headers: {'content-type': 'application/json; charset=utf-8'},
    );

void main() {
  group('ApiClient', () {
    test('envoie le jeton Bearer et décode le JSON', () async {
      final storage = MemoryTokenStorage(access: 'A1', refresh: 'R1');
      late http.Request captured;
      final client = ApiClient(
        baseUrl: base,
        tokenStorage: storage,
        httpClient: MockClient((req) async {
          captured = req;
          return json([
            {'id': 1}
          ], 200);
        }),
      );

      final data = await client.get('/execution/positions/');

      expect(captured.url.toString(), '$base/execution/positions/');
      expect(captured.headers['Authorization'], 'Bearer A1');
      expect(data, [
        {'id': 1}
      ]);
    });

    test("n'envoie pas d'Authorization quand auth=false", () async {
      final storage = MemoryTokenStorage(access: 'A1');
      late http.Request captured;
      final client = ApiClient(
        baseUrl: base,
        tokenStorage: storage,
        httpClient: MockClient((req) async {
          captured = req;
          return json({'access': 'x', 'refresh': 'y'}, 200);
        }),
      );

      await client.post('/accounts/login/',
          body: {'username': 'u', 'password': 'p'}, auth: false);

      expect(captured.headers.containsKey('Authorization'), isFalse);
      expect(jsonDecode(captured.body), {'username': 'u', 'password': 'p'});
      expect(captured.headers['Content-Type'], startsWith('application/json'));
    });

    test('encode les paramètres de requête multiples', () {
      final client = ApiClient(
          baseUrl: base,
          tokenStorage: MemoryTokenStorage(),
          httpClient: MockClient((_) async => json({}, 200)));
      final uri = client.uri('/execution/portfolio-simulation/', {
        'ids': [3, 4],
        'skip': null,
      });
      expect(uri.query, 'ids=3&ids=4');
    });

    test('sur 401 : refresh une fois puis rejoue la requête', () async {
      final storage = MemoryTokenStorage(access: 'old', refresh: 'R1');
      final calls = <String>[];
      final client = ApiClient(
        baseUrl: base,
        tokenStorage: storage,
        httpClient: MockClient((req) async {
          calls.add('${req.method} ${req.url.path} ${req.headers['Authorization'] ?? ''}');
          if (req.url.path.endsWith('/accounts/token/refresh/')) {
            expect(jsonDecode(req.body), {'refresh': 'R1'});
            return json({'access': 'new'}, 200);
          }
          if (req.headers['Authorization'] == 'Bearer old') {
            return json({'detail': 'Token is invalid or expired'}, 401);
          }
          return json({'id': 7, 'username': 'alice'}, 200);
        }),
      );

      var expired = false;
      client.onSessionExpired.listen((_) => expired = true);

      final data = await client.get('/accounts/me/');

      expect(data['username'], 'alice');
      expect(await storage.access(), 'new');
      expect(await storage.refresh(), 'R1');
      expect(calls, [
        'GET /api/accounts/me/ Bearer old',
        'POST /api/accounts/token/refresh/ ',
        'GET /api/accounts/me/ Bearer new',
      ]);
      await Future<void>.delayed(Duration.zero);
      expect(expired, isFalse);
    });

    test('refresh refusé : efface les jetons et notifie la déconnexion',
        () async {
      final storage = MemoryTokenStorage(access: 'old', refresh: 'R1');
      var refreshCalls = 0;
      var callbackCalled = false;
      final client = ApiClient(
        baseUrl: base,
        tokenStorage: storage,
        onLogout: () => callbackCalled = true,
        httpClient: MockClient((req) async {
          if (req.url.path.endsWith('/accounts/token/refresh/')) {
            refreshCalls++;
            return json({'detail': 'Token is invalid or expired'}, 401);
          }
          return json({'detail': 'Given token not valid'}, 401);
        }),
      );

      final events = <void>[];
      client.onSessionExpired.listen(events.add);

      await expectLater(
        client.get('/execution/trades/'),
        throwsA(isA<ApiException>()
            .having((e) => e.statusCode, 'statusCode', 401)),
      );
      await Future<void>.delayed(Duration.zero);

      expect(refreshCalls, 1);
      expect(await storage.access(), isNull);
      expect(await storage.refresh(), isNull);
      expect(callbackCalled, isTrue);
      expect(events, hasLength(1));
    });

    test('sans refresh token : pas de tentative de refresh', () async {
      final storage = MemoryTokenStorage(access: 'old');
      var refreshCalls = 0;
      final client = ApiClient(
        baseUrl: base,
        tokenStorage: storage,
        httpClient: MockClient((req) async {
          if (req.url.path.endsWith('/accounts/token/refresh/')) refreshCalls++;
          return json({'detail': 'Given token not valid'}, 401);
        }),
      );

      await expectLater(
          client.get('/accounts/me/'), throwsA(isA<ApiException>()));
      expect(refreshCalls, 0);
      expect(await storage.access(), isNull);
    });

    test("pas de refresh sur un 401 d'une requête non authentifiée", () async {
      final storage = MemoryTokenStorage(access: 'A', refresh: 'R');
      var refreshCalls = 0;
      final client = ApiClient(
        baseUrl: base,
        tokenStorage: storage,
        httpClient: MockClient((req) async {
          if (req.url.path.endsWith('/accounts/token/refresh/')) refreshCalls++;
          return json({
            'detail': 'No active account found with the given credentials'
          }, 401);
        }),
      );

      await expectLater(
          client.post('/accounts/login/', body: {}, auth: false),
          throwsA(isA<ApiException>()));
      expect(refreshCalls, 0);
      expect(await storage.access(), 'A');
    });

    test('erreurs de champs Django lisibles', () async {
      final client = ApiClient(
        baseUrl: base,
        tokenStorage: MemoryTokenStorage(),
        httpClient: MockClient((_) async => json({
              'username': ['A user with that username already exists.'],
              'password': ['This field may not be blank.'],
            }, 400)),
      );

      try {
        await client.post('/accounts/register/', body: {}, auth: false);
        fail('ApiException attendue');
      } on ApiException catch (e) {
        expect(e.statusCode, 400);
        expect(e.fieldError('username'),
            'A user with that username already exists.');
        expect(e.message, contains("Nom d'utilisateur"));
        expect(e.message, contains('Mot de passe'));
      }
    });

    test('detail Django prioritaire', () {
      final e = ApiException.fromResponse(
          404, {'detail': 'Aucune stratégie trouvée.'});
      expect(e.message, 'Aucune stratégie trouvée.');
      expect(e.isNotFound, isTrue);
    });

    test('erreur réseau convertie en ApiException', () async {
      final client = ApiClient(
        baseUrl: base,
        tokenStorage: MemoryTokenStorage(),
        httpClient: MockClient((_) async => throw http.ClientException('down')),
      );
      await expectLater(
        client.get('/courses/'),
        throwsA(isA<ApiException>()
            .having((e) => e.isNetworkError, 'isNetworkError', isTrue)),
      );
    });

    test('réponse 204 sans corps', () async {
      final client = ApiClient(
        baseUrl: base,
        tokenStorage: MemoryTokenStorage(access: 'A'),
        httpClient: MockClient((_) async => http.Response('', 204)),
      );
      expect(await client.delete('/exchanges/connections/3/'), isNull);
    });
  });
}
