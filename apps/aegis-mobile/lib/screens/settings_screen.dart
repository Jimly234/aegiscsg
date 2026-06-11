import 'package:flutter/material.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
        centerTitle: true,
      ),
      body: ListView(
        children: [
          _SectionHeader('Emergency'),
          _SwitchTile(
            icon: Icons.volume_up,
            title: 'Audio Stream to Guardians',
            subtitle: 'Broadcast live audio during emergency',
            value: true,
          ),
          _SwitchTile(
            icon: Icons.location_on,
            title: 'Precise Location Sharing',
            subtitle: 'Share GPS coordinates with responders',
            value: true,
          ),
          _SwitchTile(
            icon: Icons.sms,
            title: 'SMS Fallback',
            subtitle: 'Send SMS when internet is unavailable',
            value: true,
          ),
          _SectionHeader('Sentinel Mode'),
          _SwitchTile(
            icon: Icons.bluetooth,
            title: 'Bluetooth Scanning',
            subtitle: 'Detect nearby devices for anomaly detection',
            value: true,
          ),
          _SwitchTile(
            icon: Icons.wifi,
            title: 'Wi-Fi Network Scanning',
            value: true,
          ),
          _SectionHeader('Privacy'),
          _SwitchTile(
            icon: Icons.shield,
            title: 'Data Anonymization',
            subtitle: 'Remove PII before uploading scan data',
            value: true,
          ),
          const ListTile(
            leading: Icon(Icons.delete_outline, color: Colors.red),
            title: Text('Delete Account Data', style: TextStyle(color: Colors.red)),
          ),
          _SectionHeader('About'),
          const ListTile(
            leading: Icon(Icons.info_outline),
            title: Text('Version'),
            trailing: Text('2.0.0'),
          ),
          const ListTile(
            leading: Icon(Icons.policy_outlined),
            title: Text('Privacy Policy'),
            trailing: Icon(Icons.chevron_right),
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader(this.title);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
      child: Text(
        title.toUpperCase(),
        style: const TextStyle(
          color: Colors.grey,
          fontSize: 12,
          fontWeight: FontWeight.bold,
          letterSpacing: 1,
        ),
      ),
    );
  }
}

class _SwitchTile extends StatefulWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final bool value;

  const _SwitchTile({
    required this.icon,
    required this.title,
    this.subtitle,
    required this.value,
  });

  @override
  State<_SwitchTile> createState() => _SwitchTileState();
}

class _SwitchTileState extends State<_SwitchTile> {
  late bool _value;

  @override
  void initState() {
    super.initState();
    _value = widget.value;
  }

  @override
  Widget build(BuildContext context) {
    return SwitchListTile(
      secondary: Icon(widget.icon, color: Colors.grey),
      title: Text(widget.title),
      subtitle: widget.subtitle != null
          ? Text(widget.subtitle!, style: const TextStyle(fontSize: 12))
          : null,
      value: _value,
      activeColor: const Color(0xFF0A6847),
      onChanged: (v) => setState(() => _value = v),
    );
  }
}
