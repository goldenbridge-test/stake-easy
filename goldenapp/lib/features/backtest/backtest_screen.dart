import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../app_theme.dart';
import '../../core/models/backtest.dart';
import '../../core/providers/providers.dart';
import '../../core/services/execution_service.dart';
import '../../shared/utils/formatters.dart';
import '../../shared/widgets/widgets.dart';
import 'backtest_polling.dart';
import 'widgets/backtest_results_view.dart';

/// Backtest : formulaire (BacktestRequestSerializer), suivi de la tâche de fond
/// et résultats.
class BacktestScreen extends ConsumerStatefulWidget {
  const BacktestScreen({super.key, this.pollInterval = const Duration(seconds: 3)});

  /// Intervalle d'interrogation tant que le backtest est en attente / en cours.
  final Duration pollInterval;

  @override
  ConsumerState<BacktestScreen> createState() => _BacktestScreenState();
}

class _BacktestScreenState extends ConsumerState<BacktestScreen> {
  final _formKey = GlobalKey<FormState>();
  final _capital = TextEditingController(text: '1000');
  final _discount = TextEditingController(text: '75');
  String _symbol = ExecutionService.availableSymbols.first;
  DateTime _startDate = DateTime(2020, 1, 1);
  bool _running = false;
  Object? _runError;
  Backtest? _current;
  StreamSubscription<Backtest>? _polling;

  @override
  void dispose() {
    _polling?.cancel();
    _capital.dispose();
    _discount.dispose();
    super.dispose();
  }

  /// Affiche [bt] et, s'il n'est pas terminé, l'interroge jusqu'au résultat.
  void _track(Backtest bt) {
    _polling?.cancel();
    setState(() {
      _current = bt;
      _runError = null;
    });
    if (!bt.isPending) return;
    final service = ref.read(executionServiceProvider);
    _polling = pollBacktest(bt, service.getBacktest, interval: widget.pollInterval).listen(
      (update) {
        if (!mounted) return;
        setState(() => _current = update);
        if (!update.isPending) ref.invalidate(backtestsProvider);
      },
      onError: (Object e) {
        if (mounted) setState(() => _runError = e);
      },
    );
  }

  double? _parse(String raw) => double.tryParse(raw.replaceAll(',', '.').trim());

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _startDate,
      firstDate: DateTime(2017, 1, 1),
      lastDate: DateTime.now(),
      helpText: 'Date de début',
      cancelText: 'Annuler',
      confirmText: 'Valider',
      fieldLabelText: 'Date',
      errorFormatText: 'Format invalide',
      errorInvalidText: 'Date hors limites',
    );
    if (picked != null) setState(() => _startDate = picked);
  }

  Future<void> _run() async {
    if (!_formKey.currentState!.validate()) return;
    FocusScope.of(context).unfocus();
    setState(() {
      _running = true;
      _runError = null;
    });
    try {
      final bt = await ref.read(executionServiceProvider).createBacktest(
            symbol: _symbol,
            capital: _parse(_capital.text)!,
            startDate: _startDate,
            discountPct: _parse(_discount.text)!,
          );
      if (!mounted) return;
      ref.invalidate(backtestsProvider);
      _track(bt);
    } catch (e) {
      if (mounted) setState(() => _runError = e);
    } finally {
      if (mounted) setState(() => _running = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Backtest')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const SectionHeader(
            title: 'Simuler la stratégie',
            subtitle: 'Rejouez la stratégie GoldenBridge sur l\'historique d\'un actif',
          ),
          _buildForm(),
          const SizedBox(height: 28),
          _buildResult(),
          const SizedBox(height: 28),
          const SectionHeader(title: 'Backtests récents'),
          AsyncValueView<List<Backtest>>(
            value: ref.watch(backtestsProvider),
            onRetry: () => ref.invalidate(backtestsProvider),
            embedded: true,
            isEmpty: (list) => list.isEmpty,
            emptyIcon: Icons.history_rounded,
            emptyMessage: 'Aucun backtest lancé pour le moment.',
            builder:
                (context, list) => AppCard(
                  padding: EdgeInsets.zero,
                  child: Column(
                    children: [
                      for (var i = 0; i < list.length; i++) ...[
                        if (i > 0)
                          const Divider(height: 1, indent: 16, endIndent: 16, color: AppColors.border),
                        _HistoryTile(
                          backtest: list[i],
                          selected: list[i].id == _current?.id,
                          onTap: () => _track(list[i]),
                        ),
                      ],
                    ],
                  ),
                ),
          ),
        ],
      ),
    );
  }

  Widget _buildForm() {
    return AppCard(
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            DropdownButtonFormField<String>(
              initialValue: _symbol,
              decoration: const InputDecoration(
                labelText: 'Actif',
                prefixIcon: Icon(Icons.currency_bitcoin_rounded),
              ),
              items: [
                for (final s in ExecutionService.availableSymbols) DropdownMenuItem(value: s, child: Text(s)),
              ],
              onChanged: (s) => setState(() => _symbol = s ?? _symbol),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _capital,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'[0-9.,]'))],
              decoration: const InputDecoration(
                labelText: 'Capital (USDT)',
                prefixIcon: Icon(Icons.payments_outlined),
              ),
              validator: (v) {
                final value = _parse(v ?? '');
                if (value == null || value <= 0) return 'Saisissez un capital supérieur à 0';
                return null;
              },
            ),
            const SizedBox(height: 12),
            InkWell(
              onTap: _pickDate,
              borderRadius: BorderRadius.circular(12),
              child: InputDecorator(
                decoration: const InputDecoration(
                  labelText: 'Date de début',
                  prefixIcon: Icon(Icons.event_outlined),
                ),
                child: Text(formatDate(_startDate), style: GoogleFonts.openSans(fontSize: 16)),
              ),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _discount,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'[0-9.,]'))],
              decoration: const InputDecoration(
                labelText: 'Décote d\'entrée (%)',
                prefixIcon: Icon(Icons.percent_rounded),
                helperText: 'Paramètre discount_pct de la stratégie (75 par défaut)',
              ),
              validator: (v) {
                final value = _parse(v ?? '');
                if (value == null || value < 0 || value > 100) return 'Entre 0 et 100';
                return null;
              },
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: _running ? null : _run,
              icon:
                  _running
                      ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2.5, color: AppColors.primaryBlue),
                      )
                      : const Icon(Icons.play_arrow_rounded),
              label: Text(_running ? 'Calcul en cours…' : 'Lancer le backtest'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResult() {
    if (_running) {
      return const AppCard(
        child: LoadingView(message: 'Analyse de l\'historique… cela peut prendre une minute.'),
      );
    }
    final error = _runError;
    if (error != null) {
      final pending = _current;
      return AppCard(
        child: ErrorView(
          title: 'Backtest impossible',
          message: switch (error) {
            StateError(:final message) => message,
            _ when pending != null && pending.isPending => errorMessageOf(error),
            _ => '${errorMessageOf(error)}\nVérifiez les paramètres puis réessayez.',
          },
          // Suivi interrompu : on reprend l'interrogation du même backtest.
          onRetry: pending != null && pending.isPending ? () => _track(pending) : _run,
        ),
      );
    }
    final bt = _current;
    if (bt == null) {
      return const AppCard(
        child: EmptyView(
          icon: Icons.query_stats_rounded,
          message: 'Lancez un backtest pour voir la performance, le CAGR et la courbe de capital.',
        ),
      );
    }
    if (bt.isPending) {
      return AppCard(
        child: LoadingView(
          message: 'Backtest ${bt.symbol} : ${bt.statusLabel.toLowerCase()}…\n'
              'Analyse de l\'historique, cela peut prendre une minute.',
        ),
      );
    }
    if (bt.isFailed || bt.results == null) {
      return AppCard(
        child: ErrorView(
          title: 'Backtest ${bt.symbol} échoué',
          message: bt.error.isEmpty ? 'Aucun résultat disponible.' : bt.error,
        ),
      );
    }
    return BacktestResultsView(backtest: bt);
  }
}

class _HistoryTile extends StatelessWidget {
  const _HistoryTile({required this.backtest, required this.selected, required this.onTap});

  final Backtest backtest;
  final bool selected;
  final VoidCallback onTap;

  Color get _statusColor => backtest.isCompleted
      ? AppColors.success
      : backtest.isFailed
          ? AppColors.danger
          : AppColors.warning;

  @override
  Widget build(BuildContext context) {
    final r = backtest.results;
    return ListTile(
      onTap: onTap,
      selected: selected,
      selectedTileColor: AppColors.gold.withValues(alpha: 0.08),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      title: Text(
        '${backtest.symbol} · ${formatUsd(backtest.capital)}',
        style: GoogleFonts.openSans(fontWeight: FontWeight.w700, color: AppColors.darkGrey),
      ),
      subtitle: Text(
        'Depuis le ${formatDate(backtest.startDate)} · lancé le ${formatDate(backtest.createdAt)}',
        style: GoogleFonts.openSans(fontSize: 12, color: AppColors.mutedText),
      ),
      trailing:
          r != null
              ? PnlText(r.totalPnlPct, percent: true)
              : StatusBadge(label: backtest.statusLabel, color: _statusColor),
    );
  }
}
