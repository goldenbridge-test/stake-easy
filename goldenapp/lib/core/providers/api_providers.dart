import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/api_client.dart';
import '../api/token_storage.dart';
import '../services/auth_service.dart';
import '../services/course_service.dart';
import '../services/exchange_service.dart';
import '../services/execution_service.dart';
import '../services/strategy_service.dart';

/// Stockage des jetons (surchargé par `MemoryTokenStorage` dans les tests).
final tokenStorageProvider = Provider<TokenStorage>((ref) => TokenStorage());

/// Client HTTP unique de l'application.
final apiClientProvider = Provider<ApiClient>((ref) {
  final client = ApiClient(tokenStorage: ref.watch(tokenStorageProvider));
  ref.onDispose(client.close);
  return client;
});

final authServiceProvider = Provider<AuthService>(
  (ref) => AuthService(client: ref.watch(apiClientProvider)),
);

final executionServiceProvider = Provider<ExecutionService>(
  (ref) => ExecutionService(ref.watch(apiClientProvider)),
);

final exchangeServiceProvider = Provider<ExchangeService>(
  (ref) => ExchangeService(ref.watch(apiClientProvider)),
);

final strategyServiceProvider = Provider<StrategyService>(
  (ref) => StrategyService(ref.watch(apiClientProvider)),
);

final courseServiceProvider = Provider<CourseService>(
  (ref) => CourseService(ref.watch(apiClientProvider)),
);
