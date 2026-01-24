import 'package:flutter/material.dart';

class PortfolioScreen extends StatelessWidget {
    const PortfolioScreen({Key? key}) : super(key: key);

    @override
    Widget build(BuildContext context) {
        return Scaffold(
            appBar: AppBar(title: const Text('Portefeuille')),
            body: const Center(child: Text('Liste des positions et historique')),
        );
    }
}
