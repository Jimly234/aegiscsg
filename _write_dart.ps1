$dartCode = @'
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:vibration/vibration.dart';
import 'package:battery_plus/battery_plus.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:device_info_plus/device_info_plus.dart';
import '../services/location_service.dart';
import '../services/api_client.dart';
import '../services/sms_service.dart';

class EmergencyTriggerScreen extends StatefulWidget {
  const EmergencyTriggerScreen({super.key});

  @override
  State<EmergencyTriggerScreen> createState() => _EmergencyTriggerScreenState();
}

class _EmergencyTriggerScreenState extends State<EmergencyTriggerScreen>
    with SingleTickerProviderStateMixin {
  bool _isHolding = false;
  double _holdProgress = 0.0;
  bool _isSending = false;
  bool _alertSent = false;
  String _statusMessage = '';
  late AnimationController _pulseController;

  final LocationService _locationService = LocationService();
  final ApiClient _apiClient = ApiClient();
  final SmsService _smsService = SmsService();
  final Battery _battery = Battery();
  final Connectivity _connectivity = Connectivity();
  final DeviceInfoPlugin _deviceInfo = DeviceInfoPlugin();

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  void _onPanStart(DragStartDetails details) {
    if (_isSending || _alertSent) return;
    setState(() {
      _isHolding = true;
      _holdProgress = 0.0;
      _statusMessage = '';
    });
    _startHoldTimer();
  }

  void _onPanEnd(DragEndDetails details) {
    if (_isSending) return;
    setState(() {
      _isHolding = false;
      _holdProgress = 0.0;
      _statusMessage = 'Release to cancel';
    });
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted && !_isHolding && !_alertSent) {
        setState(() => _statusMessage = '');
      }
    });
  }

  void _startHoldTimer() async {
    const holdDuration = Duration(seconds: 3);
    const updateInterval = Duration(milliseconds: 50);
    final steps = holdDuration.inMilliseconds ~/ updateInterval.inMilliseconds;

    for (int i = 0; i < steps; i++) {
      if (!_isHolding) break;
      await Future.delayed(updateInterval);
      if (mounted && _isHolding) {
        setState(() {
          _holdProgress = (i + 1) / steps;
        });
      }
    }

    if (_isHolding && mounted && !_isSending) {
      _triggerEmergency();
    }
  }

  Future<void> _triggerEmergency() async {
    setState(() {
      _isSending = true;
      _statusMessage = 'Getting location...';
    });

    HapticFeedback.heavyImpact();
    if (await Vibration.hasVibrator() ?? false) {
      Vibration.vibrate(pattern: [0, 500, 200, 500, 200, 500]);
    }

    try {
      final position = await _locationService.getCurrentPosition();
      if (position == null) {
        setState(() {
          _isSending = false;
          _statusMessage = 'Could not get location. Try again.';
        });
        Future.delayed(const Duration(seconds: 3), () {
          if (mounted) setState(() => _statusMessage = '');
        });
        return;
      }

      setState(() => _statusMessage = 'Sending alert...');

      int batteryLevel = -1;
      try {
        batteryLevel = await _battery.batteryLevel;
      } catch (_) {}

      String networkType = 'unknown';
      try {
        final connectivityResult = await _connectivity.checkConnectivity();
        networkType = connectivityResult.first.name;
      } catch (_) {}

      String deviceId = 'unknown';
      try {
        final deviceInfo = await _deviceInfo.androidInfo;
        deviceId = deviceInfo.model;
      } catch (_) {}

      final alertResult = await _apiClient.triggerEmergency(
        deviceId: deviceId,
        latitude: position.latitude,
        longitude: position.longitude,
        accuracy: position.accuracy,
        altitude: position.altitude,
        speed: position.speed,
        heading: position.heading,
        batteryLevel: batteryLevel,
        networkType: networkType,
      );

      final smsSent = await _smsService.sendEmergencySms(
        latitude: position.latitude,
        longitude: position.longitude,
        timestamp: DateTime.now(),
        batteryLevel: batteryLevel,
        deviceId: deviceId,
      );

      setState(() {
        _isSending = false;
        _alertSent = true;
        _statusMessage = '';
      });

      if (mounted) {
        _showAlertSentDialog(alertResult != null, smsSent);
      }
    } catch (e) {
      setState(() {
        _isSending = false;
        _statusMessage = 'Error occurred. Try again.';
      });
    }
  }

  void _showAlertSentDialog(bool apiSuccess, int smsCount) {
    final smsText = '$smsCount messages sent';
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1a1a2e),
        title: Row(
          children: [
            Icon(
              apiSuccess ? Icons.check_circle : Icons.warning,
              color: apiSuccess ? Colors.green : Colors.orange,
              size: 28,
            ),
            const SizedBox(width: 12),
            Text(
              apiSuccess ? 'ALERT SENT' : 'ALERT SENT (SMS ONLY)',
              style: TextStyle(
                color: apiSuccess ? Colors.green : Colors.orange,
                fontSize: 18,
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Your emergency alert has been activated.',
              style: TextStyle(color: Colors.white70),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(Icons.cloud, size: 16, color: Colors.white38),
                const SizedBox(width: 8),
                const Text('Backend: ', style: TextStyle(color: Colors.white38, fontSize: 13)),
                Text(
                  apiSuccess ? 'Connected' : 'Offline',
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.sms, size: 16, color: Colors.white38),
                const SizedBox(width: 8),
                const Text('SMS Fallback: ', style: TextStyle(color: Colors.white38, fontSize: 13)),
                Text(smsText, style: const TextStyle(color: Colors.white, fontSize: 13)),
              ],
            ),
            const SizedBox(height: 12),
            const Text(
              'Guardians and authorities have been notified.\nHelp is on the way.',
              style: TextStyle(color: Colors.white54, fontSize: 13),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              Navigator.of(context).pushReplacementNamed('/home');
            },
            child: const Text('OK', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  void _resetAlert() {
    setState(() {
      _alertSent = false;
      _isHolding = false;
      _holdProgress = 0.0;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: GestureDetector(
        onPanStart: _alertSent ? null : _onPanStart,
        onPanEnd: _alertSent ? null : _onPanEnd,
        child: AnimatedBuilder(
          animation: _pulseController,
          builder: (context, child) {
            final countdownText = '${(_holdProgress * 3).toStringAsFixed(1)}s';
            return Container(
              width: double.infinity,
              height: double.infinity,
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  colors: [
                    (_alertSent ? Colors.green : Colors.red)
                        .withOpacity(0.3 * _pulseController.value),
                    Colors.black,
                  ],
                  radius: 0.8,
                ),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (!_alertSent) ...[
                    const Text(
                      'PRESS & HOLD',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 4,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _isSending
                          ? _statusMessage
                          : _statusMessage.isNotEmpty
                              ? _statusMessage
                              : 'for 3 seconds to activate emergency',
                      style: TextStyle(
                        color: _isSending ? Colors.orange : Colors.white54,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 60),
                  ] else ...[
                    const Icon(Icons.check_circle, color: Colors.green, size: 64),
                    const SizedBox(height: 16),
                    const Text(
                      'ALERT SENT',
                      style: TextStyle(
                        color: Colors.green,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 4,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Help is on the way',
                      style: TextStyle(color: Colors.white54, fontSize: 14),
                    ),
                    const SizedBox(height: 40),
                    ElevatedButton(
                      onPressed: _resetAlert,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green.withOpacity(0.2),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 32, vertical: 12,
                        ),
                      ),
                      child: const Text('SEND ANOTHER ALERT'),
                    ),
                    const SizedBox(height: 40),
                  ],
                  SizedBox(
                    width: 200,
                    height: 200,
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        Container(
                          width: 200,
                          height: 200,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: (_alertSent ? Colors.green : Colors.red)
                                  .withOpacity(0.3),
                              width: 2,
                            ),
                          ),
                        ),
                        Container(
                          width: 180,
                          height: 180,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: (_alertSent ? Colors.green : Colors.red)
                                .withOpacity(_isSending ? 0.8 : (0.2 + (_holdProgress * 0.6))),
                            boxShadow: [
                              BoxShadow(
                                color: (_alertSent ? Colors.green : Colors.red)
                                    .withOpacity(_holdProgress * 0.5),
                                blurRadius: 40,
                                spreadRadius: 10,
                              ),
                            ],
                          ),
                          child: Center(
                            child: _isSending
                                ? const SizedBox(
                                    width: 40,
                                    height: 40,
                                    child: CircularProgressIndicator(
                                      color: Colors.white,
                                      strokeWidth: 3,
                                    ),
                                  )
                                : Icon(
                                    _alertSent ? Icons.check : Icons.sos,
                                    size: 60,
                                    color: Colors.white.withOpacity(
                                      0.7 + (_holdProgress * 0.3),
                                    ),
                                  ),
                          ),
                        ),
                        if (_isHolding && !_alertSent)
                          SizedBox(
                            width: 200,
                            height: 200,
                            child: CircularProgressIndicator(
                              value: _holdProgress,
                              strokeWidth: 4,
                              color: Colors.red,
                              backgroundColor: Colors.transparent,
                            ),
                          ),
                      ],
                    ),
                  ),
                  if (!_alertSent) ...[
                    const SizedBox(height: 40),
                    Text(
                      _isSending ? 'SENDING...' : countdownText,
                      style: TextStyle(
                        color: (_alertSent ? Colors.green : Colors.red)
                            .withOpacity(0.5 + _holdProgress * 0.5),
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
