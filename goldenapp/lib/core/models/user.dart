import 'json_utils.dart';

/// Utilisateur : `GET /accounts/me/` (id, username, email, is_staff) ou
/// `UserSerializer` (id, username, email, first_name, last_name).
class User {
  const User({
    required this.id,
    required this.username,
    this.email = '',
    this.firstName = '',
    this.lastName = '',
    this.isStaff = false,
  });

  final int id;
  final String username;
  final String email;
  final String firstName;
  final String lastName;
  final bool isStaff;

  factory User.fromJson(Map<String, dynamic> json) => User(
    id: toInt(json['id']),
    username: toStr(json['username']),
    email: toStr(json['email']),
    firstName: toStr(json['first_name']),
    lastName: toStr(json['last_name']),
    isStaff: toBool(json['is_staff']),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'username': username,
    'email': email,
    'first_name': firstName,
    'last_name': lastName,
  };

  /// Nom affichable : « Prénom Nom », sinon le nom d'utilisateur.
  String get displayName {
    final full = '$firstName $lastName'.trim();
    return full.isEmpty ? username : full;
  }

  /// Initiales pour un avatar.
  String get initials {
    final source = displayName.trim();
    if (source.isEmpty) return '?';
    final parts = source.split(RegExp(r'\s+'));
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return source[0].toUpperCase();
  }

  User copyWith({String? firstName, String? lastName, String? email}) => User(
    id: id,
    username: username,
    email: email ?? this.email,
    firstName: firstName ?? this.firstName,
    lastName: lastName ?? this.lastName,
    isStaff: isStaff,
  );
}
