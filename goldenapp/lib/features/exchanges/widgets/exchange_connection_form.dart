import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../app_theme.dart';
import '../../../core/api/api_exception.dart';
import '../../../core/models/exchange_connection.dart';
import '../models/exchange_type.dart';

/// Formulaire d'ajout d'une connexion (affiché dans une bottom sheet).
class ExchangeConnectionForm extends StatefulWidget {
  const ExchangeConnectionForm({super.key, required this.onSubmit});

  /// Lève une exception si l'API refuse les clés.
  final Future<void> Function(ExchangeConnectionInput input) onSubmit;

  @override
  State<ExchangeConnectionForm> createState() => _ExchangeConnectionFormState();
}

class _ExchangeConnectionFormState extends State<ExchangeConnectionForm> {
  final _formKey = GlobalKey<FormState>();
  final _label = TextEditingController();
  final _apiKey = TextEditingController();
  final _apiSecret = TextEditingController();
  final _passphrase = TextEditingController();
  ExchangeType _exchange = ExchangeType.binance;
  bool _showSecret = false;
  bool _submitting = false;
  String? _error;

  @override
  void dispose() {
    _label.dispose();
    _apiKey.dispose();
    _apiSecret.dispose();
    _passphrase.dispose();
    super.dispose();
  }

  String? _required(String? v) => (v == null || v.trim().isEmpty) ? 'Champ obligatoire' : null;

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      await widget.onSubmit(
        ExchangeConnectionInput(
          exchange: _exchange.apiValue,
          label: _label.text.trim(),
          apiKey: _apiKey.text.trim(),
          apiSecret: _apiSecret.text.trim(),
          apiPassphrase: _exchange.requiresPassphrase ? _passphrase.text.trim() : '',
        ),
      );
      if (mounted) Navigator.of(context).pop(true);
    } on ApiException catch (e) {
      // Le backend teste les clés avant de les enregistrer et renvoie la raison du refus.
      if (mounted) setState(() => _error = e.message);
    } catch (_) {
      if (mounted) {
        setState(() => _error = 'Clés refusées par l\'exchange ou service injoignable. Vérifiez-les puis réessayez.');
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 8,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Nouvelle connexion',
                style: GoogleFonts.montserrat(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryBlue,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Créez une clé API sans droit de retrait sur votre exchange.',
                style: GoogleFonts.openSans(fontSize: 13, color: AppColors.mutedText),
              ),
              const SizedBox(height: 20),
              SegmentedButton<ExchangeType>(
                segments: [
                  for (final e in ExchangeType.values) ButtonSegment(value: e, label: Text(e.label)),
                ],
                selected: {_exchange},
                showSelectedIcon: false,
                style: SegmentedButton.styleFrom(
                  selectedBackgroundColor: AppColors.primaryBlue,
                  selectedForegroundColor: AppColors.white,
                  textStyle: GoogleFonts.openSans(fontWeight: FontWeight.w700),
                ),
                onSelectionChanged: (s) => setState(() => _exchange = s.first),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _label,
                maxLength: 50,
                decoration: const InputDecoration(
                  labelText: 'Libellé (facultatif)',
                  hintText: 'Ex. Compte principal',
                  prefixIcon: Icon(Icons.label_outline),
                  counterText: '',
                ),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _apiKey,
                validator: _required,
                autocorrect: false,
                enableSuggestions: false,
                decoration: const InputDecoration(
                  labelText: 'Clé API',
                  prefixIcon: Icon(Icons.vpn_key_outlined),
                ),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _apiSecret,
                validator: _required,
                obscureText: !_showSecret,
                autocorrect: false,
                enableSuggestions: false,
                decoration: InputDecoration(
                  labelText: 'Secret API',
                  prefixIcon: const Icon(Icons.lock_outline),
                  suffixIcon: IconButton(
                    tooltip: _showSecret ? 'Masquer' : 'Afficher',
                    icon: Icon(_showSecret ? Icons.visibility_off_outlined : Icons.visibility_outlined),
                    onPressed: () => setState(() => _showSecret = !_showSecret),
                  ),
                ),
              ),
              if (_exchange.requiresPassphrase) ...[
                const SizedBox(height: 12),
                TextFormField(
                  controller: _passphrase,
                  validator: (v) => _required(v) == null ? null : 'Le passphrase est requis pour OKX',
                  obscureText: !_showSecret,
                  decoration: const InputDecoration(
                    labelText: 'Passphrase',
                    prefixIcon: Icon(Icons.password_outlined),
                  ),
                ),
              ],
              if (_error != null) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.danger.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline, color: AppColors.danger, size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _error!,
                          style: GoogleFonts.openSans(fontSize: 13, color: AppColors.danger),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: _submitting ? null : _submit,
                child: _submitting
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(strokeWidth: 2.5, color: AppColors.primaryBlue),
                      )
                    : const Text('Tester et enregistrer'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
