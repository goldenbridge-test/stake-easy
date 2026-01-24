import 'package:flutter/material.dart';

class StakingScreen extends StatelessWidget {
    const StakingScreen({Key? key}) : super(key: key);

    @override
    Widget build(BuildContext context) {
        return Scaffold(
            appBar: AppBar(title: const Text('Staking')),
            body: const Center(child: Text('Interface de Staking')),
        );
    }
}
