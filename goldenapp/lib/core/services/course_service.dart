import '../api/api_client.dart';
import '../models/course.dart';
import '../models/json_utils.dart';

/// Cours de formation : `/courses/`.
class CourseService {
  CourseService(this._api);

  final ApiClient _api;

  Future<List<Course>> courses() async =>
      toList(await _api.get('/courses/'), Course.fromJson);

  Future<Course> course(int id) async =>
      Course.fromJson(toMap(await _api.get('/courses/$id/')));
}
