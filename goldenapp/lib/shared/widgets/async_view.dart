import 'package:flutter/material.dart';

import 'state_views.dart';

/// Source de données d'un écran : une seule fonction à remplacer par l'appel API.
typedef DataLoader<T> = Future<T> Function();

/// Charge une donnée et affiche chargement / erreur / vide / contenu.
///
/// [builder] reçoit la donnée et une fonction `refresh` (utile pour
/// RefreshIndicator ou après une action).
class AsyncView<T> extends StatefulWidget {
  const AsyncView({
    super.key,
    required this.load,
    required this.builder,
    this.isEmpty,
    this.emptyIcon = Icons.inbox_outlined,
    this.emptyMessage = 'Rien à afficher pour le moment.',
    this.loadingMessage,
    this.errorMessage,
    this.embedded = false,
  });

  final DataLoader<T> load;
  final Widget Function(BuildContext context, T data, Future<void> Function() refresh) builder;
  final bool Function(T data)? isEmpty;
  final IconData emptyIcon;
  final String emptyMessage;
  final String? loadingMessage;

  /// Transforme l'exception en message lisible (par défaut : message générique).
  final String Function(Object error)? errorMessage;

  /// À true quand la vue est placée dans une liste déjà scrollable :
  /// l'état vide n'est alors pas enveloppé dans un RefreshIndicator.
  final bool embedded;

  @override
  State<AsyncView<T>> createState() => _AsyncViewState<T>();
}

class _AsyncViewState<T> extends State<AsyncView<T>> {
  late Future<T> _future;

  @override
  void initState() {
    super.initState();
    _future = widget.load();
  }

  Future<void> _refresh() async {
    final next = widget.load();
    setState(() {
      _future = next;
    });
    try {
      await next;
    } catch (_) {
      // L'erreur est affichée par le FutureBuilder.
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<T>(
      future: _future,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return LoadingView(message: widget.loadingMessage);
        }
        if (snapshot.hasError) {
          final error = snapshot.error!;
          return _FitOrScroll(
            child: ErrorView(
              message:
                  widget.errorMessage?.call(error) ??
                  'Impossible de charger les données. Vérifiez votre connexion puis réessayez.',
              onRetry: _refresh,
            ),
          );
        }
        final data = snapshot.data as T;
        if (widget.isEmpty?.call(data) ?? false) {
          final empty = EmptyView(icon: widget.emptyIcon, message: widget.emptyMessage);
          if (widget.embedded) return _FitOrScroll(child: empty);
          return RefreshIndicator(
            onRefresh: _refresh,
            child: ListView(physics: const AlwaysScrollableScrollPhysics(), children: [empty]),
          );
        }
        return widget.builder(context, data, _refresh);
      },
    );
  }
}

/// Centre l'enfant dans l'espace disponible, et le rend scrollable
/// s'il est plus haut que cet espace (cartes à hauteur fixe).
class _FitOrScroll extends StatelessWidget {
  const _FitOrScroll({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (!constraints.hasBoundedHeight) return child;
        return SingleChildScrollView(
          child: ConstrainedBox(constraints: BoxConstraints(minHeight: constraints.maxHeight), child: child),
        );
      },
    );
  }
}
