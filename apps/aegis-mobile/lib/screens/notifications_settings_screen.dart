import 'package:flutter/material.dart';

class NotificationsSettingsScreen extends StatelessWidget {
  const NotificationsSettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0a0a),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1a1a2e),
        title: const Text('Notifications'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            color: const Color(0xFF1a1a2e),
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12)),
            child: Column(
              children: [
                SwitchListTile(
                  title: const Text('SMS Alerts',
                      style: TextStyle(color: Colors.white)),
                  subtitle: const Text(
                      'Receive emergency alerts via SMS',
                      style: TextStyle(color: Colors.white54)),
                  value: true,
                  onChanged: (v) {},
                  activeColor: const Color(0xFF0A6847),
                ),
                const Divider(color: Colors.white10, height: 1),
                SwitchListTile(
                  title: const Text('Push Notifications',
                      style: TextStyle(color: Colors.white)),
                  subtitle: const Text(
                      'Real-time push alerts (coming soon)',
                      style: TextStyle(color: Colors.white54)),
                  value: false,
                  onChanged: null,
                  activeColor: const Color(0xFF0A6847),
                ),
                const Divider(color: Colors.white10, height: 1),
                SwitchListTile(
                  title: const Text('Guardian Updates',
                      style: TextStyle(color: Colors.white)),
                  subtitle: const Text(
                      'Notify when guardians go online/offline',
                      style: TextStyle(color: Colors.white54)),
                  value: true,
                  onChanged: (v) {},
                  activeColor: const Color(0xFF0A6847),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
