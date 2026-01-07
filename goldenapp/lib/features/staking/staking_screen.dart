import 'package:flutter/material.dart';
import '../../app_theme.dart';

class StakingScreen extends StatefulWidget {
  const StakingScreen({Key? key}) : super(key: key);

  @override
  State<StakingScreen> createState() => _StakingScreenState();
}

class _StakingScreenState extends State<StakingScreen> {
  final TextEditingController _amountController = TextEditingController();
  String _selectedToken = 'ETH';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Staker des Tokens')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Sélectionnez l\'actif',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            _buildTokenSelector(),
            const SizedBox(height: 32),
            Text(
              'Montant à staker',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _amountController,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              decoration: InputDecoration(
                hintText: '0.00',
                suffixText: _selectedToken,
                suffixStyle: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Disponible: 4.82 $_selectedToken', style: Theme.of(context).textTheme.bodySmall),
                TextButton(
                  onPressed: () => _amountController.text = '4.82',
                  child: const Text('MAX'),
                ),
              ],
            ),
            const SizedBox(height: 32),
            _buildEstimateCard(),
            const SizedBox(height: 48),
            ElevatedButton(
              onPressed: () {
                // Handle staking
                _showSuccessDialog();
              },
              child: const Text('Confirmer le Staking'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTokenSelector() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(12),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: _selectedToken,
          isExpanded: true,
          items: ['ETH', 'GLD', 'USDT'].map((String value) {
            return DropdownMenuItem<String>(
              value: value,
              child: Row(
                children: [
                  CircleAvatar(radius: 12, child: Text(value[0])),
                  const SizedBox(width: 12),
                  Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
                ],
              ),
            );
          }).toList(),
          onChanged: (newValue) {
            setState(() => _selectedToken = newValue!);
          },
        ),
      ),
    );
  }

  Widget _buildEstimateCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.primaryBlue.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.primaryBlue.withOpacity(0.1)),
      ),
      child: Column(
        children: [
          _buildSummaryRow('Rendement Annuel (APR)', '12.5%'),
          const Divider(height: 24),
          _buildSummaryRow('Période de verrouillage', 'Sans engagement'),
          const Divider(height: 24),
          _buildSummaryRow('Arrivée des récompenses', 'Toutes les 24h'),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Text(
            label,
            style: Theme.of(context).textTheme.bodyMedium,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        const SizedBox(width: 8),
        Text(
          value,
          style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primaryBlue),
        ),
      ],
    );
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.check_circle, color: Colors.green, size: 64),
            const SizedBox(height: 24),
            Text('Transaction Réussie', style: Theme.of(context).textTheme.displayMedium),
            const SizedBox(height: 12),
            const Text(
              'Vos tokens ont été stakés avec succès. Vous commencerez à recevoir des récompenses d\'ici 24 heures.',
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Fermer'),
            ),
          ],
        ),
      ),
    );
  }
}
