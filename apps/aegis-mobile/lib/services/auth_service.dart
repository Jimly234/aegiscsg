import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthService {
  static const _tokenKey = 'aegis_auth_token';
  static const _apiKeyKey = 'aegis_api_key';
  static const _deviceIdKey = 'aegis_device_id';
  static const _userIdKey = 'aegis_user_id';
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  Future<bool> isAuthenticated() async {
    final token = await _storage.read(key: _tokenKey);
    return token != null && token.isNotEmpty;
  }

  Future<void> saveAuthData({required String token, required String apiKey, required String deviceId, String? userId}) async {
    await Future.wait([
      _storage.write(key: _tokenKey, value: token),
      _storage.write(key: _apiKeyKey, value: apiKey),
      _storage.write(key: _deviceIdKey, value: deviceId),
      if (userId != null) _storage.write(key: _userIdKey, value: userId),
    ]);
  }

  Future<String?> getToken() async => await _storage.read(key: _tokenKey);
  Future<String?> getApiKey() async => await _storage.read(key: _apiKeyKey);
  Future<String?> getDeviceId() async => await _storage.read(key: _deviceIdKey);
  Future<void> clearAuth() async => await _storage.deleteAll();
  Future<bool> isDeviceRegistered() async {
    final deviceId = await _storage.read(key: _deviceIdKey);
    final apiKey = await _storage.read(key: _apiKeyKey);
    return deviceId != null && apiKey != null;
  }
}
