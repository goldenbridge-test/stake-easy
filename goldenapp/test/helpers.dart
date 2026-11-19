import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:goldenapp/app_theme.dart';

/// Désactive le téléchargement des polices Google pendant les tests.
void disableFontFetching() {
  GoogleFonts.config.allowRuntimeFetching = false;
}

/// Monte [child] dans une MaterialApp avec le thème de l'app.
Future<void> pumpApp(WidgetTester tester, Widget child) async {
  tester.view.physicalSize = const Size(1080, 2400);
  tester.view.devicePixelRatio = 2.75;
  addTearDown(tester.view.reset);
  await tester.pumpWidget(MaterialApp(theme: AppTheme.lightTheme, home: child));
}

/// Laisse les chargements factices (Future.delayed) se terminer.
Future<void> settle(WidgetTester tester) async {
  await tester.pump(const Duration(seconds: 2));
  await tester.pumpAndSettle();
}
