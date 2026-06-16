import 'package:flutter/material.dart';
import '../services/auth_service.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});
  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  final AuthService _authService = AuthService();

  @override
  void initState() {
    super.initState();
    _checkAuthAndNavigate();
  }

  Future<void> _checkAuthAndNavigate() async {
    await Future.delayed(const Duration(seconds: 2));
    if (!mounted) return;
    final isAuth = await _authService.isAuthenticated();
    if (!mounted) return;
    if (isAuth) {
      Navigator.of(context).pushReplacementNamed('/home');
    } else {
      Navigator.of(context).pushReplacementNamed('/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0a0a),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(width: 100, height: 100,
              decoration: BoxDecoration(color: const Color(0xFF0A6847).withOpacity(0.15), shape: BoxShape.circle),
              child: const Icon(Icons.shield, size: 50, color: Color(0xFF0A6847))),
            const SizedBox(height: 24),
            const Text('AEGIS', style: TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.bold, letterSpacing: 10)),
            const SizedBox(height: 8),
            const Text('CIVILIAN SAFETY GRID', style: TextStyle(color: Colors.white30, fontSize: 12, letterSpacing: 4)),
            const SizedBox(height: 48),
            const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Color(0xFF0A6847), strokeWidth: 2)),
          ],
        ),
      ),
    );
  }
}
