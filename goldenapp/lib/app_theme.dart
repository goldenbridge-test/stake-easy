import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  // Palette de couleurs
  static const Color primaryBlue = Color(0xFF1E3A8A); // Bleu profond
  static const Color secondaryBlue = Color(0xFF3B82F6); // Bleu vif
  static const Color darkGrey = Color(0xFF1F2937); // Texte principal
  static const Color white = Color(0xFFFFFFFF); // Background / Negative space
  static const Color gold = Color(0xFFFACC15); // Touche premium

  // Couleurs fonctionnelles (reprises de learn.dart / homepage.dart)
  static const Color violet = Color(0xFF7C3AED); // Fin du dégradé futuriste
  static const Color success = Color(0xFF16A34A); // Gains, statut OK
  static const Color danger = Color(0xFFDC2626); // Pertes, erreurs
  static const Color warning = Color(0xFFF59E0B); // En attente
  static const Color mutedText = Color(0xFF64748B); // Texte secondaire
  static const Color border = Color(0xFFE2E8F0); // Bordures de cartes
  static const Color surfaceMuted = Color(0xFFF1F5F9); // Puces, fonds discrets
  static const Color inputFill = Color(0xFFF3F4F6); // Champs de saisie

  // Dégradés
  static const LinearGradient futuristicGradient = LinearGradient(
    colors: [primaryBlue, violet], // Bleu -> Violet
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Dégradé or pour les éléments premium (récompenses)
  static const LinearGradient goldGradient = LinearGradient(
    colors: [Color(0xFFFDE68A), gold],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Ombre douce commune aux cartes
  static List<BoxShadow> get cardShadow => [
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.06),
          blurRadius: 16,
          offset: const Offset(0, 6),
        ),
      ];
}

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primaryBlue,
        primary: AppColors.primaryBlue,
        secondary: AppColors.secondaryBlue,
        surface: AppColors.white,
        onSurface: AppColors.darkGrey,
      ),
      scaffoldBackgroundColor: AppColors.white,
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.primaryBlue,
        foregroundColor: AppColors.white,
        elevation: 0,
        centerTitle: true,
      ),
      textTheme: TextTheme(
        displayLarge: GoogleFonts.montserrat(
          fontSize: 32,
          fontWeight: FontWeight.bold,
          color: AppColors.primaryBlue,
        ),
        displayMedium: GoogleFonts.montserrat(
          fontSize: 24,
          fontWeight: FontWeight.bold,
          color: AppColors.primaryBlue,
        ),
        titleLarge: GoogleFonts.montserrat(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: AppColors.darkGrey,
        ),
        bodyLarge: GoogleFonts.openSans(
          fontSize: 16,
          color: AppColors.darkGrey,
        ),
        bodyMedium: GoogleFonts.openSans(
          fontSize: 14,
          color: AppColors.darkGrey,
        ),
        labelLarge: GoogleFonts.robotoMono(
          fontSize: 14,
          fontWeight: FontWeight.w500,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.inputFill,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.secondaryBlue, width: 2),
        ),
        hintStyle: GoogleFonts.openSans(color: Colors.grey[500]),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.gold,
          foregroundColor: AppColors.primaryBlue,
          minimumSize: const Size(double.infinity, 56),
          textStyle: GoogleFonts.openSans(
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 0,
        ),
      ),
      // Pas d'outlinedButtonTheme : les actions principales utilisent ElevatedButton (thème or).
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.secondaryBlue,
          textStyle: GoogleFonts.openSans(fontWeight: FontWeight.w600),
        ),
      ),
      snackBarTheme: const SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: AppColors.darkGrey,
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primaryBlue,
        brightness: Brightness.dark,
        primary: AppColors.primaryBlue,
        secondary: AppColors.secondaryBlue,
        surface: AppColors.darkGrey,
      ),
      scaffoldBackgroundColor: AppColors.darkGrey,
      textTheme: TextTheme(
        displayLarge: GoogleFonts.montserrat(
          fontSize: 32,
          fontWeight: FontWeight.bold,
          color: AppColors.white,
        ),
        bodyLarge: GoogleFonts.openSans(
          fontSize: 16,
          color: Colors.white70,
        ),
      ),
    );
  }
}
