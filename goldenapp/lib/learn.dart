import 'package:flutter/material.dart';
import 'app_theme.dart';
import 'package:google_fonts/google_fonts.dart';

class LearningResource {
  final String id;
  final String title;
  final String description;
  final String category;
  final String format;
  final String duration;
  final String author;
  final String imageUrl;

  LearningResource({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.format,
    required this.duration,
    required this.author,
    required this.imageUrl,
  });
}

class LearnPage extends StatefulWidget {
  const LearnPage({Key? key}) : super(key: key);

  @override
  State<LearnPage> createState() => _LearnPageState();
}

class _LearnPageState extends State<LearnPage> {
  String selectedCategory = 'All';
  String selectedFormat = 'All';

  final List<String> categories = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  final List<String> formats = ['All', 'course', 'video', 'guide'];

  final List<LearningResource> learningResources = [
    LearningResource(
      id: 'learn-1',
      title: 'Web3 Investment Fundamentals',
      description: 'Learn the core principles of blockchain investments and how to evaluate Web3 projects.',
      category: 'Beginner',
      format: 'course',
      duration: '3 hours',
      author: 'Nova Academy',
      imageUrl: 'https://images.pexels.com/photos/6771900/pexels-photo-6771900.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ),
    LearningResource(
      id: 'learn-2',
      title: 'DeFi Yield Strategies',
      description: 'Discover advanced strategies for generating yield in decentralized finance protocols.',
      category: 'Advanced',
      format: 'video',
      duration: '45 minutes',
      author: 'DeFi Insights',
      imageUrl: 'https://images.pexels.com/photos/7567486/pexels-photo-7567486.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ),
    LearningResource(
      id: 'learn-3',
      title: 'NFT Valuation Models',
      description: 'Explore different frameworks for valuing non-fungible tokens in various market conditions.',
      category: 'Intermediate',
      format: 'guide',
      duration: '20 min read',
      author: 'NFT Analysts',
      imageUrl: 'https://images.pexels.com/photos/7788009/pexels-photo-7788009.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ),
    LearningResource(
      id: 'learn-4',
      title: 'Layer 1 vs Layer 2 Investments',
      description: 'Comparing investment opportunities in base layer protocols versus scaling solutions.',
      category: 'Intermediate',
      format: 'course',
      duration: '2 hours',
      author: 'Blockchain Institute',
      imageUrl: 'https://images.pexels.com/photos/8370752/pexels-photo-8370752.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ),
    LearningResource(
      id: 'learn-5',
      title: 'Tax Implications of Crypto Investing',
      description: 'Understanding the tax considerations for cryptocurrency investments across jurisdictions.',
      category: 'Intermediate',
      format: 'guide',
      duration: '30 min read',
      author: 'Crypto Tax Experts',
      imageUrl: 'https://images.pexels.com/photos/6802042/pexels-photo-6802042.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ),
    LearningResource(
      id: 'learn-6',
      title: 'Security Best Practices for Web3',
      description: 'Essential security measures to protect your digital assets from common threats.',
      category: 'Beginner',
      format: 'video',
      duration: '35 minutes',
      author: 'Security Academy',
      imageUrl: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ),
  ];

  List<LearningResource> get filteredResources {
    return learningResources.where((resource) {
      final matchesCategory = selectedCategory == 'All' || resource.category == selectedCategory;
      final matchesFormat = selectedFormat == 'All' || resource.format == selectedFormat;
      return matchesCategory && matchesFormat;
    }).toList();
  }

  IconData getFormatIcon(String format) {
    switch (format) {
      case 'course':
        return Icons.menu_book;
      case 'video':
        return Icons.video_library;
      case 'guide':
        return Icons.description;
      default:
        return Icons.menu_book;
    }
  }

  Color getCategoryColor(String category) {
    switch (category) {
      case 'Beginner':
        return Colors.green;
      case 'Intermediate':
        return Colors.orange;
      case 'Advanced':
        return Colors.red;
      default:
        return Colors.blue;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkGrey : AppColors.white,
      appBar: AppBar(
        title: Text(
          'Learning Center',
          style: GoogleFonts.montserrat(
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none),
            onPressed: () {},
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [

              // Introduction Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkGrey : AppColors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                  border: Border.all(
                    color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Enhance Your Web3 Investment Knowledge',
                      style: GoogleFonts.montserrat(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: isDark ? AppColors.white : AppColors.primaryBlue,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Access our curated learning resources to make informed investment decisions in the Web3 ecosystem.',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Filters
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Category filters
                        Text(
                          'Category',
                          style: theme.textTheme.labelMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                            color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF374151),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: categories.map((category) {
                            final isSelected = selectedCategory == category;
                            return GestureDetector(
                              onTap: () => setState(() => selectedCategory = category),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? AppColors.gold
                                      : (isDark ? const Color(0xFF374151) : const Color(0xFFF1F5F9)),
                                  borderRadius: BorderRadius.circular(20),
                                  border: isSelected
                                      ? Border.fromBorderSide(const BorderSide(color: AppColors.primaryBlue, width: 1.5))
                                      : null,
                                ),
                                child: Text(
                                  category,
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color: isSelected
                                        ? AppColors.primaryBlue
                                        : (isDark ? const Color(0xFFD1D5DB) : const Color(0xFF374151)),
                                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 16),

                        // Format filters
                        Text(
                          'Format',
                          style: theme.textTheme.labelMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                            color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF374151),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: formats.map((format) {
                            final isSelected = selectedFormat == format;
                            final displayText = format == 'All' ? format : format[0].toUpperCase() + format.substring(1);
                            return GestureDetector(
                              onTap: () => setState(() => selectedFormat = format),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? AppColors.gold
                                      : (isDark ? const Color(0xFF374151) : const Color(0xFFF1F5F9)),
                                  borderRadius: BorderRadius.circular(20),
                                  border: isSelected
                                      ? Border.fromBorderSide(const BorderSide(color: AppColors.primaryBlue, width: 1.5))
                                      : null,
                                ),
                                child: Text(
                                  displayText,
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color: isSelected
                                        ? AppColors.primaryBlue
                                        : (isDark ? const Color(0xFFD1D5DB) : const Color(0xFF374151)),
                                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              // Learning Resources Grid
              if (filteredResources.isNotEmpty)
                LayoutBuilder(
                  builder: (context, constraints) {
                    int crossAxisCount = 1;
                    if (constraints.maxWidth > 1200) {
                      crossAxisCount = 3;
                    } else if (constraints.maxWidth > 800) {
                      crossAxisCount = 2;
                    }
                    
                    return GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: crossAxisCount,
                        childAspectRatio: 0.75,
                        crossAxisSpacing: 24,
                        mainAxisSpacing: 24,
                      ),
                      itemCount: filteredResources.length,
                      itemBuilder: (context, index) {
                        final resource = filteredResources[index];
                        return _buildResourceCard(resource, theme, isDark);
                      },
                    );
                  },
                )
              else
                _buildEmptyState(theme, isDark),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildResourceCard(LearningResource resource, ThemeData theme, bool isDark) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
        border: Border.all(
          color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image with overlay
          Container(
            height: 160,
            decoration: BoxDecoration(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              image: DecorationImage(
                image: NetworkImage(resource.imageUrl),
                fit: BoxFit.cover,
              ),
            ),
            child: Container(
              decoration: BoxDecoration(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.transparent,
                    Colors.black.withOpacity(0.5),
                  ],
                ),
              ),
              child: Align(
                alignment: Alignment.bottomLeft,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.9),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      resource.category,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: getCategoryColor(resource.category),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),

          // Content
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Format and duration
                  Row(
                    children: [
                      Icon(
                        getFormatIcon(resource.format),
                        size: 20,
                        color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          '${resource.format[0].toUpperCase()}${resource.format.substring(1)} • ${resource.duration}',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Title
                  Text(
                    resource.title,
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: isDark ? Colors.white : const Color(0xFF1E293B),
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),

                  // Description
                  Expanded(
                    child: Text(
                      resource.description,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                        height: 1.4,
                      ),
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Author
                  Text(
                    'By ${resource.author}',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Action button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        // Handle button press
                      },
                      icon: Icon(
                        resource.format == 'video' ? Icons.play_arrow : Icons.launch,
                        size: 16,
                      ),
                      label: Text(_getButtonText(resource.format)),
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(ThemeData theme, bool isDark) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(48),
        child: Column(
          children: [
            Text(
              'No resources match your current filters.',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
              ),
            ),
            const SizedBox(height: 16),
            OutlinedButton(
              onPressed: () {
                setState(() {
                  selectedCategory = 'All';
                  selectedFormat = 'All';
                });
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.gold,
                foregroundColor: AppColors.primaryBlue,
              ),
              child: const Text('Reset Filters'),
            ),
          ],
        ),
      ),
    );
  }

  String _getButtonText(String format) {
    switch (format) {
      case 'course':
        return 'Start Course';
      case 'video':
        return 'Watch Video';
      case 'guide':
        return 'Read Guide';
      default:
        return 'Start Course';
    }
  }
}