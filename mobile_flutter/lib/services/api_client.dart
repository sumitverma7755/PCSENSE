import "dart:convert";
import "dart:io";

import "package:http/http.dart" as http;

class ApiClient {
  ApiClient._();
  static final ApiClient instance = ApiClient._();

  String get baseUrl {
    if (Platform.isAndroid) {
      return "http://10.0.2.2:3001";
    }
    return "http://localhost:3001";
  }

  Future<Map<String, dynamic>> generateBuild({
    required int budget,
    required String purpose,
    required String resolution,
    required String performanceGoal,
  }) async {
    final res = await http.post(
      Uri.parse("$baseUrl/api/v2/build"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "budget": budget,
        "purpose": purpose,
        "resolution": resolution,
        "performanceGoal": performanceGoal,
      }),
    );
    final body = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode >= 400 || body["success"] != true) {
      throw Exception(body["message"] ?? "Build generation failed");
    }
    return body;
  }

  Future<List<dynamic>> featuredBuilds() async {
    final res = await http.get(Uri.parse("$baseUrl/api/v2/featured-builds"));
    final body = jsonDecode(res.body) as Map<String, dynamic>;
    return (body["featuredBuilds"] as List<dynamic>? ?? const []);
  }
}

