import 'package:equatable/equatable.dart';

class AlertModel extends Equatable {
  final String id;
  final String victimName;
  final int? victimAge;
  final String? victimGender;
  final GeoLocation location;
  final String? address;
  final String status;
  final String priority;
  final DateTime timestamp;
  final int? batteryLevel;
  final String? signalStrength;
  final int guardiansNotified;
  final int guardiansAcknowledged;
  final bool audioStreaming;
  final double? speed;
  final String? heading;

  const AlertModel({
    required this.id,
    required this.victimName,
    this.victimAge,
    this.victimGender,
    required this.location,
    this.address,
    required this.status,
    required this.priority,
    required this.timestamp,
    this.batteryLevel,
    this.signalStrength,
    this.guardiansNotified = 0,
    this.guardiansAcknowledged = 0,
    this.audioStreaming = false,
    this.speed,
    this.heading,
  });

  @override
  List<Object?> get props => [id, victimName, status, priority, timestamp];

  factory AlertModel.fromJson(Map<String, dynamic> json) {
    return AlertModel(
      id: json['id'],
      victimName: json['victim_name'],
      victimAge: json['victim_age'],
      victimGender: json['victim_gender'],
      location: GeoLocation.fromJson(json['location']),
      address: json['address'],
      status: json['status'],
      priority: json['priority'],
      timestamp: DateTime.parse(json['timestamp']),
      batteryLevel: json['battery_level'],
      signalStrength: json['signal_strength'],
      guardiansNotified: json['guardians_notified'] ?? 0,
      guardiansAcknowledged: json['guardians_acknowledged'] ?? 0,
      audioStreaming: json['audio_streaming'] ?? false,
      speed: json['speed']?.toDouble(),
      heading: json['heading'],
    );
  }
}

class GeoLocation extends Equatable {
  final double lat;
  final double lng;
  final double? accuracy;

  const GeoLocation({
    required this.lat,
    required this.lng,
    this.accuracy,
  });

  @override
  List<Object?> get props => [lat, lng, accuracy];

  factory GeoLocation.fromJson(Map<String, dynamic> json) {
    return GeoLocation(
      lat: json['lat'].toDouble(),
      lng: json['lng'].toDouble(),
      accuracy: json['accuracy']?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'lat': lat,
      'lng': lng,
      'accuracy': accuracy,
    };
  }
}

class GuardianModel extends Equatable {
  final String id;
  final String name;
  final String relationship;
  final String phone;
  final String status;
  final GeoLocation? location;
  final double? distance;

  const GuardianModel({
    required this.id,
    required this.name,
    required this.relationship,
    required this.phone,
    this.status = 'offline',
    this.location,
    this.distance,
  });

  @override
  List<Object?> get props => [id, name, phone, status];

  factory GuardianModel.fromJson(Map<String, dynamic> json) {
    return GuardianModel(
      id: json['id'],
      name: json['name'],
      relationship: json['relationship'],
      phone: json['phone'],
      status: json['status'],
      location: json['location'] != null
          ? GeoLocation.fromJson(json['location'])
          : null,
      distance: json['distance']?.toDouble(),
    );
  }
}
