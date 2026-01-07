import 'package:flutter/material.dart';
import '../../app_theme.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'login_screen.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({Key? key}) : super(key: key);

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<OnboardingItem> _items = [
    OnboardingItem(
      title: 'Investissez dans le Futur',
      description: 'Accédez aux meilleures opportunités Web3 et Finance Décentralisée avec une sécurité maximale.',
      icon: Icons.auto_awesome,
    ),
    OnboardingItem(
      title: 'Staking Simplifié',
      description: 'Générez des revenus passifs sur vos actifs numériques en quelques clics.',
      icon: Icons.account_balance_wallet,
    ),
    OnboardingItem(
      title: 'Suivi Premium',
      description: 'Visualisez vos performances avec des graphiques avancés et une interface épurée.',
      icon: Icons.analytics,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          PageView.builder(
            controller: _pageController,
            onPageChanged: (index) => setState(() => _currentPage = index),
            itemCount: _items.length,
            itemBuilder: (context, index) {
              return _buildPage(_items[index]);
            },
          ),
          Positioned(
            bottom: 40,
            left: 24,
            right: 24,
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(
                    _items.length,
                    (index) => _buildIndicator(index),
                  ),
                ),
                const SizedBox(height: 32),
                ElevatedButton(
                  onPressed: () {
                    if (_currentPage < _items.length - 1) {
                      _pageController.nextPage(
                        duration: const Duration(milliseconds: 400),
                        curve: Curves.easeInOut,
                      );
                    } else {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(builder: (context) => const LoginScreen()),
                      );
                    }
                  },
                  child: Text(_currentPage == _items.length - 1 ? 'Commencer' : 'Suivant'),
                ),
                const SizedBox(height: 12),
                if (_currentPage < _items.length - 1)
                  TextButton(
                    onPressed: () => _pageController.jumpToPage(_items.length - 1),
                    child: const Text(
                      'Passer',
                      style: TextStyle(color: AppColors.gold, fontWeight: FontWeight.bold),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPage(OnboardingItem item) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return Padding(
      padding: const EdgeInsets.all(40.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? AppColors.white.withOpacity(0.05) : AppColors.primaryBlue.withOpacity(0.05),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: (isDark ? AppColors.white : AppColors.primaryBlue).withOpacity(0.1),
                width: 1,
              ),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Image.asset(
                'assets/image.png',
                height: 140,
                width: 140,
                fit: BoxFit.contain,
              ),
            ),
          ).animate().scale(duration: 600.ms, curve: Curves.easeOutBack).fadeIn(),
          const SizedBox(height: 48),
          Text(
            item.title,
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.displayMedium,
          ).animate().slideY(begin: 0.2, duration: 400.ms).fadeIn(),
          const SizedBox(height: 16),
          Text(
            item.description,
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: AppColors.darkGrey.withOpacity(0.7),
                ),
          ).animate(delay: 200.ms).slideY(begin: 0.2, duration: 400.ms).fadeIn(),
        ],
      ),
    );
  }

  Widget _buildIndicator(int index) {
    bool isActive = _currentPage == index;
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      margin: const EdgeInsets.symmetric(horizontal: 4),
      height: 8,
      width: isActive ? 24 : 8,
      decoration: BoxDecoration(
        color: isActive ? AppColors.gold : AppColors.primaryBlue.withOpacity(0.2),
        borderRadius: BorderRadius.circular(4),
      ),
    );
  }
}

class OnboardingItem {
  final String title;
  final String description;
  final IconData icon;

  OnboardingItem({
    required this.title,
    required this.description,
    required this.icon,
  });
}
