import 'package:flutter/material.dart';

class SentinelModeScreen extends StatefulWidget {
  const SentinelModeScreen({super.key});

  @override
  State<SentinelModeScreen> createState() => _SentinelModeScreenState();
}

class _SentinelModeScreenState extends State<SentinelModeScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Sentinel Mode'),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Status indicator
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFF0A6847).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: const Color(0xFF0A6847).withOpacity(0.3),
                  ),
                ),
                child: Column(
                  children: [
                    AnimatedBuilder(
                      animation: _controller,
                      builder: (context, child) {
                        return Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: const Color(0xFF0A6847).withOpacity(
                              0.2 + (_controller.value * 0.2),
                            ),
                            border: Border.all(
                              color: const Color(0xFF0A6847),
                              width: 2,
                            ),
                          ),
                          child: const Icon(
                            Icons.radar,
                            size: 36,
                            color: Color(0xFF0A6847),
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Sentinel Mode Active',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF0A6847),
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Your device is passively monitoring for threats',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.grey),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Monitoring stats
              const Text(
                'Monitoring',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              _MonitoringTile(
                icon: Icons.bluetooth,
                label: 'Bluetooth scans',
                status: 'Active',
                color: Colors.blue,
              ),
              const SizedBox(height: 8),
              _MonitoringTile(
                icon: Icons.wifi,
                label: 'Wi-Fi networks',
                status: 'Active',
                color: Colors.orange,
              ),
              const SizedBox(height: 8),
              _MonitoringTile(
                icon: Icons.cell_tower,
                label: 'Cell tower signals',
                status: 'Active',
                color: Colors.green,
              ),
              const SizedBox(height: 8),
              _MonitoringTile(
                icon: Icons.mic,
                label: 'Ambient audio',
                status: 'Standby',
                color: Colors.purple,
              ),
              const Spacer(),

              // Deactivate button
              ElevatedButton.icon(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.pause_circle_outline),
                label: const Text('Deactivate Sentinel Mode'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red.withOpacity(0.2),
                  foregroundColor: Colors.red,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MonitoringTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String status;
  final Color color;

  const _MonitoringTile({
    required this.icon,
    required this.label,
    required this.status,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1a1a2e),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(icon, color: color),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              label,
              style: const TextStyle(fontSize: 14),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: color.withOpacity(0.2),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              status,
              style: TextStyle(
                color: color,
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
