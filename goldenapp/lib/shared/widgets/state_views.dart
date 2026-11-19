import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../app_theme.dart';

/// Indicateur de chargement centré, avec message optionnel.
class LoadingView extends StatelessWidget {
  const LoadingView({super.key, this.message});

  final String? message;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(
              width: 36,
              height: 36,
              child: CircularProgressIndicator(
                strokeWidth: 3,
                color: AppColors.primaryBlue,
              ),
            ),
            if (message != null) ...[
              const SizedBox(height: 16),
              Text(
                message!,
                textAlign: TextAlign.center,
                style: GoogleFonts.openSans(color: AppColors.mutedText),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/// Bloc illustré commun à l'erreur et au vide.
class _StateMessage extends StatelessWidget {
  const _StateMessage({
    required this.icon,
    required this.iconColor,
    required this.iconBackground,
    required this.title,
    this.message,
    this.action,
  });

  final IconData icon;
  final Color iconColor;
  final Color iconBackground;
  final String title;
  final String? message;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: iconBackground,
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 40, color: iconColor),
            ),
            const SizedBox(height: 20),
            Text(
              title,
              textAlign: TextAlign.center,
              style: GoogleFonts.montserrat(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppColors.darkGrey,
              ),
            ),
            if (message != null) ...[
              const SizedBox(height: 8),
              Text(
                message!,
                textAlign: TextAlign.center,
                style: GoogleFonts.openSans(
                  color: AppColors.mutedText,
                  height: 1.5,
                ),
              ),
            ],
            if (action != null) ...[
              const SizedBox(height: 24),
              action!,
            ],
          ],
        ),
      ),
    );
  }
}

/// Erreur avec bouton « Réessayer ».
class ErrorView extends StatelessWidget {
  const ErrorView({
    super.key,
    this.title = 'Une erreur est survenue',
    required this.message,
    this.onRetry,
  });

  final String title;
  final String message;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    return _StateMessage(
      icon: Icons.cloud_off_rounded,
      iconColor: AppColors.danger,
      iconBackground: AppColors.danger.withValues(alpha: 0.08),
      title: title,
      message: message,
      action: onRetry == null
          ? null
          : SizedBox(
              width: 200,
              child: ElevatedButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh_rounded),
                label: const Text('Réessayer'),
              ),
            ),
    );
  }
}

/// État vide : icône + message, action facultative.
class EmptyView extends StatelessWidget {
  const EmptyView({
    super.key,
    required this.icon,
    required this.message,
    this.title,
    this.actionLabel,
    this.onAction,
  });

  final IconData icon;
  final String message;
  final String? title;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return _StateMessage(
      icon: icon,
      iconColor: AppColors.gold,
      iconBackground: AppColors.gold.withValues(alpha: 0.12),
      title: title ?? message,
      message: title == null ? null : message,
      action: actionLabel == null || onAction == null
          ? null
          : SizedBox(
              width: 220,
              child: ElevatedButton(
                onPressed: onAction,
                child: Text(actionLabel!),
              ),
            ),
    );
  }
}
