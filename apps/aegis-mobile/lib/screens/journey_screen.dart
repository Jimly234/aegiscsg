import 'package:flutter/material.dart';

class JourneyScreen extends StatefulWidget {
  const JourneyScreen({super.key});
  @override
  State<JourneyScreen> createState() => _JourneyScreenState();
}

class _JourneyScreenState extends State<JourneyScreen> {
  bool _isActive = false;
  final _destinationController = TextEditingController();
  String _status = 'Ready';

  void _startJourney() {
    if (_destinationController.text.isEmpty) return;
    setState(() { _isActive = true; _status = 'Journey to ${_destinationController.text} started. Check-ins every 10 minutes.'; });
  }

  void _endJourney() {
    setState(() { _isActive = false; _status = 'Journey completed'; _destinationController.clear(); });
  }

  @override
  void dispose() { _destinationController.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0a0a),
      appBar: AppBar(
        backgroundColor: _isActive ? Colors.green.shade900 : const Color(0xFF1a1a2e),
        title: Text(_isActive ? 'JOURNEY ACTIVE' : 'Journey Mode'),
        elevation: 0,
      ),
      body: Padding(padding: const EdgeInsets.all(24), child: Column(children: [
        Icon(_isActive ? Icons.navigation : Icons.route, size: 80, color: _isActive ? Colors.green : Colors.blue),
        const SizedBox(height: 24),
        Text(_status, textAlign: TextAlign.center, style: TextStyle(color: Colors.white70, fontSize: 16)),
        const SizedBox(height: 32),
        if (!_isActive) ...[
          TextField(
            controller: _destinationController,
            style: const TextStyle(color: Colors.white),
            decoration: const InputDecoration(
              labelText: 'Destination', labelStyle: TextStyle(color: Colors.white38),
              hintText: 'e.g. Zaria City', hintStyle: TextStyle(color: Colors.white12),
              enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white24)),
              focusedBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.blue)),
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(width: double.infinity, child: ElevatedButton(
            onPressed: _startJourney,
            style: ElevatedButton.styleFrom(backgroundColor: Colors.blue, padding: const EdgeInsets.symmetric(vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
            child: const Text('START JOURNEY', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          )),
        ] else ...[
          Card(color: const Color(0xFF1a1a2e), child: Padding(padding: const EdgeInsets.all(16), child: Column(children: [
            Row(children: [const Icon(Icons.timer, color: Colors.blue, size: 20), const SizedBox(width: 8), Text('Next check-in: 9:30 remaining', style: TextStyle(color: Colors.white70, fontSize: 14))]),
            const SizedBox(height: 12),
            Row(children: [const Icon(Icons.location_on, color: Colors.green, size: 20), const SizedBox(width: 8), const Text('Location sharing active', style: TextStyle(color: Colors.white70, fontSize: 14))]),
            const SizedBox(height: 12),
            Row(children: [const Icon(Icons.people, color: Colors.purple, size: 20), const SizedBox(width: 8), const Text('Guardians notified', style: TextStyle(color: Colors.white70, fontSize: 14))]),
          ]))),
          const SizedBox(height: 24),
          SizedBox(width: double.infinity, child: ElevatedButton(
            onPressed: _endJourney,
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red, padding: const EdgeInsets.symmetric(vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
            child: const Text('END JOURNEY', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          )),
        ],
      ])),
    );
  }
}
