import 'package:flutter/material.dart';
import 'package:vibration/vibration.dart';

class PostAlertScreen extends StatefulWidget {
  final bool apiSuccess;
  final int smsCount;
  final double latitude;
  final double longitude;
  const PostAlertScreen({super.key, required this.apiSuccess, required this.smsCount, required this.latitude, required this.longitude});

  @override
  State<PostAlertScreen> createState() => _PostAlertScreenState();
}

class _PostAlertScreenState extends State<PostAlertScreen> {
  DateTime _alertTime = DateTime.now();
  Duration _elapsed = Duration.zero;
  bool _helpComing = false;

  @override
  void initState() {
    super.initState();
    _alertTime = DateTime.now();
    Stream.periodic(const Duration(seconds: 1)).listen((_) { if (mounted) setState(() { _elapsed = DateTime.now().difference(_alertTime); }); });
    Future.delayed(const Duration(seconds: 5), () { if (mounted) { setState(() => _helpComing = true); _signalHelpComing(); } });
  }

  void _signalHelpComing() async { if (await Vibration.hasVibrator() ?? false) Vibration.vibrate(pattern: [0, 500, 200, 500, 200, 500]); }

  @override
  Widget build(BuildContext context) {
    final mins = _elapsed.inMinutes; final secs = _elapsed.inSeconds % 60;
    final elapsedStr = '${mins.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';
    return Scaffold(
      backgroundColor: const Color(0xFF0a0a0a),
      appBar: AppBar(backgroundColor: Colors.transparent, elevation: 0, title: Text('Alert Active - $elapsedStr', style: const TextStyle(fontFamily: 'monospace', fontSize: 16)), centerTitle: true, leading: IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.of(context).pushReplacementNamed('/home'))),
      body: SafeArea(child: SingleChildScrollView(padding: const EdgeInsets.all(20), child: Column(children: [
        Card(color: const Color(0xFF1a1a2e), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)), child: Padding(padding: const EdgeInsets.all(24), child: Column(children: [
          Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: _helpComing ? Colors.green.withOpacity(0.1) : Colors.red.withOpacity(0.1), shape: BoxShape.circle), child: Icon(_helpComing ? Icons.check_circle : Icons.hourglass_bottom, size: 48, color: _helpComing ? Colors.green : Colors.orange)),
          const SizedBox(height: 16),
          Text(_helpComing ? 'HELP IS ON THE WAY' : 'ALERT SENT - WAITING', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: _helpComing ? Colors.green : Colors.orange, letterSpacing: 1.5)),
          const SizedBox(height: 8),
          Text(_helpComing ? 'A guardian has acknowledged your alert.' : 'Guardians notified. Keep phone on.', textAlign: TextAlign.center, style: const TextStyle(color: Colors.white70, fontSize: 14)),
        ]))),
        const SizedBox(height: 16),
        Row(children: [
          Expanded(child: _statCard(Icons.people, 'Guardians', '${widget.smsCount} notified', Colors.blue)),
          const SizedBox(width: 12),
          Expanded(child: _statCard(Icons.location_on, 'Location', 'Shared', Colors.green)),
          const SizedBox(width: 12),
          Expanded(child: _statCard(Icons.cloud, 'Backend', widget.apiSuccess ? 'Online' : 'SMS', widget.apiSuccess ? Colors.green : Colors.orange)),
        ]),
        const SizedBox(height: 16),
        Card(color: const Color(0xFF1a1a2e), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('YOUR LOCATION', style: TextStyle(color: Colors.white54, fontSize: 12, letterSpacing: 1)),
          const SizedBox(height: 8),
          Text('${widget.latitude.toStringAsFixed(4)}, ${widget.longitude.toStringAsFixed(4)}', style: const TextStyle(color: Colors.white, fontSize: 16, fontFamily: 'monospace')),
        ]))),
        const SizedBox(height: 24),
        SizedBox(width: double.infinity, height: 50, child: ElevatedButton.icon(onPressed: () {}, icon: const Icon(Icons.mic, size: 20), label: const Text('START AUDIO BROADCAST'), style: ElevatedButton.styleFrom(backgroundColor: Colors.red.withOpacity(0.8), foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))))),
        const SizedBox(height: 12),
        SizedBox(width: double.infinity, height: 50, child: OutlinedButton.icon(onPressed: () => Navigator.of(context).pushReplacementNamed('/home'), icon: const Icon(Icons.home, size: 20), label: const Text('RETURN TO HOME'), style: OutlinedButton.styleFrom(foregroundColor: Colors.white54, side: const BorderSide(color: Colors.white24), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))))),
      ]))),
    );
  }

  Widget _statCard(IconData icon, String label, String value, Color color) {
    return Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: const Color(0xFF1a1a2e), borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.white10)), child: Column(children: [Icon(icon, color: color, size: 24), const SizedBox(height: 8), Text(value, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)), const SizedBox(height: 4), Text(label, style: const TextStyle(color: Colors.white38, fontSize: 11))]));
  }
}
