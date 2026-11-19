import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../app_theme.dart';
import '../../core/models/exchange_connection.dart';
import '../../core/providers/providers.dart';
import '../../shared/utils/formatters.dart';
import '../../shared/widgets/widgets.dart';
import 'widgets/exchange_connection_form.dart';

/// Connexions exchange (`/exchanges/connections/`) : liste, ajout, test et suppression.
class ExchangesScreen extends ConsumerStatefulWidget {
  const ExchangesScreen({super.key});

  @override
  ConsumerState<ExchangesScreen> createState() => _ExchangesScreenState();
}

class _ExchangesScreenState extends ConsumerState<ExchangesScreen> {
  void _reload() => ref.invalidate(exchangeConnectionsProvider);

  Future<void> _openForm() async {
    final service = ref.read(exchangeServiceProvider);
    final created = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      backgroundColor: AppColors.white,
      builder: (_) => ExchangeConnectionForm(onSubmit: service.createConnection),
    );
    if (created == true && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Connexion ajoutée')),
      );
      _reload();
    }
  }

  Future<void> _delete(ExchangeConnection c) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Supprimer la connexion ?'),
        content: Text(
          'Les stratégies liées à ${c.displayName} ne pourront plus passer d\'ordres.',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Annuler')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: AppColors.danger),
            child: const Text('Supprimer'),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;
    final messenger = ScaffoldMessenger.of(context);
    try {
      await ref.read(exchangeServiceProvider).deleteConnection(c.id);
      messenger.showSnackBar(const SnackBar(content: Text('Connexion supprimée')));
      _reload();
    } catch (_) {
      messenger.showSnackBar(
        const SnackBar(backgroundColor: AppColors.danger, content: Text('Suppression impossible')),
      );
    }
  }

  Future<void> _test(ExchangeConnection c) async {
    final messenger = ScaffoldMessenger.of(context);
    messenger.showSnackBar(SnackBar(content: Text('Test de ${c.displayName}…')));
    ConnectionTestResult result;
    try {
      result = await ref.read(exchangeServiceProvider).testConnection(c.id);
    } catch (_) {
      result = const ConnectionTestResult(status: 'error');
    }
    if (!mounted) return;
    messenger.hideCurrentSnackBar();
    await showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      backgroundColor: AppColors.white,
      builder: (_) => _TestResultSheet(connection: c, result: result),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Connexions exchange')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openForm,
        backgroundColor: AppColors.gold,
        foregroundColor: AppColors.primaryBlue,
        icon: const Icon(Icons.add_link_rounded),
        label: Text('Ajouter', style: GoogleFonts.openSans(fontWeight: FontWeight.bold)),
      ),
      body: AsyncValueView<List<ExchangeConnection>>(
        value: ref.watch(exchangeConnectionsProvider),
        onRetry: _reload,
        loadingMessage: 'Chargement des connexions…',
        builder: (context, connections) => RefreshIndicator(
          onRefresh: () => refreshQuietly(ref, exchangeConnectionsProvider.future),
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 96),
            children: [
              const _SecurityNote(),
              const SizedBox(height: 24),
              SectionHeader(
                title: 'Mes connexions',
                subtitle: '${connections.length} connexion${connections.length > 1 ? 's' : ''}',
              ),
              if (connections.isEmpty)
                EmptyView(
                  icon: Icons.link_off_rounded,
                  title: 'Aucune connexion',
                  message: 'Connectez Binance, Bybit ou OKX pour automatiser vos stratégies.',
                  actionLabel: 'Ajouter une connexion',
                  onAction: _openForm,
                )
              else
                for (final c in connections) ...[
                  _ConnectionCard(
                    connection: c,
                    onTest: () => _test(c),
                    onDelete: () => _delete(c),
                  ),
                  const SizedBox(height: 12),
                ],
            ],
          ),
        ),
      ),
    );
  }
}

class _SecurityNote extends StatelessWidget {
  const _SecurityNote();

  @override
  Widget build(BuildContext context) {
    return AppCard(
      color: AppColors.secondaryBlue.withValues(alpha: 0.06),
      borderColor: AppColors.secondaryBlue.withValues(alpha: 0.25),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.shield_outlined, color: AppColors.primaryBlue),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              'Vos clés sont chiffrées côté serveur et ne sont jamais réaffichées. '
              'Elles sont testées auprès de l\'exchange avant d\'être enregistrées.',
              style: GoogleFonts.openSans(fontSize: 13, color: AppColors.darkGrey, height: 1.4),
            ),
          ),
        ],
      ),
    );
  }
}

class _ConnectionCard extends StatelessWidget {
  const _ConnectionCard({required this.connection, required this.onTest, required this.onDelete});

  final ExchangeConnection connection;
  final VoidCallback onTest;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    final c = connection;
    return AppCard(
      padding: const EdgeInsets.fromLTRB(16, 16, 8, 8),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  gradient: AppColors.futuristicGradient,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  c.exchangeName.substring(0, 1).toUpperCase(),
                  style: GoogleFonts.montserrat(
                    color: AppColors.gold,
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      c.label.isEmpty ? c.exchangeName : c.label,
                      style: GoogleFonts.openSans(fontWeight: FontWeight.w700, color: AppColors.darkGrey),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${c.exchangeName} · ${c.apiKeyMasked}',
                      style: GoogleFonts.robotoMono(fontSize: 12, color: AppColors.mutedText),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              TextButton.icon(
                onPressed: onTest,
                icon: const Icon(Icons.wifi_tethering_rounded, size: 18),
                label: const Text('Tester'),
              ),
              TextButton.icon(
                onPressed: onDelete,
                style: TextButton.styleFrom(foregroundColor: AppColors.danger),
                icon: const Icon(Icons.delete_outline_rounded, size: 18),
                label: const Text('Supprimer'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _TestResultSheet extends StatelessWidget {
  const _TestResultSheet({required this.connection, required this.result});

  final ExchangeConnection connection;
  final ConnectionTestResult result;

  String get _message => switch (result.status) {
        'ok' => 'Connexion opérationnelle',
        'auth_error' => 'Clés refusées par l\'exchange',
        'network_error' => 'Exchange injoignable pour le moment',
        _ => 'Le test a échoué',
      };

  @override
  Widget build(BuildContext context) {
    final color = result.isOk ? AppColors.success : AppColors.danger;
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 0, 24, 32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(result.isOk ? Icons.check_circle_rounded : Icons.error_rounded, color: color),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  _message,
                  style: GoogleFonts.montserrat(fontWeight: FontWeight.bold, fontSize: 17, color: color),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(connection.displayName, style: GoogleFonts.openSans(color: AppColors.mutedText)),
          const SizedBox(height: 16),
          if (result.isOk && result.balances.isNotEmpty) ...[
            Text(
              'Soldes détectés',
              style: GoogleFonts.openSans(fontWeight: FontWeight.w700, color: AppColors.darkGrey),
            ),
            const SizedBox(height: 8),
            for (final e in result.balances.entries)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  children: [
                    Expanded(child: Text(e.key, style: GoogleFonts.openSans())),
                    Text(
                      formatQuantity(e.value),
                      style: GoogleFonts.robotoMono(fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
          ] else if (result.detail != null)
            Text(result.detail!, style: GoogleFonts.openSans(fontSize: 13, color: AppColors.mutedText)),
        ],
      ),
    );
  }
}
