import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../app_theme.dart';
import '../../shared/utils/formatters.dart';
import '../../shared/widgets/widgets.dart';
import 'learn_mock_data.dart';
import 'models/course.dart';

enum _PriceFilter {
  all('Tous'),
  free('Gratuits'),
  paid('Payants');

  const _PriceFilter(this.label);
  final String label;

  bool matches(Course c) => switch (this) {
        _PriceFilter.all => true,
        _PriceFilter.free => c.isFree,
        _PriceFilter.paid => !c.isFree,
      };
}

/// Centre d'apprentissage : liste des cours (CourseSerializer).
class LearnPage extends StatelessWidget {
  const LearnPage({super.key, this.loader = loadMockCourses, this.onOpenCourse});

  final DataLoader<List<Course>> loader;
  final ValueChanged<Course>? onOpenCourse;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.white,
      appBar: AppBar(
        title: Text(
          'Centre d\'apprentissage',
          style: GoogleFonts.montserrat(fontSize: 20, fontWeight: FontWeight.bold),
        ),
      ),
      body: AsyncView<List<Course>>(
        load: loader,
        loadingMessage: 'Chargement des cours…',
        isEmpty: (courses) => courses.isEmpty,
        emptyIcon: Icons.school_outlined,
        emptyMessage: 'Aucun cours n\'est disponible pour le moment.',
        builder: (context, courses, refresh) => RefreshIndicator(
          onRefresh: refresh,
          child: _CourseCatalog(courses: courses, onOpenCourse: onOpenCourse),
        ),
      ),
    );
  }
}

class _CourseCatalog extends StatefulWidget {
  const _CourseCatalog({required this.courses, this.onOpenCourse});

  final List<Course> courses;
  final ValueChanged<Course>? onOpenCourse;

  @override
  State<_CourseCatalog> createState() => _CourseCatalogState();
}

class _CourseCatalogState extends State<_CourseCatalog> {
  final _search = TextEditingController();
  _PriceFilter _filter = _PriceFilter.all;
  String _query = '';

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  List<Course> get _filtered {
    final q = _query.trim().toLowerCase();
    return widget.courses.where((c) {
      final matchesQuery =
          q.isEmpty || c.title.toLowerCase().contains(q) || c.description.toLowerCase().contains(q);
      return _filter.matches(c) && matchesQuery;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final courses = _filtered;
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        // Carte d'introduction + filtres
        AppCard(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Développez vos connaissances Web3',
                style: GoogleFonts.montserrat(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryBlue,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Des cours sélectionnés pour investir et trader en connaissance de cause.',
                style: GoogleFonts.openSans(fontSize: 14, color: AppColors.mutedText),
              ),
              const SizedBox(height: 20),
              TextField(
                controller: _search,
                onChanged: (v) => setState(() => _query = v),
                decoration: const InputDecoration(
                  hintText: 'Rechercher un cours',
                  prefixIcon: Icon(Icons.search_rounded),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Prix',
                style: GoogleFonts.openSans(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFF374151),
                ),
              ),
              const SizedBox(height: 8),
              ChoicePills<_PriceFilter>(
                options: _PriceFilter.values,
                selected: _filter,
                labelOf: (f) => f.label,
                onSelected: (f) => setState(() => _filter = f),
              ),
            ],
          ),
        ),
        const SizedBox(height: 32),
        if (courses.isEmpty)
          EmptyView(
            icon: Icons.filter_alt_off_outlined,
            message: 'Aucun cours ne correspond à vos filtres.',
            actionLabel: 'Réinitialiser les filtres',
            onAction: () => setState(() {
              _filter = _PriceFilter.all;
              _query = '';
              _search.clear();
            }),
          )
        else
          LayoutBuilder(
            builder: (context, constraints) {
              final columns = constraints.maxWidth > 1200
                  ? 3
                  : constraints.maxWidth > 800
                      ? 2
                      : 1;
              const spacing = 24.0;
              final width = (constraints.maxWidth - spacing * (columns - 1)) / columns;
              return Wrap(
                spacing: spacing,
                runSpacing: spacing,
                children: [
                  for (final c in courses)
                    SizedBox(
                      width: width,
                      child: _CourseCard(course: c, onOpen: widget.onOpenCourse),
                    ),
                ],
              );
            },
          ),
      ],
    );
  }
}

class _CourseCard extends StatelessWidget {
  const _CourseCard({required this.course, this.onOpen});

  final Course course;
  final ValueChanged<Course>? onOpen;

  /// Détail par défaut tant qu'aucune page de cours n'est branchée.
  void _showDetails(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      backgroundColor: AppColors.white,
      builder: (context) => Padding(
        padding: const EdgeInsets.fromLTRB(24, 0, 24, 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              course.title,
              style: GoogleFonts.montserrat(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.primaryBlue,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              course.description,
              style: GoogleFonts.openSans(color: AppColors.darkGrey, height: 1.5),
            ),
            const SizedBox(height: 16),
            Text(
              course.isFree ? 'Gratuit' : formatAmount(course.price, '€'),
              style: GoogleFonts.montserrat(fontWeight: FontWeight.bold, color: AppColors.darkGrey),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final c = course;
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: AppColors.cardShadow,
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // En-tête illustré (le modèle Course n'a pas d'image)
          Container(
            height: 120,
            decoration: const BoxDecoration(
              borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
              gradient: AppColors.futuristicGradient,
            ),
            child: Stack(
              children: [
                Positioned(
                  right: -10,
                  bottom: -16,
                  child: Icon(
                    Icons.school_rounded,
                    size: 110,
                    color: Colors.white.withValues(alpha: 0.12),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Align(
                    alignment: Alignment.bottomLeft,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: c.isFree ? Colors.white.withValues(alpha: 0.9) : AppColors.gold,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        c.isFree ? 'Gratuit' : formatAmount(c.price, '€'),
                        style: GoogleFonts.openSans(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: c.isFree ? AppColors.success : AppColors.primaryBlue,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.menu_book_rounded, size: 18, color: AppColors.mutedText),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Cours · publié le ${formatDate(c.createdAt)}',
                        style: GoogleFonts.openSans(fontSize: 12, color: AppColors.mutedText),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  c.title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.montserrat(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF1E293B),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  c.description,
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.openSans(fontSize: 13, color: AppColors.mutedText, height: 1.4),
                ),
                const SizedBox(height: 16),
                Text(
                  'Par ${c.instructorName ?? 'formateur n°${c.instructor}'}',
                  style: GoogleFonts.openSans(fontSize: 12, color: AppColors.mutedText),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () => onOpen != null ? onOpen!(c) : _showDetails(context),
                    icon: const Icon(Icons.launch_rounded, size: 16),
                    label: Text(c.isFree ? 'Commencer le cours' : 'Voir le cours'),
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size(double.infinity, 48),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
