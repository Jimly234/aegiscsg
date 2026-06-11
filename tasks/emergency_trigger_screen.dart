import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:vibration/vibration.dart';

class EmergencyTriggerScreen extends StatefulWidget {
  const EmergencyTriggerScreen({super.key});

  @override
  State<EmergencyTriggerScreen> createState() => _EmergencyTriggerScreenState();
}

class _EmergencyTriggerScreenState extends State<EmergencyTriggerScreen>
    with SingleTickerProviderStateMixin {
  bool _isHolding = false;
  double _holdProgress = 0.0;
  late AnimationController _pulseController;

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
    setState(() {
      _isHolding = true;
      _holdProgress = 0.0;
    });
    _startHoldTimer();
  }

  void _onPanEnd(DragEndDetails details) {
    setState(() {
      _isHolding = false;
      _holdProgress = 0.0;
    });
  }

  void _startHoldTimer() async {
    const holdDuration = Duration(seconds: 3);
    const updateInterval = Duration(milliseconds: 50);
    final steps = holdDuration.inMilliseconds ~/ updateInterval.inMilliseconds;

    for (int i = 0; i < steps; i++) {
      if (!_isHolding) break;
      await Future.delayed(updateInterval);
      if (mounted) {
        setState(() {
          _holdProgress = (i + 1) / steps;
        });
      }
    }

    if (_isHolding && mounted) {
      _triggerEmergency();
    }
  }

  void _triggerEmergency() async {
    HapticFeedback.heavyImpact();
    if (await Vibration.hasVibrator() ?? false) {
      Vibration.vibrate(pattern: [0, 500, 200, 500, 200, 500]);
    }

    if (mounted) {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => AlertDialog(
          backgroundColor: const Color(0xFF1a1a2e),
          title: const Row(
            children: [
              Icon(Icons.warning, color: Colors.red, size: 28),
              SizedBox(width: 12),
              Text('EMERGENCY ACTIVATED', style: TextStyle(color: Colors.red)),
            ],
          ),
          content: const Text(
            'Emergency alert has been sent.\nGuardians and authorities have been notified.',
            style: TextStyle(color: Colors.white70),
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
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: GestureDetector(
        onPanStart: _onPanStart,
        onPanEnd: _onPanEnd,
        child: AnimatedBuilder(
          animation: _pulseController,
          builder: (context, child) {
            return Container(
              width: double.infinity,
              height: double.infinity,
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  colors: [
                    Colors.red.withOpacity(0.3 * _pulseController.value),
                    Colors.black,
                  ],
                  radius: 0.8,
                ),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
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
                  const Text(
                    'for 3 seconds to activate emergency',
                    style: TextStyle(color: Colors.white54, fontSize: 14),
                  ),
                  const SizedBox(height: 60),
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
                              color: Colors.red.withOpacity(0.3),
                              width: 2,
                            ),
                          ),
                        ),
                        Container(
                          width: 180,
                          height: 180,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: Colors.red.withOpacity(
                              0.2 + (_holdProgress * 0.6),
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.red.withOpacity(_holdProgress * 0.5),
                                blurRadius: 40,
                                spreadRadius: 10,
                              ),
                            ],
                          ),
                          child: Center(
                            child: Icon(
                              Icons.sos,
                              size: 60,
                              color: Colors.white.withOpacity(
                                0.7 + (_holdProgress * 0.3),
                              ),
                            ),
                          ),
                        ),
                        if (_isHolding)
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
                  const SizedBox(height: 40),
                  Text(
                    '${(_holdProgress * 3).toStringAsFixed(1)}s',
                    style: TextStyle(
                      color: Colors.red.withOpacity(0.5 + _holdProgress * 0.5),
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
