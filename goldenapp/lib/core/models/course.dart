import 'json_utils.dart';

/// Cours de formation : `CourseSerializer` (`fields = '__all__'`).
class Course {
  const Course({
    required this.id,
    required this.title,
    required this.description,
    required this.instructor,
    required this.price,
    this.createdAt,
    this.updatedAt,
  });

  final int id;
  final String title;
  final String description;

  /// Identifiant de l'utilisateur formateur.
  final int instructor;
  final double price;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  bool get isFree => price <= 0;

  factory Course.fromJson(Map<String, dynamic> json) => Course(
    id: toInt(json['id']),
    title: toStr(json['title']),
    description: toStr(json['description']),
    instructor: toInt(json['instructor']),
    price: toDouble(json['price']),
    createdAt: toDate(json['created_at']),
    updatedAt: toDate(json['updated_at']),
  );
}
