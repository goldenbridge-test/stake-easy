import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthService {
  final String baseUrl = "http://localhost:5000/api/auth"; // Update with actual IP for mobile/physical device
  final _storage = const FlutterSecureStorage();

  Future<Map<String, dynamic>> signup(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/signup'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    return _handleResponse(response);
  }

  Future<String> getNonce(String publicAddress) async {
    final response = await http.get(Uri.parse('$baseUrl/nonce/$publicAddress'));
    if (response.statusCode == 200) {
      return jsonDecode(response.body)['nonce'];
    }
    throw Exception('Failed to get nonce');
  }

  Future<Map<String, dynamic>> verifyWallet(String publicAddress, String signature) async {
    final response = await http.post(
      Uri.parse('$baseUrl/verify-wallet'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'publicAddress': publicAddress,
        'signature': signature,
      }),
    );
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> _handleResponse(http.Response response) async {
    final data = jsonDecode(response.body);
    if (response.statusCode == 200 || response.statusCode == 201) {
      await _storage.write(key: 'token', value: data['token']);
      return data;
    } else {
      throw Exception(data['error'] ?? 'Authentication failed');
    }
  }

  Future<String?> getToken() async => await _storage.read(key: 'token');
  Future<void> logout() async => await _storage.delete(key: 'token');
}
