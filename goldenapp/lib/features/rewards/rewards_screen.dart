import 'package:flutter/material.dart';

class RewardsScreen extends StatelessWidget {
    const RewardsScreen({Key? key}) : super(key: key);

    @override
    Widget build(BuildContext context) {
        return Scaffold(
            appBar: AppBar(title: const Text('Récompenses')),
            body: const Center(child: Text('Vos gains et rewards')),
        );
    }
}
