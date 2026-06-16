class AlertModel {
  final String id;
  final String status;
  final double latitude;
  final double longitude;
  final DateTime timestamp;

  AlertModel({
    required this.id,
    required this.status,
    required this.latitude,
    required this.longitude,
    required this.timestamp,
  });

  factory AlertModel.fromJson(Map<String, dynamic> json) {
    return AlertModel(
      id: json['id'] ?? json['alert_id'] ?? '',
      status: json['status'] ?? 'active',
      latitude: (json['location']?['latitude'] ?? json['latitude'] ?? 0).toDouble(),
      longitude: (json['location']?['longitude'] ?? json['longitude'] ?? 0).toDouble(),
      timestamp: DateTime.tryParse(json['timestamp'] ?? '') ?? DateTime.now(),
    );
  }
}
