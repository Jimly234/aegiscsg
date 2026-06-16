import 'package:flutter/material.dart';
import '../services/auth_service.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  Future<void> _logout(BuildContext context) async {
    final confirmed = await showDialog<bool>(context: context, builder: (ctx) => AlertDialog(backgroundColor: const Color(0xFF1a1a2e), title: const Text('Logout', style: TextStyle(color: Colors.white)), content: const Text('Are you sure?', style: TextStyle(color: Colors.white70)), actions: [TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')), TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Logout', style: TextStyle(color: Colors.red)))]));
    if (confirmed == true && context.mounted) { await AuthService().clearAuth(); Navigator.of(context).pushReplacementNamed('/login'); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0a0a),
      appBar: AppBar(backgroundColor: const Color(0xFF1a1a2e), elevation: 0, title: const Text('Settings')),
      body: ListView(padding: const EdgeInsets.all(16), children: [
        Card(color: const Color(0xFF1a1a2e), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), child: Column(children: [
          ListTile(leading: const Icon(Icons.security, color: Color(0xFF0A6847)), title: const Text('Privacy Settings', style: TextStyle(color: Colors.white)), trailing: const Icon(Icons.chevron_right, color: Colors.white24), onTap: () {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Privacy: Your data is encrypted and never shared.'), backgroundColor: Color(0xFF0A6847)));
    }),
          const Divider(color: Colors.white10, height: 1),
          ListTile(leading: const Icon(Icons.notifications, color: Colors.blue), title: const Text('Notifications', style: TextStyle(color: Colors.white)), trailing: const Icon(Icons.chevron_right, color: Colors.white24), onTap: () {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Notifications: SMS alerts are enabled. Push notifications coming soon.'), backgroundColor: Color(0xFF0A6847)));
    }),
          const Divider(color: Colors.white10, height: 1),
          ListTile(leading: const Icon(Icons.info_outline, color: Colors.white38), title: const Text('About Aegis', style: TextStyle(color: Colors.white)), subtitle: const Text('Version 2.0.0', style: TextStyle(color: Colors.white38, fontSize: 12)), trailing: const Icon(Icons.chevron_right, color: Colors.white24), onTap: () {
      showAboutDialog(context: context, applicationName: 'Aegis Sentinel', applicationVersion: '2.0.0', applicationLegalese: 'Civilian Safety Grid\n\nYour safety is our mission.');
    }),
        ])),
        const SizedBox(height: 24),
        SizedBox(width: double.infinity, child: OutlinedButton.icon(onPressed: () => _logout(context), icon: const Icon(Icons.logout, size: 18), label: const Text('Logout'), style: OutlinedButton.styleFrom(foregroundColor: Colors.red, side: const BorderSide(color: Colors.red), padding: const EdgeInsets.symmetric(vertical: 14), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))))),
      ]),
    );
  }
}
