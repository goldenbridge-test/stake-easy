import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import 'api_config.dart';
import 'api_exception.dart';
import 'token_storage.dart';

/// Client HTTP JSON du backend Django.
///
/// - ajoute `Authorization: Bearer <access>` sur les requêtes authentifiées ;
/// - sur un 401, tente UN refresh via `/accounts/token/refresh/` puis rejoue la requête ;
/// - si le refresh échoue, efface les jetons et émet sur [onSessionExpired] ;
/// - convertit les erreurs en [ApiException] avec un message lisible.
///
/// Les chemins sont relatifs à [baseUrl] et doivent garder le slash final attendu
/// par Django (ex. `/execution/positions/`).
class ApiClient {
  ApiClient({
    http.Client? httpClient,
    TokenStorage? tokenStorage,
    String? baseUrl,
    this.timeout = ApiConfig.timeout,
    void Function()? onLogout,
  })  : _http = httpClient ?? http.Client(),
        tokens = tokenStorage ?? TokenStorage(),
        baseUrl = _trim(baseUrl ?? ApiConfig.baseUrl),
        _onLogout = onLogout;

  static const refreshPath = '/accounts/token/refresh/';

  final http.Client _http;
  final TokenStorage tokens;
  final String baseUrl;
  final Duration timeout;
  final void Function()? _onLogout;

  final _sessionExpired = StreamController<void>.broadcast();
  Future<bool>? _refreshing;

  /// Émis quand la session ne peut plus être renouvelée (jetons effacés).
  Stream<void> get onSessionExpired => _sessionExpired.stream;

  Future<dynamic> get(String path,
          {Map<String, dynamic>? query, bool auth = true}) =>
      _send('GET', path, query: query, auth: auth);

  Future<dynamic> post(String path,
          {Object? body, Map<String, dynamic>? query, bool auth = true}) =>
      _send('POST', path, body: body, query: query, auth: auth);

  Future<dynamic> put(String path, {Object? body, bool auth = true}) =>
      _send('PUT', path, body: body, auth: auth);

  Future<dynamic> patch(String path, {Object? body, bool auth = true}) =>
      _send('PATCH', path, body: body, auth: auth);

  Future<dynamic> delete(String path, {bool auth = true}) =>
      _send('DELETE', path, auth: auth);

  /// Construit l'URL complète. Les valeurs de [query] peuvent être des listes
  /// (`{'ids': [1, 2]}` -> `?ids=1&ids=2`), les `null` sont ignorées.
  Uri uri(String path, [Map<String, dynamic>? query]) {
    final normalized = path.startsWith('/') ? path : '/$path';
    final base = Uri.parse('$baseUrl$normalized');
    if (query == null || query.isEmpty) return base;
    final params = <String, dynamic>{};
    query.forEach((key, value) {
      if (value == null) return;
      params[key] = value is Iterable
          ? value.map((v) => v.toString()).toList()
          : value.toString();
    });
    return base.replace(queryParameters: params);
  }

  Future<dynamic> _send(
    String method,
    String path, {
    Object? body,
    Map<String, dynamic>? query,
    required bool auth,
  }) async {
    final target = uri(path, query);
    var response = await _perform(method, target, body, auth);

    if (response.statusCode == 401 && auth) {
      final refreshed = await _refreshOnce();
      if (refreshed) {
        response = await _perform(method, target, body, auth);
      }
      if (!refreshed || response.statusCode == 401) {
        await _expireSession();
      }
    }

    return _decode(response);
  }

  Future<http.Response> _perform(
      String method, Uri target, Object? body, bool auth) async {
    final headers = <String, String>{'Accept': 'application/json'};
    if (body != null) headers['Content-Type'] = 'application/json';
    if (auth) {
      final access = await tokens.access();
      if (access != null && access.isNotEmpty) {
        headers['Authorization'] = 'Bearer $access';
      }
    }

    final request = http.Request(method, target)..headers.addAll(headers);
    if (body != null) request.body = jsonEncode(body);

    try {
      final streamed = await _http.send(request).timeout(timeout);
      return await http.Response.fromStream(streamed).timeout(timeout);
    } on TimeoutException {
      throw ApiException.timeout();
    } on ApiException {
      rethrow;
    } catch (e) {
      throw ApiException.network(e);
    }
  }

  /// Un seul refresh en vol, partagé entre les requêtes concurrentes.
  Future<bool> _refreshOnce() {
    return _refreshing ??= _doRefresh().whenComplete(() => _refreshing = null);
  }

  Future<bool> _doRefresh() async {
    final refresh = await tokens.refresh();
    if (refresh == null || refresh.isEmpty) return false;
    try {
      final response = await _perform(
          'POST', uri(refreshPath), {'refresh': refresh}, false);
      if (response.statusCode != 200) return false;
      final data = jsonDecode(utf8.decode(response.bodyBytes));
      final access = data is Map ? data['access'] : null;
      if (access is! String || access.isEmpty) return false;
      // ROTATE_REFRESH_TOKENS est à False côté backend, mais on garde le
      // nouveau refresh s'il est renvoyé un jour.
      final newRefresh = data['refresh'];
      await tokens.saveTokens(
          access: access, refresh: newRefresh is String ? newRefresh : null);
      return true;
    } on ApiException {
      return false;
    } on FormatException {
      return false;
    }
  }

  Future<void> _expireSession() async {
    await tokens.clear();
    _onLogout?.call();
    if (!_sessionExpired.isClosed) _sessionExpired.add(null);
  }

  dynamic _decode(http.Response response) {
    final text = utf8.decode(response.bodyBytes, allowMalformed: true);
    Object? data;
    if (text.isNotEmpty) {
      try {
        data = jsonDecode(text);
      } on FormatException {
        data = text;
      }
    }
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return data;
    }
    throw ApiException.fromResponse(response.statusCode, data);
  }

  void close() {
    _sessionExpired.close();
    _http.close();
  }

  static String _trim(String url) =>
      url.endsWith('/') ? url.substring(0, url.length - 1) : url;
}
