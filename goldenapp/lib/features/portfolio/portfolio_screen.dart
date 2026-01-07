import 'package:flutter/material.dart';
import '../../app_theme.dart';

class PortfolioScreen extends StatelessWidget {
  const PortfolioScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mon Portefeuille'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            _buildAssetSummary(context),
            const SizedBox(height: 32),
            _buildAssetList(context),
          ],
        ),
      ),
    );
  }

  Widget _buildAssetSummary(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.primaryBlue, AppColors.primaryBlue.withOpacity(0.8)],
        ),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        children: [
          const Text('Valeur Actuelle', style: TextStyle(color: Colors.white70)),
          const SizedBox(height: 8),
          const Text('\$ 12,450.00', style: TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold)),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildStat('Profit 24h', '+\$ 450.00', Colors.green),
              Container(width: 1, height: 40, color: Colors.white24),
              _buildStat('ROI Total', '+18.5%', Colors.green),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStat(String label, String value, Color color) {
    return Column(
      children: [
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 12)),
        const SizedBox(height: 4),
        Text(value, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 16)),
      ],
    );
  }

  Widget _buildAssetList(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Mes Actifs', style: Theme.of(context).textTheme.displaySmall?.copyWith(fontSize: 20)),
        const SizedBox(height: 16),
        _buildAssetItem('Ethereum', 'ETH', '2.5', '6,250.00', 'https://cryptologos.cc/logos/ethereum-eth-logo.png'),
        _buildAssetItem('Bitcoin', 'BTC', '0.12', '5,100.00', 'https://cryptologos.cc/logos/bitcoin-btc-logo.png'),
        _buildAssetItem('Solana', 'SOL', '15.0', '1,100.00', 'https://cryptologos.cc/logos/solana-sol-logo.png'),
      ],
    );
  }

  Widget _buildAssetItem(String name, String symbol, String amount, String value, String imageUrl) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[100]!),
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: Colors.transparent,
            backgroundImage: NetworkImage(imageUrl),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                Text('$amount $symbol', style: const TextStyle(color: Colors.grey)),
              ],
            ),
          ),
          Text('\$ $value', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        ],
      ),
    );
  }
}
