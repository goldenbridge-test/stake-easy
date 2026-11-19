import '../../../shared/utils/json_parsing.dart';

/// Cours (GET /api/courses/), CourseSerializer = tous les champs de Course.
class Course {
  const Course({
    required this.id,
    required this.title,
    required this.description,
    required this.instructor,
    required this.price,
    this.instructorName,
    this.createdAt,
    this.updatedAt,
  });

  final int id;
  final String title;
  final String description;

  /// Id de l'utilisateur formateur (clé étrangère, seul champ renvoyé).
  final int instructor;

  /// Nom affichable : absent du serializer, à résoudre si l'API l'expose.
  final String? instructorName;
  final double price;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  bool get isFree => price <= 0;

  factory Course.fromJson(Map<String, dynamic> json) => Course(
        id: parseInt(json['id']),
        title: json['title']?.toString() ?? '',
        description: json['description']?.toString() ?? '',
        instructor: parseInt(json['instructor']),
        price: parseDouble(json['price']),
        createdAt: parseDate(json['created_at']),
        updatedAt: parseDate(json['updated_at']),
      );
}
