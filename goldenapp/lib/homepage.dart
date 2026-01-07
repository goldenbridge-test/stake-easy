import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'app_theme.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        child: Column(
          children: [
            const HeaderSection(),
            const HeroSection(),
            const ValuePropositionSection(),
            const FeaturesSection(),
            const TestimonialsSection(),
            const HowItWorksSection(),
            const InvestmentOptionsSection(),
            const CTASection(),
            const FAQSection(),
            const FooterSection(),
          ],
        ),
      ),
    );
  }
}

class HeaderSection extends StatelessWidget {
  const HeaderSection({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isSmallScreen = MediaQuery.of(context).size.width < 768;

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isSmallScreen ? 16 : 24,
        vertical: 16,
      ),
      color: AppColors.primaryBlue,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Icon(Icons.auto_awesome, color: Colors.amber[300], size: 28),
              if (!isSmallScreen) ...[
                const SizedBox(width: 8),
                const Text(
                  'GoldenSky Fundiverse',
                  style: TextStyle(
                    color: AppColors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 20,
                  ),
                ),
              ],
            ],
          ),
          if (!isSmallScreen)
            Row(
              children: [
                NavItem(title: 'Accueil', isActive: true),
                NavItem(title: 'Investir'),
                NavItem(title: 'Comment ça marche'),
                NavItem(title: 'À propos'),
                const SizedBox(width: 16),
                ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.gold,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 20, vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: const Text(
                    'Commencer',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            )
          else
            IconButton(
              icon: const Icon(Icons.menu, color: Colors.white),
              onPressed: () {
                // Ouvrir un drawer ou menu mobile
              },
            ),
        ],
      ),
    );
  }
}

class NavItem extends StatelessWidget {
  final String title;
  final bool isActive;

  const NavItem({
    Key? key,
    required this.title,
    this.isActive = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: Text(
        title,
        style: TextStyle(
          color: isActive ? AppColors.gold : AppColors.white,
          fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
        ),
      ),
    );
  }
}

class HeroSection extends StatelessWidget {
  const HeroSection({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isSmallScreen = MediaQuery.of(context).size.width < 768;

    return Container(
      height: isSmallScreen ? 500 : 600,
      decoration: const BoxDecoration(
        color: AppColors.primaryBlue,
      ),
      child: Stack(
        children: [
          Positioned.fill(
            child: Opacity(
              opacity: 0.4,
              child: Image.network(
                '/api/placeholder/800/600',
                fit: BoxFit.cover,
              ),
            ),
          ),
          Center(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: isSmallScreen ? 16 : 24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(height: 40),
                  Text(
                    'Investir dans le futur n\'a jamais été aussi simple',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: isSmallScreen ? 28 : 42,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      height: 1.2,
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: isSmallScreen ? double.infinity : 600,
                    child: const Text(
                      'Découvrez une nouvelle façon d\'investir avec GoldenSky Fundiverse. Accédez à des opportunités d\'investissement exclusives à partir de seulement 100€.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.white70,
                        height: 1.5,
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                  isSmallScreen
                      ? Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: () {},
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.gold,
                                  foregroundColor: Colors.black,
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 32, vertical: 16),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),
                                child: const Text(
                                  'Commencer à investir',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 12),
                            SizedBox(
                              width: double.infinity,
                              child: OutlinedButton(
                                onPressed: () {},
                                style: OutlinedButton.styleFrom(
                                  side: BorderSide(color: Colors.amber[300]!),
                                  foregroundColor: Colors.amber[300],
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 32, vertical: 16),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),
                                child: const Text(
                                  'En savoir plus',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        )
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            ElevatedButton(
                              onPressed: () {},
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.gold,
                                foregroundColor: Colors.black,
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 32, vertical: 16),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                              child: const Text(
                                'Commencer à investir',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                            ),
                            const SizedBox(width: 16),
                            OutlinedButton(
                              onPressed: () {},
                              style: OutlinedButton.styleFrom(
                                side: BorderSide(color: Colors.amber[300]!),
                                foregroundColor: Colors.amber[300],
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 32, vertical: 16),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                              child: const Text(
                                'En savoir plus',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                            ),
                          ],
                        ),
                ],
              ),
            ),
          ),
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 16),
              color: Colors.black.withOpacity(0.7),
              child: isSmallScreen
                  ? Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: const [
                            StatItem(value: '€15M+', label: 'Investis'),
                            StatItem(value: '45K+', label: 'Utilisateurs'),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: const [
                            StatItem(value: '200+', label: 'Projets financés'),
                            StatItem(value: '12%', label: 'Rendement moyen'),
                          ],
                        ),
                      ],
                    )
                  : const Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        StatItem(value: '€15M+', label: 'Investis'),
                        StatItem(value: '45K+', label: 'Utilisateurs'),
                        StatItem(value: '200+', label: 'Projets financés'),
                        StatItem(value: '12%', label: 'Rendement moyen'),
                      ],
                    ),
            ),
          ),
        ],
      ),
    );
  }
}

class StatItem extends StatelessWidget {
  final String value;
  final String label;

  const StatItem({
    Key? key,
    required this.value,
    required this.label,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppColors.gold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(
              fontSize: 14,
              color: Colors.white70,
            ),
          ),
        ],
      ),
    );
  }
}

class ValuePropositionSection extends StatelessWidget {
  const ValuePropositionSection({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isSmallScreen = MediaQuery.of(context).size.width < 768;

    return Container(
      padding: EdgeInsets.symmetric(
        vertical: isSmallScreen ? 40 : 80,
        horizontal: isSmallScreen ? 16 : 24,
      ),
      color: Colors.white,
      child: Column(
        children: [
          Text(
            'Pourquoi choisir GoldenSky?',
            style: TextStyle(
              fontSize: isSmallScreen ? 28 : 36,
              fontWeight: FontWeight.bold,
              color: AppColors.primaryBlue,
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: isSmallScreen ? double.infinity : 700,
            child: const Text(
              'Nous vous offrons une expérience d\'investissement unique, combinant technologie de pointe et opportunités exclusives pour maximiser votre potentiel financier.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 16,
                color: Colors.black54,
                height: 1.5,
              ),
            ),
          ),
           SizedBox(height: isSmallScreen ? 32 : 64),
          isSmallScreen
              ? Column(
                  children: [
                    ValueCard(
                      icon: Icons.security,
                      title: 'Sécurité maximale',
                      description:
                          'Vos investissements sont protégés par les technologies de cryptographie les plus avancées.',
                    ),
                    const SizedBox(height: 16),
                    ValueCard(
                      icon: Icons.auto_graph,
                      title: 'Rendements attractifs',
                      description:
                          'Accédez à des opportunités d\'investissement à haut rendement, soigneusement sélectionnées.',
                    ),
                    const SizedBox(height: 16),
                    ValueCard(
                      icon: Icons.accessibility_new,
                      title: 'Accessibilité pour tous',
                      description:
                          'Commencez à investir dès 100€, sans frais cachés ni commission exorbitante.',
                    ),
                    const SizedBox(height: 16),
                    ValueCard(
                      icon: Icons.verified_user,
                      title: 'Conformité réglementaire',
                      description:
                          'Tous nos produits financiers sont conformes aux réglementations européennes les plus strictes.',
                    ),
                  ],
                )
              : SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    children: [
                      ValueCard(
                        icon: Icons.security,
                        title: 'Sécurité maximale',
                        description:
                            'Vos investissements sont protégés par les technologies de cryptographie les plus avancées.',
                      ),
                      const SizedBox(width: 24),
                      ValueCard(
                        icon: Icons.auto_graph,
                        title: 'Rendements attractifs',
                        description:
                            'Accédez à des opportunités d\'investissement à haut rendement, soigneusement sélectionnées.',
                      ),
                      const SizedBox(width: 24),
                      ValueCard(
                        icon: Icons.accessibility_new,
                        title: 'Accessibilité pour tous',
                        description:
                            'Commencez à investir dès 100€, sans frais cachés ni commission exorbitante.',
                      ),
                      const SizedBox(width: 24),
                      ValueCard(
                        icon: Icons.verified_user,
                        title: 'Conformité réglementaire',
                        description:
                            'Tous nos produits financiers sont conformes aux réglementations européennes les plus strictes.',
                      ),
                    ],
                  ),
                ),
        ],
      ),
    );
  }
}

class ValueCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;

  const ValueCard({
    Key? key,
    required this.icon,
    required this.title,
    required this.description,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isSmallScreen = MediaQuery.of(context).size.width < 768;

    return Container(
      width: isSmallScreen ? double.infinity : 300,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.amber[50],
              shape: BoxShape.circle,
            ),
            child: Icon(
              icon,
              size: 40,
              color: AppColors.gold,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            title,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1F2024),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            description,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 16,
              color: Colors.black54,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}

class FeaturesSection extends StatelessWidget {
  const FeaturesSection({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isSmallScreen = MediaQuery.of(context).size.width < 768;

    return Container(
      padding: EdgeInsets.symmetric(
        vertical: isSmallScreen ? 40 : 80,
        horizontal: isSmallScreen ? 16 : 24,
      ),
      color: const Color(0xFFF8F9FA),
      child: Column(
        children: [
          Text(
            'Des fonctionnalités conçues pour vous',
            style: TextStyle(
              fontSize: isSmallScreen ? 28 : 36,
              fontWeight: FontWeight.bold,
              color: AppColors.primaryBlue,
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: isSmallScreen ? double.infinity : 700,
            child: const Text(
              'Notre plateforme est dotée d\'outils puissants et intuitifs pour vous aider à prendre des décisions d\'investissement éclairées.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 16,
                color: Colors.black54,
                height: 1.5,
              ),
            ),
          ),
           SizedBox(height: isSmallScreen ? 32 : 64),
          FeatureRow(
            title: 'Tableau de bord personnalisé',
            description:
                'Visualisez l\'ensemble de vos investissements et suivez leurs performances en temps réel grâce à notre interface intuitive.',
            imagePath: '/api/placeholder/600/400',
            isImageLeft: false,
            isSmallScreen: isSmallScreen,
          ),
          SizedBox(height: isSmallScreen ? 40 : 80),
          FeatureRow(
            title: 'Diversification optimisée',
            description:
                'Notre algorithme d\'intelligence artificielle vous propose un portefeuille d\'investissements diversifié selon votre profil de risque.',
            imagePath: '/api/placeholder/600/400',
            isImageLeft: true,
            isSmallScreen: isSmallScreen,
          ),
          SizedBox(height: isSmallScreen ? 40 : 80),
          FeatureRow(
            title: 'Investissement automatisé',
            description:
                'Définissez vos objectifs financiers et laissez notre système investir automatiquement selon vos préférences et votre stratégie.',
            imagePath: '/api/placeholder/600/400',
            isImageLeft: false,
            isSmallScreen: isSmallScreen,
          ),
        ],
      ),
    );
  }
}

class FeatureRow extends StatelessWidget {
  final String title;
  final String description;
  final String imagePath;
  final bool isImageLeft;
  final bool isSmallScreen;

  const FeatureRow({
    Key? key,
    required this.title,
    required this.description,
    required this.imagePath,
    required this.isImageLeft,
    required this.isSmallScreen,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final contentWidget = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: TextStyle(
            fontSize: isSmallScreen ? 24 : 28,
            fontWeight: FontWeight.bold,
            color: AppColors.primaryBlue,
          ),
        ),
        const SizedBox(height: 16),
        Text(
          description,
          style: TextStyle(
            fontSize: isSmallScreen ? 16 : 18,
            color: Colors.black54,
            height: 1.5,
          ),
        ),
        const SizedBox(height: 24),
        TextButton(
          onPressed: () {},
          style: TextButton.styleFrom(
            foregroundColor: Colors.amber[700],
            padding: EdgeInsets.zero,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'En savoir plus',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(width: 8),
              Icon(
                Icons.arrow_forward,
                size: 16,
                color: AppColors.gold,
              ),
            ],
          ),
        ),
      ],
    );

    final imageWidget = ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: Image.network(
        imagePath,
        width: isSmallScreen ? double.infinity : 500,
        height: isSmallScreen ? 200 : 320,
        fit: BoxFit.cover,
      ),
    );

    if (isSmallScreen) {
      return Column(
        children: [
          imageWidget,
          const SizedBox(height: 24),
          contentWidget,
        ],
      );
    }

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (isImageLeft) ...[
          imageWidget,
          const SizedBox(width: 80),
          SizedBox(width: 400, child: contentWidget),
        ] else ...[
          SizedBox(width: 400, child: contentWidget),
          const SizedBox(width: 80),
          imageWidget,
        ],
      ],
    );
  }
}

class TestimonialsSection extends StatelessWidget {
  const TestimonialsSection({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isSmallScreen = MediaQuery.of(context).size.width < 768;

    return Container(
      padding: EdgeInsets.symmetric(
        vertical: isSmallScreen ? 40 : 80,
        horizontal: isSmallScreen ? 16 : 24,
      ),
      color: Colors.white,
      child: Column(
        children: [
          Text(
            'Ce que nos utilisateurs disent',
            style: TextStyle(
              fontSize: isSmallScreen ? 28 : 36,
              fontWeight: FontWeight.bold,
              color: AppColors.primaryBlue,
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: isSmallScreen ? double.infinity : 700,
            child: const Text(
              'Découvrez les témoignages de nos utilisateurs qui ont fait confiance à GoldenSky pour leurs investissements.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 16,
                color: Colors.black54,
                height: 1.5,
              ),
            ),
          ),
          SizedBox(height: isSmallScreen ? 32 : 64),
          isSmallScreen
              ? Column(
                  children: [
                    TestimonialCard(
                      name: 'Sophie Martin',
                      role: 'Investisseur particulier',
                      content:
                          'GoldenSky a complètement transformé ma façon d\'investir. L\'interface est intuitive et les opportunités d\'investissement sont vraiment intéressantes. J\'ai déjà recommandé la plateforme à mes proches.',
                      avatarUrl: '/api/placeholder/100/100',
                    ),
                    const SizedBox(height: 16),
                    TestimonialCard(
                      name: 'Thomas Durand',
                      role: 'Entrepreneur',
                      content:
                          'En tant qu\'entrepreneur, je cherchais un moyen simple de diversifier mes investissements. GoldenSky répond parfaitement à mes attentes avec ses options d\'investissement automatisé et son excellent service client.',
                      avatarUrl: '/api/placeholder/100/100',
                    ),
                    const SizedBox(height: 16),
                    TestimonialCard(
                      name: 'Marie Leroy',
                      role: 'Conseiller financier',
                      content:
                          'Je recommande régulièrement GoldenSky à mes clients. La plateforme offre un excellent équilibre entre rendement et sécurité, avec une transparence totale sur les frais et les performances.',
                      avatarUrl: '/api/placeholder/100/100',
                    ),
                  ],
                )
              : SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    children: [
                      TestimonialCard(
                        name: 'Sophie Martin',
                        role: 'Investisseur particulier',
                        content:
                            'GoldenSky a complètement transformé ma façon d\'investir. L\'interface est intuitive et les opportunités d\'investissement sont vraiment intéressantes. J\'ai déjà recommandé la plateforme à mes proches.',
                        avatarUrl: '/api/placeholder/100/100',
                      ),
                      const SizedBox(width: 24),
                      TestimonialCard(
                        name: 'Thomas Durand',
                        role: 'Entrepreneur',
                        content:
                            'En tant qu\'entrepreneur, je cherchais un moyen simple de diversifier mes investissements. GoldenSky répond parfaitement à mes attentes avec ses options d\'investissement automatisé et son excellent service client.',
                        avatarUrl: '/api/placeholder/100/100',
                      ),
                      const SizedBox(width: 24),
                      TestimonialCard(
                        name: 'Marie Leroy',
                        role: 'Conseiller financier',
                        content:
                            'Je recommande régulièrement GoldenSky à mes clients. La plateforme offre un excellent équilibre entre rendement et sécurité, avec une transparence totale sur les frais et les performances.',
                        avatarUrl: '/api/placeholder/100/100',
                      ),
                    ],
                  ),
                ),
        ],
      ),
    );
  }
}

class TestimonialCard extends StatelessWidget {
  final String name;
  final String role;
  final String content;
  final String avatarUrl;

  const TestimonialCard({
    Key? key,
    required this.name,
    required this.role,
    required this.content,
    required this.avatarUrl,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 300,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.format_quote,
                size: 40,
                color: AppColors.gold,
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            content,
            style: const TextStyle(
              fontSize: 16,
              color: Colors.black87,
              height: 1.6,
            ),
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(50),
                child: Image.network(
                  avatarUrl,
                  width: 50,
                  height: 50,
                  fit: BoxFit.cover,
                ),
              ),
              const SizedBox(width: 16),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1F2024),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    role,
                    style: const TextStyle(
                      fontSize: 14,
                      color: Colors.black54,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class HowItWorksSection extends StatelessWidget {
  const HowItWorksSection({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isSmallScreen = MediaQuery.of(context).size.width < 768;

    return Container(
      padding: EdgeInsets.symmetric(
        vertical: isSmallScreen ? 40 : 80,
        horizontal: isSmallScreen ? 16 : 24,
      ),
      color: const Color(0xFFF8F9FA),
      child: Column(
        children: [
          Text(
            'Comment ça marche',
            style: TextStyle(
              fontSize: isSmallScreen ? 28 : 36,
              fontWeight: FontWeight.bold,
              color: AppColors.primaryBlue,
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: isSmallScreen ? double.infinity : 700,
            child: const Text(
              'Investir avec GoldenSky est simple, rapide et sécurisé. Suivez ces étapes pour commencer votre parcours d\'investissement.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 16,
                color: Colors.black54,
                height: 1.5,
              ),
            ),
          ),
          SizedBox(height: isSmallScreen ? 32 : 64),
          isSmallScreen
              ? Column(
                  children: [
                    StepCard(
                      number: '1',
                      title: 'Créez votre compte',
                      description:
                          'Inscrivez-vous gratuitement en quelques minutes et complétez votre profil d\'investisseur.',
                    ),
                    const SizedBox(height: 16),
                    StepCard(
                      number: '2',
                      title: 'Définissez vos objectifs',
                      description:
                          'Précisez vos objectifs financiers et votre tolérance au risque pour des recommandations personnalisées.',
                    ),
                    const SizedBox(height: 16),
                    StepCard(
                      number: '3',
                      title: 'Investissez',
                      description:
                          'Financez votre compte et commencez à investir dans des opportunités soigneusement sélectionnées.',
                    ),
                    const SizedBox(height: 16),
                    StepCard(
                      number: '4',
                      title: 'Suivez vos performances',
                      description:
                          'Visualisez la croissance de vos investissements et recevez des rapports détaillés régulièrement.',
                    ),
                  ],
                )
              : SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    children: [
                      StepCard(
                        number: '1',
                        title: 'Créez votre compte',
                        description:
                            'Inscrivez-vous gratuitement en quelques minutes et complétez votre profil d\'investisseur.',
                      ),
                      const SizedBox(width: 24),
                      StepCard(
                        number: '2',
                        title: 'Définissez vos objectifs',
                        description:
                            'Précisez vos objectifs financiers et votre tolérance au risque pour des recommandations personnalisées.',
                      ),
                      const SizedBox(width: 24),
                      StepCard(
                        number: '3',
                        title: 'Investissez',
                        description:
                            'Financez votre compte et commencez à investir dans des opportunités soigneusement sélectionnées.',
                      ),
                      const SizedBox(width: 24),
                      StepCard(
                        number: '4',
                        title: 'Suivez vos performances',
                        description:
                            'Visualisez la croissance de vos investissements et recevez des rapports détaillés régulièrement.',
                      ),
                    ],
                  ),
                ),
        ],
      ),
    );
  }
}

class StepCard extends StatelessWidget {
  final String number;
  final String title;
  final String description;

  const StepCard({
    Key? key,
    required this.number,
    required this.title,
    required this.description,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 220,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.gold,
            ),
            child: Center(
              child: Text(
                number,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            title,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1F2024),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            description,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 14,
              color: Colors.black54,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}

class InvestmentOptionsSection extends StatelessWidget {
  const InvestmentOptionsSection({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isSmallScreen = MediaQuery.of(context).size.width < 768;

    return Container(
      padding: EdgeInsets.symmetric(
        vertical: isSmallScreen ? 40 : 80,
        horizontal: isSmallScreen ? 16 : 24,
      ),
      color: Colors.white,
      child: Column(
        children: [
          Text(
            'Nos options d\'investissement',
            style: TextStyle(
              fontSize: isSmallScreen ? 28 : 36,
              fontWeight: FontWeight.bold,
              color: AppColors.primaryBlue,
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: isSmallScreen ? double.infinity : 700,
            child: const Text(
              'Découvrez nos différentes options d\'investissement adaptées à tous les profils, des plus conservateurs aux plus audacieux.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 16,
                color: Colors.black54,
                height: 1.5,
              ),
            ),
          ),
           SizedBox(height: isSmallScreen ? 32 : 64),
          isSmallScreen
              ? Column(
                  children: [
                    InvestmentCard(
                      title: 'Starter',
                      price: '100€',
                      description: 'Idéal pour débuter',
                      features: [
                        'Investissement à partir de 100€',
                        'Accès aux opportunités de base',
                        'Rendement annuel estimé: 5-8%',
                        'Frais de gestion: 1%',
                      ],
                      isPopular: false,
                    ),
                    const SizedBox(height: 16),
                    InvestmentCard(
                      title: 'Growth',
                      price: '1 000€',
                      description: 'Notre option la plus populaire',
                      features: [
                        'Investissement à partir de 1 000€',
                        'Accès à toutes les opportunités',
                        'Rendement annuel estimé: 8-12%',
                        'Frais de gestion: 0.8%',
                        'Conseiller dédié',
                      ],
                      isPopular: true,
                    ),
                    const SizedBox(height: 16),
                    InvestmentCard(
                      title: 'Elite',
                      price: '10 000€',
                      description: 'Pour les investisseurs expérimentés',
                      features: [
                        'Investissement à partir de 10 000€',
                        'Accès aux opportunités premium',
                        'Rendement annuel estimé: 10-15%',
                        'Frais de gestion: 0.5%',
                        'Conseiller dédié premium',
                        'Invitations à des événements exclusifs',
                      ],
                      isPopular: false,
                    ),
                  ],
                )
              : SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    children: [
                      InvestmentCard(
                        title: 'Starter',
                        price: '100€',
                        description: 'Idéal pour débuter',
                        features: [
                          'Investissement à partir de 100€',
                          'Accès aux opportunités de base',
                          'Rendement annuel estimé: 5-8%',
                          'Frais de gestion: 1%',
                        ],
                        isPopular: false,
                      ),
                      const SizedBox(width: 24),
                      InvestmentCard(
                        title: 'Growth',
                        price: '1 000€',
                        description: 'Notre option la plus populaire',
                        features: [
                          'Investissement à partir de 1 000€',
                          'Accès à toutes les opportunités',
                          'Rendement annuel estimé: 8-12%',
                          'Frais de gestion: 0.8%',
                          'Conseiller dédié',
                        ],
                        isPopular: true,
                      ),
                      const SizedBox(width: 24),
                      InvestmentCard(
                        title: 'Elite',
                        price: '10 000€',
                        description: 'Pour les investisseurs expérimentés',
                        features: [
                          'Investissement à partir de 10 000€',
                          'Accès aux opportunités premium',
                          'Rendement annuel estimé: 10-15%',
                          'Frais de gestion: 0.5%',
                          'Conseiller dédié premium',
                          'Invitations à des événements exclusifs',
                        ],
                        isPopular: false,
                      ),
                    ],
                  ),
                ),
        ],
      ),
    );
  }
}

class InvestmentCard extends StatelessWidget {
  final String title;
  final String price;
  final String description;
  final List<String> features;
  final bool isPopular;

  const InvestmentCard({
    Key? key,
    required this.title,
    required this.price,
    required this.description,
    required this.features,
    required this.isPopular,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 300,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: isPopular ? const Color(0xFF1F2024) : Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
        border: isPopular
            ? Border.all(color: Colors.amber[300]!, width: 2)
            : Border.all(color: Colors.grey[200]!, width: 1),
      ),
      child: Column(
        children: [
          if (isPopular)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.gold,
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Text(
                'Le plus populaire',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),
              ),
            ),
          const SizedBox(height: 16),
          Text(
            title,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: isPopular ? Colors.white : const Color(0xFF1F2024),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            description,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: isPopular ? Colors.white70 : Colors.black54,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            price,
            style: TextStyle(
              fontSize: 36,
              fontWeight: FontWeight.bold,
              color: isPopular ? Colors.amber[300] : const Color(0xFF1F2024),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Investissement minimum',
            style: TextStyle(
              fontSize: 14,
              color: isPopular ? Colors.white70 : Colors.black54,
            ),
          ),
          const SizedBox(height: 24),
          Column(
            children: features.map((feature) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Row(
                  children: [
                    Icon(
                      Icons.check_circle,
                      size: 20,
                      color: isPopular ? Colors.amber[300] : Colors.green,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        feature,
                        style: TextStyle(
                          fontSize: 14,
                          color: isPopular ? Colors.white : Colors.black87,
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {},
              style: ElevatedButton.styleFrom(
                backgroundColor: isPopular ? Colors.amber[300] : const Color(0xFF1F2024),
                foregroundColor: isPopular ? Colors.black : Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: const Text(
                'Commencer',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class CTASection extends StatelessWidget {
  const CTASection({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 80, horizontal: 24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            const Color(0xFF1F2024),
            const Color(0xFF1F2024).withOpacity(0.8),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        children: [
          const Text(
            'Prêt à commencer votre parcours d\'investissement?',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 36,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 16),
          const SizedBox(
            width: 700,
            child: Text(
              'Rejoignez des milliers d\'investisseurs qui ont déjà fait confiance à GoldenSky Fundiverse pour atteindre leurs objectifs financiers.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 18,
                color: Colors.white70,
                height: 1.5,
              ),
            ),
          ),
          const SizedBox(height: 40),
          ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.amber[300],
              foregroundColor: Colors.black,
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text(
              'Créer un compte gratuitement',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class FAQSection extends StatelessWidget {
  const FAQSection({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 80, horizontal: 24),
      color: Colors.white,
      child: Column(
        children: [
          const Text(
            'Questions fréquentes',
            style: TextStyle(
              fontSize: 36,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1F2024),
            ),
          ),
          const SizedBox(height: 16),
          const SizedBox(
            width: 700,
            child: Text(
              'Vous avez des questions? Nous avons les réponses. Si vous ne trouvez pas ce que vous cherchez, n\'hésitez pas à nous contacter.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 18,
                color: Colors.black54,
                height: 1.5,
              ),
            ),
          ),
          const SizedBox(height: 64),
          SizedBox(
            width: 800,
            child: Column(
              children: [
                FAQItem(
                  question: 'Comment puis-je commencer à investir sur GoldenSky?',
                  answer: 'Pour commencer à investir, créez simplement un compte, complétez votre profil d\'investisseur, financez votre compte et choisissez parmi nos opportunités d\'investissement disponibles. Notre équipe est disponible pour vous guider à chaque étape.',
                ),
                const SizedBox(height: 16),
                FAQItem(
                  question: 'Quels sont les frais associés aux investissements?',
                  answer: 'Nos frais varient selon le niveau d\'investissement choisi, allant de 0,5% à 1% de frais de gestion annuels. Nous ne facturons pas de frais cachés ou de commissions supplémentaires. Pour plus de détails, consultez notre page de tarification.',
                ),
                const SizedBox(height: 16),
                FAQItem(
                  question: 'Comment mes investissements sont-ils sécurisés?',
                  answer: 'La sécurité est notre priorité absolue. Nous utilisons des technologies de cryptographie avancées pour protéger vos données et vos investissements. De plus, tous les investissements sont diversifiés et soumis à une évaluation rigoureuse des risques.',
                ),
                const SizedBox(height: 16),
                FAQItem(
                  question: 'Puis-je retirer mes fonds à tout moment?',
                  answer: 'La plupart de nos opportunités d\'investissement permettent un retrait flexible, mais certains projets peuvent avoir des périodes de blocage spécifiques. Les conditions de retrait sont toujours clairement indiquées avant que vous n\'investissiez.',
                ),
                const SizedBox(height: 16),
                FAQItem(
                  question: 'GoldenSky est-il disponible dans mon pays?',
                  answer: 'GoldenSky est actuellement disponible dans la plupart des pays européens. Nous travaillons activement à étendre notre présence mondiale. Veuillez vérifier notre page de disponibilité pour confirmer si le service est accessible dans votre région.',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class FAQItem extends StatefulWidget {
  final String question;
  final String answer;

  const FAQItem({
    Key? key,
    required this.question,
    required this.answer,
  }) : super(key: key);

  @override
  _FAQItemState createState() => _FAQItemState();
}

class _FAQItemState extends State<FAQItem> {
  bool isExpanded = false;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[200]!),
        borderRadius: BorderRadius.circular(8),
      ),
      child: ExpansionTile(
        title: Text(
          widget.question,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Color(0xFF1F2024),
          ),
        ),
        trailing: Icon(
          isExpanded ? Icons.remove : Icons.add,
          color: AppColors.primaryBlue,
        ),
        onExpansionChanged: (expanded) {
          setState(() {
            isExpanded = expanded;
          });
        },
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Text(
              widget.answer,
              style: const TextStyle(
                fontSize: 16,
                color: Colors.black87,
                height: 1.5,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class FooterSection extends StatelessWidget {
  const FooterSection({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 60, horizontal: 24),
      color: AppColors.primaryBlue,
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.auto_awesome, color: Colors.amber[300], size: 28),
                      const SizedBox(width: 8),
                      const Text(
                        'GoldenSky Fundiverse',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 20,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const SizedBox(
                    width: 300,
                    child: Text(
                      'Transformez votre avenir financier avec des investissements intelligents et accessibles.',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.white70,
                        height: 1.5,
                      ),
                    ),
                  ),
                ],
              ),
              FooterLinksColumn(
                title: 'À propos',
                links: [
                  'Notre mission',
                  'Notre équipe',
                  'Carrières',
                  'Presse',
                  'Partenaires',
                ],
              ),
              FooterLinksColumn(
                title: 'Produits',
                links: [
                  'Investissements',
                  'Portefeuilles',
                  'Plans d\'épargne',
                  'Pour les entreprises',
                  'API',
                ],
              ),
              FooterLinksColumn(
                title: 'Support',
                links: [
                  'Centre d\'aide',
                  'FAQ',
                  'Contact',
                  'Sécurité',
                  'Blog',
                ],
              ),
              FooterLinksColumn(
                title: 'Légal',
                links: [
                  'Conditions d\'utilisation',
                  'Politique de confidentialité',
                  'Politique de cookies',
                  'Mentions légales',
                  'Conformité',
                ],
              ),
            ],
          ),
          const SizedBox(height: 40),
          const Divider(color: Colors.white24),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                '© 2025 GoldenSky Fundiverse. Tous droits réservés.',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.white70,
                ),
              ),
              Row(
                children: [
                  SocialIcon(icon: Icons.facebook),
                  const SizedBox(width: 16),
                  SocialIcon(icon: Icons.person),
                  const SizedBox(width: 16),
                  SocialIcon(icon: Icons.telegram),
                  const SizedBox(width: 16),
                  SocialIcon(icon: Icons.email),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class FooterLinksColumn extends StatelessWidget {
  final String title;
  final List<String> links;

  const FooterLinksColumn({
    Key? key,
    required this.title,
    required this.links,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 16),
        ...links.map((link) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Text(
              link,
              style: const TextStyle(
                fontSize: 14,
                color: Colors.white70,
              ),
            ),
          );
        }).toList(),
      ],
    );
  }
}

class SocialIcon extends StatelessWidget {
  final IconData icon;

  const SocialIcon({
    Key? key,
    required this.icon,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.white24,
        shape: BoxShape.circle,
      ),
      child: Icon(
        icon,
        size: 20,
        color: Colors.white,
      ),
    );
  }
}