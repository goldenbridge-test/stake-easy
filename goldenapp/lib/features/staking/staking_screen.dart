import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../app_theme.dart';
import '../../shared/utils/formatters.dart';
import '../../shared/widgets/widgets.dart';
import 'models/staking_overview.dart';
import 'staking_mock_data.dart';

typedef StakeAction = Future<void> Function(String tokenAddress, double amount);
typedef UnstakeAction = Future<void> Function(String tokenAddress);

/// Staking : solde staké, tokens autorisés, formulaire staker / retirer.
class StakingScreen extends StatelessWidget {
  const StakingScreen({
    super.key,
    this.loader = loadMockStakingOverview,
    this.onStake = mockStake,
    this.onUnstake = mockUnstake,
    this.onConnectWallet,
  });

  final DataLoader<StakingOverview> loader;
  final StakeAction onStake;
  final UnstakeAction onUnstake;
  final VoidCallback? onConnectWallet;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Staking')),
      body: AsyncView<StakingOverview>(
        load: loader,
        loadingMessage: 'Lecture du contrat de staking…',
        builder: (context, overview, refresh) {
          if (!overview.hasWallet) {
            return EmptyView(
              icon: Icons.account_balance_wallet_outlined,
              title: 'Aucun wallet connecté',
              message: 'Connectez votre wallet pour staker vos tokens et suivre vos dépôts.',
              actionLabel: onConnectWallet == null ? null : 'Connecter un wallet',
              onAction: onConnectWallet,
            );
          }
          return RefreshIndicator(
            onRefresh: refresh,
            child: _StakingContent(
              overview: overview,
              onStake: onStake,
              onUnstake: onUnstake,
              onDone: refresh,
            ),
          );
        },
      ),
    );
  }
}

class _StakingContent extends StatefulWidget {
  const _StakingContent({
    required this.overview,
    required this.onStake,
    required this.onUnstake,
    required this.onDone,
  });

  final StakingOverview overview;
  final StakeAction onStake;
  final UnstakeAction onUnstake;
  final Future<void> Function() onDone;

  @override
  State<_StakingContent> createState() => _StakingContentState();
}

enum _Mode { stake, unstake }

class _StakingContentState extends State<_StakingContent> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  _Mode _mode = _Mode.stake;
  AllowedToken? _token;
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    _token = widget.overview.tokens.isEmpty ? null : widget.overview.tokens.first;
  }

  @override
  void didUpdateWidget(covariant _StakingContent oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Après un rafraîchissement, on garde le même token (nouvelles valeurs).
    final tokens = widget.overview.tokens;
    _token = tokens.where((t) => t.address == _token?.address).firstOrNull ??
        (tokens.isEmpty ? null : tokens.first);
  }

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  double get _maxStakeable {
    final t = _token;
    if (t == null) return 0;
    final room = widget.overview.maxStakePerUser - t.stakingBalance;
    return room < t.walletBalance ? room : t.walletBalance;
  }

  String? _validateAmount(String? raw) {
    final value = double.tryParse((raw ?? '').replaceAll(',', '.').trim());
    if (value == null || value <= 0) return 'Saisissez un montant supérieur à 0';
    final t = _token!;
    if (value > t.walletBalance) return 'Solde insuffisant dans le wallet';
    if (t.stakingBalance + value > widget.overview.maxStakePerUser) {
      return 'Dépasse le plafond de ${formatAmount(widget.overview.maxStakePerUser, t.symbol, decimals: 0)}';
    }
    return null;
  }

  Future<void> _submit() async {
    final token = _token;
    if (token == null) return;
    if (_mode == _Mode.stake && !_formKey.currentState!.validate()) return;
    final messenger = ScaffoldMessenger.of(context);
    setState(() => _submitting = true);
    try {
      if (_mode == _Mode.stake) {
        final amount = double.parse(_amountController.text.replaceAll(',', '.').trim());
        await widget.onStake(token.address, amount);
        messenger.showSnackBar(
          SnackBar(content: Text('${formatAmount(amount, token.symbol, decimals: 4)} stakés avec succès')),
        );
        _amountController.clear();
      } else {
        await widget.onUnstake(token.address);
        messenger.showSnackBar(
          SnackBar(content: Text('Solde ${token.symbol} retiré du staking')),
        );
      }
      await widget.onDone();
    } catch (_) {
      messenger.showSnackBar(
        const SnackBar(
          backgroundColor: AppColors.danger,
          content: Text('La transaction a échoué. Vérifiez votre wallet puis réessayez.'),
        ),
      );
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final o = widget.overview;
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        HeroBalanceCard(
          label: 'Valeur totale stakée',
          value: formatAmount(o.userTotalValue, o.valueUnit, decimals: 4),
          caption: '${shortenAddress(o.walletAddress!)} · ${o.networkName}',
          icon: Icons.lock_outline_rounded,
          footer: Row(
            children: [
              Expanded(
                child: HeroStat(label: 'Tokens stakés', value: '${o.stakedTokenCount}/${o.tokens.length}'),
              ),
              Expanded(
                child: HeroStat(
                  label: 'Plafond par token',
                  value: formatAmount(o.maxStakePerUser, '', decimals: 0).trim(),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 28),
        const SectionHeader(
          title: 'Tokens autorisés',
          subtitle: 'Sélectionnez un token pour staker ou retirer',
        ),
        if (o.tokens.isEmpty)
          const EmptyView(
            icon: Icons.token_outlined,
            message: 'Aucun token n\'est autorisé au staking pour le moment.',
          )
        else ...[
          for (final t in o.tokens) ...[
            _TokenCard(
              token: t,
              selected: t.address == _token?.address,
              valueUnit: o.valueUnit,
              onTap: () => setState(() => _token = t),
            ),
            const SizedBox(height: 12),
          ],
          const SizedBox(height: 16),
          const SectionHeader(title: 'Opération'),
          _buildForm(),
        ],
      ],
    );
  }

  Widget _buildForm() {
    final t = _token!;
    return AppCard(
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            SegmentedButton<_Mode>(
              segments: const [
                ButtonSegment(value: _Mode.stake, label: Text('Staker'), icon: Icon(Icons.add_rounded)),
                ButtonSegment(value: _Mode.unstake, label: Text('Retirer'), icon: Icon(Icons.remove_rounded)),
              ],
              selected: {_mode},
              showSelectedIcon: false,
              style: SegmentedButton.styleFrom(
                selectedBackgroundColor: AppColors.primaryBlue,
                selectedForegroundColor: AppColors.white,
                textStyle: GoogleFonts.openSans(fontWeight: FontWeight.w700),
              ),
              onSelectionChanged: (s) => setState(() => _mode = s.first),
            ),
            const SizedBox(height: 20),
            DropdownButtonFormField<String>(
              // La clé resynchronise le champ quand on choisit un token via sa carte.
              key: ValueKey('token-${t.address}'),
              initialValue: t.address,
              decoration: const InputDecoration(
                labelText: 'Token',
                prefixIcon: Icon(Icons.token_outlined),
              ),
              items: [
                for (final token in widget.overview.tokens)
                  DropdownMenuItem(value: token.address, child: Text('${token.symbol} · ${token.name}')),
              ],
              onChanged: (address) => setState(
                () => _token = widget.overview.tokens.firstWhere((x) => x.address == address),
              ),
            ),
            const SizedBox(height: 16),
            if (_mode == _Mode.stake) ...[
              TextFormField(
                controller: _amountController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'[0-9.,]'))],
                validator: _validateAmount,
                decoration: InputDecoration(
                  labelText: 'Montant',
                  prefixIcon: const Icon(Icons.payments_outlined),
                  suffixIcon: TextButton(
                    onPressed: _maxStakeable <= 0
                        ? null
                        : () => _amountController.text = _maxStakeable.toString(),
                    child: const Text('MAX'),
                  ),
                  helperText: 'Disponible : ${formatAmount(t.walletBalance, t.symbol, decimals: 4)}',
                ),
              ),
              const SizedBox(height: 12),
              const _InfoNote(
                text: 'Votre wallet vous demandera deux signatures : l\'autorisation du token, puis le dépôt.',
              ),
            ] else ...[
              _UnstakeSummary(token: t),
              const SizedBox(height: 12),
              const _InfoNote(
                text: 'Le retrait porte sur la totalité du solde staké de ce token.',
              ),
            ],
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _submitting || (_mode == _Mode.unstake && !t.isStaked) ? null : _submit,
              child: _submitting
                  ? const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(strokeWidth: 2.5, color: AppColors.primaryBlue),
                    )
                  : Text(_mode == _Mode.stake ? 'Staker ${t.symbol}' : 'Tout retirer'),
            ),
          ],
        ),
      ),
    );
  }
}

class _TokenCard extends StatelessWidget {
  const _TokenCard({
    required this.token,
    required this.selected,
    required this.valueUnit,
    required this.onTap,
  });

  final AllowedToken token;
  final bool selected;
  final String valueUnit;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      padding: const EdgeInsets.all(16),
      onTap: onTap,
      borderColor: selected ? AppColors.gold : AppColors.border,
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: selected ? AppColors.gold : AppColors.surfaceMuted,
              shape: BoxShape.circle,
            ),
            child: Text(
              token.symbol.length > 4 ? token.symbol.substring(0, 4) : token.symbol,
              style: GoogleFonts.montserrat(
                fontWeight: FontWeight.bold,
                fontSize: 12,
                color: AppColors.primaryBlue,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  token.name,
                  style: GoogleFonts.openSans(fontWeight: FontWeight.w700, color: AppColors.darkGrey),
                ),
                const SizedBox(height: 2),
                Text(
                  'Wallet : ${formatAmount(token.walletBalance, token.symbol, decimals: 2)}',
                  style: GoogleFonts.openSans(fontSize: 12, color: AppColors.mutedText),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                formatAmount(token.stakingBalance, token.symbol, decimals: 2),
                style: GoogleFonts.openSans(fontWeight: FontWeight.w700, color: AppColors.primaryBlue),
              ),
              const SizedBox(height: 2),
              token.isStaked
                  ? Text(
                      '≈ ${formatAmount(token.stakedValue, valueUnit, decimals: 4)}',
                      style: GoogleFonts.openSans(fontSize: 12, color: AppColors.mutedText),
                    )
                  : const StatusBadge(label: 'Non staké', color: AppColors.mutedText),
            ],
          ),
        ],
      ),
    );
  }
}

class _UnstakeSummary extends StatelessWidget {
  const _UnstakeSummary({required this.token});

  final AllowedToken token;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surfaceMuted,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(
              'Solde staké',
              style: GoogleFonts.openSans(color: AppColors.mutedText),
            ),
          ),
          Text(
            formatAmount(token.stakingBalance, token.symbol, decimals: 4),
            style: GoogleFonts.montserrat(fontWeight: FontWeight.bold, color: AppColors.primaryBlue),
          ),
        ],
      ),
    );
  }
}

class _InfoNote extends StatelessWidget {
  const _InfoNote({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Icon(Icons.info_outline_rounded, size: 16, color: AppColors.secondaryBlue),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: GoogleFonts.openSans(fontSize: 12, color: AppColors.mutedText, height: 1.4),
          ),
        ),
      ],
    );
  }
}
