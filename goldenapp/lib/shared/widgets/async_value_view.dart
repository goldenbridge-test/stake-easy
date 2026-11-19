import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api/api_exception.dart';
import 'state_views.dart';

/// Message affichable pour une erreur de chargement.
String errorMessageOf(Object error) {
  if (error is ApiException) return error.message;
  return 'Impossible de charger les données. Vérifiez votre connexion puis réessayez.';
}

/// Affiche un [AsyncValue] Riverpod : chargement, erreur (« Réessayer »),
/// vide ou contenu.
///
/// Pendant un rafraîchissement (pull-to-refresh), les données déjà affichées
/// restent visibles ; après une erreur, le nouvel essai repasse par le
/// chargement.
class AsyncValueView<T> extends StatelessWidget {
  const AsyncValueView({
    super.key,
    required this.value,
    required this.builder,
    required this.onRetry,
    this.onRefresh,
    this.isEmpty,
    this.emptyIcon = Icons.inbox_outlined,
    this.emptyMessage = 'Rien à afficher pour le moment.',
    this.emptyTitle,
    this.loadingMessage,
    this.embedded = false,
  });

  final AsyncValue<T> value;
  final Widget Function(BuildContext context, T data) builder;

  /// Relance le chargement (en général `ref.invalidate(provider)`).
  final VoidCallback onRetry;

  /// Pull-to-refresh de l'état vide (en général `ref.refresh(provider.future)`).
  final Future<void> Function()? onRefresh;
  final bool Function(T data)? isEmpty;
  final IconData emptyIcon;
  final String emptyMessage;
  final String? emptyTitle;
  final String? loadingMessage;

  /// À true quand la vue est placée dans une liste déjà scrollable.
  final bool embedded;

  @override
  Widget build(BuildContext context) {
    final v = value;
    if (v.hasError && !v.isLoading) {
      return _FitOrScroll(
        enabled: !embedded,
        child: ErrorView(message: errorMessageOf(v.error!), onRetry: onRetry),
      );
    }
    if (!v.hasValue || v.hasError) {
      return LoadingView(message: loadingMessage);
    }
    final data = v.requireValue;
    if (isEmpty?.call(data) ?? false) {
      final empty = EmptyView(
        icon: emptyIcon,
        title: emptyTitle,
        message: emptyMessage,
      );
      if (embedded) return empty;
      final refresh = onRefresh;
      if (refresh == null) return _FitOrScroll(child: empty);
      return RefreshIndicator(
        onRefresh: refresh,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          children: [empty],
        ),
      );
    }
    return builder(context, data);
  }
}

/// Rafraîchit un provider asynchrone sans propager l'erreur
/// (elle est affichée par [AsyncValueView]).
Future<void> refreshQuietly<T>(
  WidgetRef ref,
  Refreshable<Future<T>> provider,
) async {
  final Future<T> pending = ref.refresh(provider);
  try {
    await pending;
  } catch (_) {}
}

/// Centre l'enfant dans l'espace disponible et le rend scrollable s'il est
/// plus haut que cet espace.
class _FitOrScroll extends StatelessWidget {
  const _FitOrScroll({required this.child, this.enabled = true});

  final Widget child;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    if (!enabled) return child;
    return LayoutBuilder(
      builder: (context, constraints) {
        if (!constraints.hasBoundedHeight) return child;
        return SingleChildScrollView(
          child: ConstrainedBox(
            constraints: BoxConstraints(minHeight: constraints.maxHeight),
            child: child,
          ),
        );
      },
    );
  }
}
