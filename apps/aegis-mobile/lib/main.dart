import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'screens/splash_screen.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';
import 'screens/sentinel_mode_screen.dart';
import 'screens/emergency_trigger_screen.dart';
import 'screens/shell_mode_screen.dart';
import 'screens/guardian_setup_screen.dart';
import 'screens/settings_screen.dart';
import 'screens/journey_screen.dart';
import 'screens/post_alert_screen.dart';
import 'screens/privacy_settings_screen.dart';
import 'screens/notifications_settings_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp, DeviceOrientation.portraitDown]);
  runApp(const AegisSentinelApp());
}

class AegisSentinelApp extends StatelessWidget {
  const AegisSentinelApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Aegis Sentinel',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF0A6847), brightness: Brightness.dark),
        scaffoldBackgroundColor: const Color(0xFF0a0a0a),
        appBarTheme: const AppBarTheme(backgroundColor: Color(0xFF1a1a2e), elevation: 0, centerTitle: true),
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const SplashScreen(),
        '/login': (context) => const LoginScreen(),
        '/home': (context) => const HomeScreen(),
        '/sentinel': (context) => const SentinelModeScreen(),
        '/emergency': (context) => const EmergencyTriggerScreen(),
        '/shell': (context) => const ShellModeScreen(),
        '/guardians': (context) => const GuardianSetupScreen(),
        '/settings': (context) => const SettingsScreen(),
        '/journey': (context) => const JourneyScreen(),
        '/post_alert': (context) {
          final args = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>? ?? {};
          return PostAlertScreen(apiSuccess: args['apiSuccess'] ?? false, smsCount: args['smsCount'] ?? 0, latitude: (args['latitude'] ?? 0).toDouble(), longitude: (args['longitude'] ?? 0).toDouble());
        },
        '/privacy_settings': (context) => const PrivacySettingsScreen(),
        '/notifications_settings': (context) => const NotificationsSettingsScreen(),
      },
    );
  }
}
