import 'package:flutter/material.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:package_info_plus/package_info_plus.dart';
import '../services/api_client.dart';
import '../services/auth_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final ApiClient _apiClient = ApiClient();
  final AuthService _authService = AuthService();
  final DeviceInfoPlugin _deviceInfo = DeviceInfoPlugin();
  bool _isRegistering = false;
  String _statusMessage = 'Connecting...';
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _checkExistingAuth();
  }

  Future<void> _checkExistingAuth() async {
    final isAuth = await _authService.isAuthenticated();
    if (isAuth) {
      await _apiClient.loadStoredCredentials();
      if (mounted) Navigator.of(context).pushReplacementNamed('/home');
      return;
    }
    await _registerDevice();
  }

  Future<void> _registerDevice() async {
    setState(() { _isRegistering = true; _statusMessage = 'Connecting to Aegis...'; });
    try {
      String deviceId = 'flutter-device', platform = 'android', platformVersion = 'unknown', deviceModel = 'unknown';
      try {
        final info = await _deviceInfo.androidInfo;
        deviceId = info.id; platform = 'android'; platformVersion = info.version.release; deviceModel = '${info.manufacturer} ${info.model}';
      } catch (_) {}
      String appVersion = '2.0.0';
      try { appVersion = (await PackageInfo.fromPlatform()).version; } catch (_) {}
      final result = await _apiClient.registerDevice(deviceId: deviceId, platform: platform, platformVersion: platformVersion, appVersion: appVersion, deviceModel: deviceModel);
      if (result != null) {
        await _authService.saveAuthData(token: result['token'] ?? '', apiKey: result['api_key'] ?? '', deviceId: deviceId);
        await _apiClient.loadStoredCredentials();
        if (mounted) Navigator.of(context).pushReplacementNamed('/home');
      } else {
        setState(() { _isRegistering = false; _errorMessage = 'Could not connect. Check your internet.'; });
      }
    } catch (e) {
      setState(() { _isRegistering = false; _errorMessage = 'Connection failed.'; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0a0a),
      body: Center(child: Padding(padding: const EdgeInsets.all(32), child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        Container(width: 80, height: 80, decoration: BoxDecoration(color: const Color(0xFF0A6847).withOpacity(0.2), shape: BoxShape.circle), child: const Icon(Icons.shield, size: 40, color: Color(0xFF0A6847))),
        const SizedBox(height: 24),
        const Text('AEGIS', style: TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold, letterSpacing: 8)),
        const SizedBox(height: 48),
        if (_isRegistering) ...[
          const SizedBox(width: 40, height: 40, child: CircularProgressIndicator(color: Color(0xFF0A6847), strokeWidth: 3)),
          const SizedBox(height: 16),
          Text(_statusMessage, style: const TextStyle(color: Colors.white70, fontSize: 14)),
        ],
        if (_errorMessage != null) ...[
          Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: Colors.red.withOpacity(0.1), borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.red.withOpacity(0.3))),
            child: Column(children: [
              const Icon(Icons.error_outline, color: Colors.red, size: 32),
              const SizedBox(height: 12),
              Text(_errorMessage!, textAlign: TextAlign.center, style: const TextStyle(color: Colors.white70, fontSize: 14)),
              const SizedBox(height: 16),
              ElevatedButton(onPressed: _registerDevice, style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0A6847)), child: const Text('RETRY')),
            ])),
        ],
        const Spacer(),
        const Text('v2.0.0', style: TextStyle(color: Colors.white12, fontSize: 11)),
      ]))),
    );
  }
}
