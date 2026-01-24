import 'package:flutter/material.dart';

class NetworkSelectionScreen extends StatelessWidget {
    const NetworkSelectionScreen({Key? key}) : super(key: key);

    @override
    Widget build(BuildContext context) {
        return Scaffold(
            appBar: AppBar(title: const Text('Réseau')),
            body: const Center(child: Text('Sélection du réseau (Ethereum / Sepolia)')),
        );
    }
}
