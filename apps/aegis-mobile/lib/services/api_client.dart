import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_service.dart';

class ApiClient {
  static const String _baseUrl = 'http://10.0.2.2:8000/api/v1';
  final AuthService _authService = AuthService();
  String? _deviceToken;
  String? _apiKey;

  Future<void> loadStoredCredentials() async {
    final token = await _authService.getToken();
    final apiKey = await _authService.getApiKey();
    if (token != null) _deviceToken = token;
    if (apiKey != null) _apiKey = apiKey;
  }

  void setAuthToken(String token) { _deviceToken = token; }
  void setApiKey(String key) { _apiKey = key; }

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (_deviceToken != null) 'Authorization': 'Bearer $_deviceToken',
    if (_apiKey != null) 'X-API-Key': '$_apiKey',
  };

  Future<Map<String, dynamic>?> registerDevice({
    required String deviceId, required String platform,
    required String platformVersion, required String appVersion,
    required String deviceModel,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/auth/device/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'device_id': deviceId, 'platform': platform,
          'platform_version': platformVersion, 'app_version': appVersion,
          'device_model': deviceModel,
        }),
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        _deviceToken = data['token'];
        _apiKey = data['api_key'];
        return data;
      }
      return null;
    } catch (e) { 
      print('registerDevice error: $e'); 
      return null; 
    }
  }

  Future<Map<String, dynamic>?> triggerEmergency({
    required String deviceId, required double latitude,
    required double longitude, double? accuracy, double? altitude,
    double? speed, double? heading, int? batteryLevel,
    String? networkType, int? signalStrength,
    String triggerMethod = 'button_hold', bool isSilent = true,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/alerts/'),
        headers: _headers,
        body: jsonEncode({
          'device_id': deviceId, 'timestamp': DateTime.now().toUtc().toIso8601String(),
          'location': {
            'latitude': latitude, 'longitude': longitude,
            if (accuracy != null) 'accuracy': accuracy,
            if (altitude != null) 'altitude': altitude,
            if (speed != null) 'speed': speed,
            if (heading != null) 'heading': heading,
            'provider': 'gps',
          },
          'battery_level': batteryLevel, 'network_type': networkType,
          'signal_strength': signalStrength, 'trigger_method': triggerMethod,
          'is_silent': isSilent,
        }),
      );
      if (response.statusCode == 201 || response.statusCode == 200) return jsonDecode(response.body);
      return null;
    } catch (e) { 
      print('registerDevice error: $e'); 
      return null; 
    }
  }

  Future<bool> cancelAlert(String alertId) async {
    try {
      final response = await http.patch(Uri.parse('$_baseUrl/alerts/$alertId'), headers: _headers,
        body: jsonEncode({'status': 'cancelled'}));
      return response.statusCode == 200;
    } catch (e) { return false; }
  }

  Future<Map<String, dynamic>?> getAlertStatus(String alertId) async {
    try {
      final response = await http.get(Uri.parse('$_baseUrl/alerts/$alertId'), headers: _headers);
      if (response.statusCode == 200) return jsonDecode(response.body);
      return null;
    } catch (e) { 
      print('registerDevice error: $e'); 
      return null; 
    }
  }

  Future<Map<String, dynamic>?> startSentinelSession({
    required String deviceId, required double latitude, required double longitude,
  }) async {
    try {
      final response = await http.post(Uri.parse('$_baseUrl/sentinel/session/start'), headers: _headers,
        body: jsonEncode({'device_id': deviceId, 'location': {'latitude': latitude, 'longitude': longitude}, 'capabilities': {'bluetooth': true, 'wifi': true}}));
      if (response.statusCode == 200 || response.statusCode == 201) return jsonDecode(response.body);
      return null;
    } catch (e) { 
      print('registerDevice error: $e'); 
      return null; 
    }
  }

  Future<Map<String, dynamic>?> assessRisk({required double latitude, required double longitude}) async {
    try {
      final response = await http.post(Uri.parse('$_baseUrl/oracle/risk/assess'), headers: _headers,
        body: jsonEncode({'location': {'latitude': latitude, 'longitude': longitude}}));
      if (response.statusCode == 200) return jsonDecode(response.body);
      return null;
    } catch (e) { 
      print('registerDevice error: $e'); 
      return null; 
    }
  }
}
