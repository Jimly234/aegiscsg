import 'package:geolocator/geolocator.dart';

class LocationService {
  Future<bool> isLocationServiceEnabled() async {
    return await Geolocator.isLocationServiceEnabled();
  }

  Future<bool> requestLocationPermission() async {
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return false;
    }
    if (permission == LocationPermission.deniedForever) return false;
    return true;
  }

  Future<Position?> getCurrentPosition({bool highAccuracy = true, Duration timeout = const Duration(seconds: 10)}) async {
    try {
      final hasPermission = await requestLocationPermission();
      if (!hasPermission) return null;
      final isEnabled = await isLocationServiceEnabled();
      if (!isEnabled) return null;
      return await Geolocator.getCurrentPosition(
        desiredAccuracy: highAccuracy
            ? LocationAccuracy.high
            : LocationAccuracy.low,
      ).timeout(timeout);    } catch (e) {
      try { return await Geolocator.getLastKnownPosition(); } catch (_) {
        return null;
      }
    }
  }

  Future<Position?> getLastKnownPosition() async {
    try {
      final hasPermission = await Geolocator.checkPermission();
      if (hasPermission == LocationPermission.denied || hasPermission == LocationPermission.deniedForever) return null;
      return await Geolocator.getLastKnownPosition();
    } catch (_) { return null; }
  }

  double calculateDistance(double startLatitude, double startLongitude, double endLatitude, double endLongitude) {
    return Geolocator.distanceBetween(startLatitude, startLongitude, endLatitude, endLongitude);
  }
}
