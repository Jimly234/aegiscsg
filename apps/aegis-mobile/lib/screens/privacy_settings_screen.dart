import 'package:flutter/material.dart';

class PrivacySettingsScreen extends StatelessWidget {
  const PrivacySettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0a0a),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1a1a2e),
        title: const Text('Privacy Settings'),
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
                  title: const Text('End-to-end Encryption',
                      style: TextStyle(color: Colors.white)),
                  subtitle: const Text('All data is encrypted in transit',
                      style: TextStyle(color: Colors.white54)),
                  value: true,
                  onChanged: null, // Always enabled
                  activeColor: const Color(0xFF0A6847),
                ),
                const Divider(color: Colors.white10, height: 1),
                SwitchListTile(
                  title: const Text('Location Sharing',
                      style: TextStyle(color: Colors.white)),
                  subtitle: const Text(
                      'Share location during emergencies only',
                      style: TextStyle(color: Colors.white54)),
                  value: true,
                  onChanged: (v) {},
                  activeColor: const Color(0xFF0A6847),
                ),
                const Divider(color: Colors.white10, height: 1),
                SwitchListTile(
                  title: const Text('Anonymous Reports',
                      style: TextStyle(color: Colors.white)),
                  subtitle: const Text(
                      'Hide identity in community reports',
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
