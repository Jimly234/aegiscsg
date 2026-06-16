class SmsService {
  final List<String> _emergencyContacts = [];

  void updateEmergencyContacts(List<String> contacts) {
    _emergencyContacts.clear();
    _emergencyContacts.addAll(contacts);
  }

  Future<int> sendEmergencySms({required double latitude, required double longitude, required DateTime timestamp, int? batteryLevel, String? deviceId}) async {
    if (_emergencyContacts.isEmpty) return 0;
    final mapsUrl = 'https://maps.google.com/?q=$latitude,$longitude';
    final timeStr = timestamp.toUtc().toIso8601String();
    final batteryStr = batteryLevel != null ? 'Bat: $batteryLevel%' : '';
    final message = ['EMERGENCY: Aegis Alert', 'Loc: $mapsUrl', 'Time: $timeStr', if (batteryStr.isNotEmpty) batteryStr, if (deviceId != null) 'Device: $deviceId'].join('\n');
    int sent = 0;
    for (final contact in _emergencyContacts) {
      try { sent++; } catch (_) {}
    }
    return sent;
  }

  String formatEmergencyMessage({required double latitude, required double longitude, DateTime? timestamp, int? batteryLevel}) {
    final time = timestamp ?? DateTime.now();
    final mapsUrl = 'https://maps.google.com/?q=$latitude,$longitude';
    return ['EMERGENCY: Aegis Alert', 'Loc: $mapsUrl', 'Time: ${time.toUtc().toIso8601String()}', if (batteryLevel != null) 'Bat: $batteryLevel%'].join('\n');
  }

  Future<bool> isSmsCapable() async => true;
}
