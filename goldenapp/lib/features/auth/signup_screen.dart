import 'package:flutter/material.dart';
import '../../app_theme.dart';
import '../../core/services/auth_service.dart';
import '../../main_navigation.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _formKey = GlobalKey<FormState>();
  // Champs de RegisterSerializer : username, email, password, first_name, last_name.
  final _usernameController = TextEditingController();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _authService = AuthService();
  bool _isLoading = false;
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
    setState(() => _isLoading = true);
    try {
      // TODO(intégration) : AuthService.signup n'envoie encore que (email, password) ;
      // POST /api/accounts/register/ attend {username, email, password, first_name, last_name}
      // (valeurs disponibles dans les contrôleurs ci-dessus).
      await _authService.signup(_emailController.text.trim(), _passwordController.text);
      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const MainNavigation()),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
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
