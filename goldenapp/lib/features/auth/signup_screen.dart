import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../app_theme.dart';
import '../../core/api/api_exception.dart';
import '../../core/providers/auth_providers.dart';
import 'widgets/form_error_banner.dart';

/// Inscription (POST /accounts/register/) puis ouverture de la session.
class SignupScreen extends ConsumerStatefulWidget {
  const SignupScreen({super.key});

  @override
  ConsumerState<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends ConsumerState<SignupScreen> {
  final _formKey = GlobalKey<FormState>();
  // Champs de RegisterSerializer : username, email, password, first_name, last_name.
  final _usernameController = TextEditingController();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  String? _error;

  /// Erreurs de validation renvoyées par Django, par champ.
  Map<String, List<String>> _fieldErrors = const {};

  static const _formFields = {'username', 'first_name', 'last_name', 'email', 'password'};

  String? _serverError(String field) {
    final errors = _fieldErrors[field];
    return errors == null || errors.isEmpty ? null : errors.join(' ');
  }

  /// Une erreur serveur bloque la validation du champ : on l'efface dès la saisie.
  void _clearServerError(String field) {
    if (!_fieldErrors.containsKey(field)) return;
    setState(() => _fieldErrors = Map.of(_fieldErrors)..remove(field));
  }
  bool _obscurePassword = true;
  bool _acceptedTerms = false;

  @override
  void dispose() {
    _usernameController.dispose();
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  String? _required(String? v, String message) => (v == null || v.trim().isEmpty) ? message : null;

  void _handleSignup() async {
    if (!_formKey.currentState!.validate()) return;
    if (!_acceptedTerms) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Veuillez accepter les Conditions Générales pour continuer')),
      );
      return;
    }
    FocusScope.of(context).unfocus();
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      await ref.read(authStateProvider.notifier).register(
            username: _usernameController.text.trim(),
            password: _passwordController.text,
            email: _emailController.text.trim(),
            firstName: _firstNameController.text.trim(),
            lastName: _lastNameController.text.trim(),
          );
      if (mounted) Navigator.of(context).popUntil((route) => route.isFirst);
    } on ApiException catch (e) {
      if (!mounted) return;
      // Les erreurs rattachées à un champ s'affichent sous ce champ.
      final onlyFieldErrors = e.fieldErrors.isNotEmpty && e.fieldErrors.keys.every(_formFields.contains);
      setState(() {
        _fieldErrors = e.fieldErrors;
        _error = onlyFieldErrors ? null : e.message;
      });
    } catch (_) {
      if (mounted) setState(() => _error = 'L\'inscription a échoué. Réessayez.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        iconTheme: const IconThemeData(color: AppColors.primaryBlue),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(32.0),
          child: Form(
            key: _formKey,
            child: AutofillGroup(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Créer un compte', style: Theme.of(context).textTheme.displayLarge),
                  const SizedBox(height: 8),
                  Text(
                    'Rejoignez l\'aventure GoldenBridge',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: Colors.grey),
                  ),
                  const SizedBox(height: 40),
                  TextFormField(
                    controller: _usernameController,
                    autocorrect: false,
                    textInputAction: TextInputAction.next,
                    autofillHints: const [AutofillHints.newUsername],
                    forceErrorText: _serverError('username'),
                    onChanged: (_) => _clearServerError('username'),
                    validator: (v) => _required(v, 'Choisissez un nom d\'utilisateur'),
                    decoration: const InputDecoration(
                      hintText: 'Nom d\'utilisateur',
                      prefixIcon: Icon(Icons.alternate_email_rounded),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _firstNameController,
                          textCapitalization: TextCapitalization.words,
                          textInputAction: TextInputAction.next,
                          autofillHints: const [AutofillHints.givenName],
                          forceErrorText: _serverError('first_name'),
                          onChanged: (_) => _clearServerError('first_name'),
                          validator: (v) => _required(v, 'Requis'),
                          decoration: const InputDecoration(
                            hintText: 'Prénom',
                            prefixIcon: Icon(Icons.person_outline),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextFormField(
                          controller: _lastNameController,
                          textCapitalization: TextCapitalization.words,
                          textInputAction: TextInputAction.next,
                          autofillHints: const [AutofillHints.familyName],
                          forceErrorText: _serverError('last_name'),
                          onChanged: (_) => _clearServerError('last_name'),
                          validator: (v) => _required(v, 'Requis'),
                          decoration: const InputDecoration(hintText: 'Nom'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    autocorrect: false,
                    textInputAction: TextInputAction.next,
                    autofillHints: const [AutofillHints.email],
                    forceErrorText: _serverError('email'),
                    onChanged: (_) => _clearServerError('email'),
                    validator: (v) {
                      final value = v?.trim() ?? '';
                      if (value.isEmpty) return 'Saisissez votre email';
                      if (!RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(value)) {
                        return 'Email invalide';
                      }
                      return null;
                    },
                    decoration: const InputDecoration(
                      hintText: 'Email',
                      prefixIcon: Icon(Icons.email_outlined),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _passwordController,
                    obscureText: _obscurePassword,
                    textInputAction: TextInputAction.done,
                    autofillHints: const [AutofillHints.newPassword],
                    forceErrorText: _serverError('password'),
                    onChanged: (_) => _clearServerError('password'),
                    validator: (v) =>
                        (v == null || v.length < 8) ? 'Au moins 8 caractères' : null,
                    decoration: InputDecoration(
                      hintText: 'Mot de passe',
                      prefixIcon: const Icon(Icons.lock_outline),
                      suffixIcon: IconButton(
                        tooltip: _obscurePassword ? 'Afficher' : 'Masquer',
                        icon: Icon(
                          _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                        ),
                        onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Checkbox(
                        value: _acceptedTerms,
                        activeColor: AppColors.primaryBlue,
                        onChanged: (v) => setState(() => _acceptedTerms = v ?? false),
                      ),
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => _acceptedTerms = !_acceptedTerms),
                          child: const Text(
                            'J\'accepte les Conditions Générales et la Politique de Confidentialité',
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),
                  if (_error != null) ...[
                    FormErrorBanner(message: _error!),
                    const SizedBox(height: 16),
                  ],
                  ElevatedButton(
                    onPressed: _isLoading ? null : _handleSignup,
                    child: _isLoading
                        ? const SizedBox(
                            width: 22,
                            height: 22,
                            child: CircularProgressIndicator(strokeWidth: 2.5),
                          )
                        : const Text('S\'inscrire'),
                  ),
                  const SizedBox(height: 32),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text('Déjà un compte ?'),
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Se connecter', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
