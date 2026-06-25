import 'dart:async';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'package:permission_handler/permission_handler.dart';

class BleScannerService {
  Timer? _scanTimer;
  final List<ScanResult> _discoveredDevices = [];
  bool _isScanning = false;
  final StreamController<List<ScanResult>> _deviceStream =
      StreamController.broadcast();

  Stream<List<ScanResult>> get deviceStream => _deviceStream.stream;
  List<ScanResult> get discoveredDevices => List.unmodifiable(_discoveredDevices);
  bool get isScanning => _isScanning;

  Future<bool> requestPermissions() async {
    final statuses = await [
      Permission.bluetoothScan,
      Permission.bluetoothConnect,
      Permission.location,
    ].request();
    return statuses.values.every((s) => s.isGranted);
  }

  Future<void> startScanning() async {
    if (_isScanning) return;
    final granted = await requestPermissions();
    if (!granted) return;

    _isScanning = true;
    await _performScan();

    _scanTimer = Timer.periodic(
      const Duration(seconds: 30),
      (_) => _performScan(),
    );
  }

  Future<void> _performScan() async {
    _discoveredDevices.clear();
    await FlutterBluePlus.startScan(timeout: const Duration(seconds: 10));

    FlutterBluePlus.scanResults.listen((results) {
      _discoveredDevices.clear();
      _discoveredDevices.addAll(results);
      _deviceStream.add(List.from(results));
    });
  }

  Future<void> stopScanning() async {
    _isScanning = false;
    _scanTimer?.cancel();
    _scanTimer = null;
    await FlutterBluePlus.stopScan();
    _discoveredDevices.clear();
    _deviceStream.add([]);
  }

  void dispose() {
    stopScanning();
    _deviceStream.close();
  }
}
