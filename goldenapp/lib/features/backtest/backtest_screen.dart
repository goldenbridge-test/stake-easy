import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../app_theme.dart';
import '../../shared/utils/formatters.dart';
import '../../shared/widgets/widgets.dart';
import 'backtest_mock_data.dart';
import 'models/backtest.dart';
import 'widgets/backtest_results_view.dart';

/// Backtest : formulaire (BacktestRequestSerializer) et résultats.
class BacktestScreen extends StatefulWidget {
  const BacktestScreen({super.key, this.onRun = mockRunBacktest, this.historyLoader = loadMockBacktests});

  /// Lance le backtest et renvoie son état (terminé, en cours ou échoué).
  final Future<BacktestRequest> Function(BacktestDraft draft) onRun;

  /// Backtests précédents de l'utilisateur.
  final DataLoader<List<BacktestRequest>> historyLoader;

  @override
  State<BacktestScreen> createState() => _BacktestScreenState();
}

class _BacktestScreenState extends State<BacktestScreen> {
  final _formKey = GlobalKey<FormState>();
  final _capital = TextEditingController(text: '1000');
  final _discount = TextEditingController(text: '75');
  String _symbol = backtestSymbols.first;
  DateTime _startDate = DateTime(2020, 1, 1);
  bool _running = false;
  Object? _runError;
  BacktestRequest? _current;
  int _historyVersion = 0;

  @override
  void dispose() {
    _capital.dispose();
    _discount.dispose();
    super.dispose();
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
      final bt = await widget.onRun(
        BacktestDraft(
          symbol: _symbol,
          capital: _parse(_capital.text)!,
          startDate: _startDate,
          discountPct: _parse(_discount.text)!,
        ),
      );
      setState(() {
        _current = bt;
        _historyVersion++;
      });
    } catch (e) {
      setState(() => _runError = e);
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
          AsyncView<List<BacktestRequest>>(
            key: ValueKey(_historyVersion),
            load: widget.historyLoader,
            embedded: true,
            isEmpty: (list) => list.isEmpty,
            emptyIcon: Icons.history_rounded,
            emptyMessage: 'Aucun backtest lancé pour le moment.',
            builder:
                (context, list, _) => AppCard(
                  padding: EdgeInsets.zero,
                  child: Column(
                    children: [
                      for (var i = 0; i < list.length; i++) ...[
                        if (i > 0)
                          const Divider(height: 1, indent: 16, endIndent: 16, color: AppColors.border),
                        _HistoryTile(
                          backtest: list[i],
                          selected: list[i].id == _current?.id,
                          onTap: () => setState(() => _current = list[i]),
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
              items: [for (final s in backtestSymbols) DropdownMenuItem(value: s, child: Text(s))],
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
    if (_runError != null) {
      return AppCard(
        child: ErrorView(
          title: 'Backtest impossible',
          message: 'Le serveur n\'a pas pu lancer la simulation. Vérifiez les paramètres puis réessayez.',
          onRetry: _run,
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
    if (bt.status.isInProgress) {
      return AppCard(
        child: LoadingView(message: 'Backtest ${bt.symbol} : ${bt.status.label.toLowerCase()}…'),
      );
    }
    if (bt.status == BacktestStatus.failed || bt.results == null) {
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

  final BacktestRequest backtest;
  final bool selected;
  final VoidCallback onTap;

  Color get _statusColor => switch (backtest.status) {
    BacktestStatus.completed => AppColors.success,
    BacktestStatus.failed => AppColors.danger,
    _ => AppColors.warning,
  };

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
              : StatusBadge(label: backtest.status.label, color: _statusColor),
    );
  }
}
