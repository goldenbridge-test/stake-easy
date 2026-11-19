import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers/providers.dart';
import '../../../shared/widgets/widgets.dart';

final _addressPattern = RegExp(r'^0x[0-9a-fA-F]{40}$');

/// État « aucun wallet » des écrans on-chain, avec consultation d'une adresse
/// en lecture seule en attendant WalletConnect.
class NoWalletView extends ConsumerWidget {
  const NoWalletView({super.key, required this.message});

  final String message;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return LayoutBuilder(
      builder: (context, constraints) => SingleChildScrollView(
        child: ConstrainedBox(
          constraints: BoxConstraints(minHeight: constraints.maxHeight),
          child: EmptyView(
            icon: Icons.account_balance_wallet_outlined,
            title: 'Aucun wallet connecté',
            message: message,
            actionLabel: 'Consulter une adresse',
            onAction: () => showWatchAddressDialog(context, ref),
          ),
        ),
      ),
    );
  }
}

/// Saisie d'une adresse publique (0x…) pour lire ses soldes on-chain.
/// Aucune clé privée n'est demandée : les transactions restent à signer
/// dans le wallet.
Future<void> showWatchAddressDialog(BuildContext context, WidgetRef ref) async {
  final address = await showDialog<String>(
    context: context,
    builder: (_) => const _WatchAddressDialog(),
  );
  if (address != null) ref.read(walletAddressProvider.notifier).state = address;
}

class _WatchAddressDialog extends StatefulWidget {
  const _WatchAddressDialog();

  @override
  State<_WatchAddressDialog> createState() => _WatchAddressDialogState();
}

class _WatchAddressDialogState extends State<_WatchAddressDialog> {
  final _formKey = GlobalKey<FormState>();
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _submit() {
    if (_formKey.currentState!.validate()) Navigator.pop(context, _controller.text.trim());
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Consulter une adresse'),
      content: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Lecture seule : la signature des transactions se fera depuis votre wallet '
              'lorsque WalletConnect sera disponible.',
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _controller,
              autofocus: true,
              autocorrect: false,
              decoration: const InputDecoration(hintText: '0x…'),
              onFieldSubmitted: (_) => _submit(),
              validator: (v) =>
                  _addressPattern.hasMatch(v?.trim() ?? '') ? null : 'Adresse invalide (0x suivi de 40 caractères)',
            ),
          ],
        ),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Annuler')),
        TextButton(onPressed: _submit, child: const Text('Consulter')),
      ],
    );
  }
}
