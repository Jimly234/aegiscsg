import 'dart:async';
import 'package:flutter/material.dart';
import '../services/ble_scanner_service.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';

class SentinelModeScreen extends StatefulWidget {
  const SentinelModeScreen({super.key});
  @override
  State<SentinelModeScreen> createState() => _SentinelModeScreenState();
}

class _SentinelModeScreenState extends State<SentinelModeScreen> {
  bool _isActive = false;
  final BleScannerService _bleScanner = BleScannerService();
  List<ScanResult> _devices = [];
  StreamSubscription<List<ScanResult>>? _deviceSubscription;

  @override
  void initState() {
    super.initState();
    _deviceSubscription = _bleScanner.deviceStream.listen((devices) {
      if (mounted) {
        setState(() {
          _devices = devices;
        });
      }
    });
  }

  @override
  void dispose() {
    _deviceSubscription?.cancel();
    _bleScanner.dispose();
    super.dispose();
  }

  Future<void> _toggleSentinelMode() async {
    if (_isActive) {
      await _bleScanner.stopScanning();
      setState(() {
        _isActive = false;
        _devices = [];
      });
    } else {
      setState(() => _isActive = true);
      await _bleScanner.startScanning();
    }
  }

  /// Returns an anonymized identifier: first 8 chars of the device ID
  String _anonymizeId(String deviceId) {
    if (deviceId.length <= 8) return deviceId;
    return deviceId.substring(0, 8);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0a0a),
      appBar: AppBar(
        backgroundColor:
            _isActive ? Colors.red.shade900 : const Color(0xFF1a1a2e),
        elevation: 0,
        title: Text(
          _isActive ? 'SENTINEL ACTIVE' : 'Sentinel Mode',
          style: const TextStyle(letterSpacing: 1.5),
        ),
      ),
      body: Column(
        children: [
          const SizedBox(height: 32),
          Icon(
            _isActive ? Icons.radar : Icons.security,
            size: 80,
            color: _isActive ? Colors.green : const Color(0xFF0A6847),
          ),
          const SizedBox(height: 24),
          Text(
            _isActive ? 'SCANNING ACTIVE' : 'Sentinel Mode Ready',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: _isActive ? Colors.green : Colors.white70,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _isActive
                ? '${_devices.length} devices detected'
                : 'Activate to scan for nearby threats',
            style: const TextStyle(color: Colors.white38, fontSize: 14),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: _toggleSentinelMode,
            style: ElevatedButton.styleFrom(
              backgroundColor:
                  _isActive ? Colors.red : const Color(0xFF0A6847),
              padding:
                  const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: Text(
              _isActive ? 'STOP SENTINEL MODE' : 'ACTIVATE SENTINEL MODE',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                letterSpacing: 1,
              ),
            ),
          ),
          const SizedBox(height: 24),
          if (_isActive && _devices.isNotEmpty) ...[
            const Divider(color: Colors.white24),
            Padding(
              padding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: [
                  const Icon(Icons.bluetooth, color: Colors.blue, size: 18),
                  const SizedBox(width: 8),
                  Text(
                    'Nearby Devices (${_devices.length})',
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: _devices.length,
                itemBuilder: (context, index) {
                  final device = _devices[index];
                  final deviceId =
                      device.device.remoteId.toString();
                  final rssi = device.rssi;
                  return Card(
                    color: const Color(0xFF1a1a2e),
                    margin: const EdgeInsets.only(bottom: 8),
                    child: ListTile(
                      leading: Icon(
                        Icons.bluetooth_searching,
                        color: rssi > -60
                            ? Colors.green
                            : rssi > -80
                                ? Colors.orange
                                : Colors.red,
                      ),
                      title: Text(
                        _anonymizeId(deviceId),
                        style: const TextStyle(
                          color: Colors.white,
                          fontFamily: 'monospace',
                        ),
                      ),
                      trailing: Text(
                        '$rssi dBm',
                        style: TextStyle(
                          color: rssi > -60
                              ? Colors.green
                              : rssi > -80
                                  ? Colors.orange
                                  : Colors.red,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
          if (_isActive && _devices.isEmpty)
            const Expanded(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircularProgressIndicator(color: Colors.green),
                    SizedBox(height: 16),
                    Text(
                      'Scanning for nearby devices...',
                      style: TextStyle(color: Colors.white38),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
