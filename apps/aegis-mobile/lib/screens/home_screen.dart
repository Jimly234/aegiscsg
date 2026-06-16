import 'package:flutter/material.dart';
import '../services/api_client.dart';
import '../services/auth_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ApiClient _apiClient = ApiClient();
  final AuthService _authService = AuthService();
  bool _isLoading = true;
  Map<String, dynamic>? _riskData;

  @override
  void initState() { super.initState(); _loadData(); }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      await _apiClient.loadStoredCredentials();
      final risk = await _apiClient.assessRisk(latitude: 10.5234, longitude: 7.4356);
      if (mounted) setState(() { _riskData = risk; _isLoading = false; });
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _logout() async {
    await _authService.clearAuth();
    if (mounted) Navigator.of(context).pushReplacementNamed('/login');
  }

  Color _riskColor(double s) => s < 0.25 ? Colors.green : s < 0.5 ? Colors.orange : s < 0.75 ? Colors.deepOrange : Colors.red;
  String _riskLabel(double s) => s < 0.25 ? 'LOW' : s < 0.5 ? 'MODERATE' : s < 0.75 ? 'HIGH' : 'CRITICAL';

  @override
  Widget build(BuildContext context) {
    final score = (_riskData?['risk_score'] ?? 0.0).toDouble();
    final color = _riskColor(score);
    return Scaffold(
      backgroundColor: const Color(0xFF0a0a0a),
      appBar: AppBar(backgroundColor: const Color(0xFF1a1a2e), elevation: 0, title: const Row(mainAxisSize: MainAxisSize.min, children: [Icon(Icons.shield, color: Color(0xFF0A6847)), SizedBox(width: 8), Text('Aegis Sentinel')]), actions: [IconButton(icon: const Icon(Icons.refresh), onPressed: _loadData), IconButton(icon: const Icon(Icons.settings_outlined), onPressed: () => Navigator.pushNamed(context, '/settings'))]),
      body: _isLoading ? const Center(child: CircularProgressIndicator(color: Color(0xFF0A6847))) : RefreshIndicator(onRefresh: _loadData, color: const Color(0xFF0A6847), child: SingleChildScrollView(physics: const AlwaysScrollableScrollPhysics(), padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Card(color: const Color(0xFF1a1a2e), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)), child: Padding(padding: const EdgeInsets.all(20), child: Column(children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [const Text('Current Risk Level', style: TextStyle(color: Colors.white70, fontSize: 14)), Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6), decoration: BoxDecoration(color: color.withOpacity(0.2), borderRadius: BorderRadius.circular(20)), child: Text(_riskLabel(score), style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 1)))]),
          const SizedBox(height: 16),
          ClipRRect(borderRadius: BorderRadius.circular(8), child: LinearProgressIndicator(value: score, backgroundColor: Colors.white10, valueColor: AlwaysStoppedAnimation<Color>(color), minHeight: 8)),
          const SizedBox(height: 8),
          Text('${(score * 100).toStringAsFixed(0)}% risk', style: const TextStyle(color: Colors.white38, fontSize: 12)),
        ]))),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(child: _actionCard(Icons.warning_amber, 'EMERGENCY', Colors.red, () => Navigator.pushNamed(context, '/emergency'))),
          const SizedBox(width: 12),
          Expanded(child: _actionCard(Icons.security, 'SENTINEL', const Color(0xFF0A6847), () => Navigator.pushNamed(context, '/sentinel'))),
        ]),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(child: _actionCard(Icons.route, 'JOURNEY', Colors.blue, () {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Journey Mode coming in Phase 2'), backgroundColor: Color(0xFF0A6847)));
    })),
          const SizedBox(width: 12),
          Expanded(child: _actionCard(Icons.people, 'GUARDIANS', Colors.purple, () => Navigator.pushNamed(context, '/guardians'))),
        ]),
        const SizedBox(height: 24),
        TextButton(onPressed: _logout, child: const Text('Logout', style: TextStyle(color: Colors.white24))),
      ]))),
    );
  }

  Widget _actionCard(IconData icon, String label, Color color, VoidCallback onTap) {
    return Card(color: const Color(0xFF1a1a2e), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)), child: InkWell(onTap: onTap, borderRadius: BorderRadius.circular(16), child: Padding(padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16), child: Column(children: [Icon(icon, color: color, size: 32), const SizedBox(height: 8), Text(label, style: TextStyle(color: color, fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 1))]))));
  }
}
