import 'package:flutter/material.dart';

class SentinelModeScreen extends StatefulWidget {
  const SentinelModeScreen({super.key});
  @override
  State<SentinelModeScreen> createState() => _SentinelModeScreenState();
}

class _SentinelModeScreenState extends State<SentinelModeScreen> {
  bool _isActive = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _isActive ? const Color(0xFF0a0a0a) : const Color(0xFF0a0a0a),
      appBar: AppBar(backgroundColor: _isActive ? Colors.red.shade900 : const Color(0xFF1a1a2e), elevation: 0, title: Text(_isActive ? 'SENTINEL ACTIVE' : 'Sentinel Mode', style: const TextStyle(letterSpacing: 1.5))),
      body: Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        Icon(_isActive ? Icons.radar : Icons.security, size: 80, color: _isActive ? Colors.green : const Color(0xFF0A6847)),
        const SizedBox(height: 24),
        Text(_isActive ? 'SCANNING ACTIVE' : 'Sentinel Mode Ready', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: _isActive ? Colors.green : Colors.white70)),
        const SizedBox(height: 8),
        Text(_isActive ? 'Your device is monitoring for threats' : 'Activate to scan for nearby threats', style: const TextStyle(color: Colors.white38, fontSize: 14)),
        const SizedBox(height: 40),
        ElevatedButton(onPressed: () => setState(() => _isActive = !_isActive), style: ElevatedButton.styleFrom(backgroundColor: _isActive ? Colors.red : const Color(0xFF0A6847), padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))), child: Text(_isActive ? 'STOP SENTINEL MODE' : 'ACTIVATE SENTINEL MODE', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, letterSpacing: 1))),
      ])),
    );
  }
}
