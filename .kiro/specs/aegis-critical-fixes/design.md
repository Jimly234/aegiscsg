# Design Document: Aegis Critical Fixes

## Overview

This document describes the architecture and implementation design for fixing P0/P1 bugs across the Aegis CSG platform. The fixes span three codebases: Flutter mobile (`apps/aegis-mobile`), FastAPI backend (`apps/aegis-api`), and React web command center (`src/`). Each fix is designed to be minimal, backward-compatible, and independently testable.

## Architecture

The Aegis platform follows a three-tier architecture:

```
┌─────────────────┐     ┌──────────────────┐     ┌───────────────────┐
│  Flutter Mobile  │────▶│  FastAPI Backend  │◀────│  React Web CC     │
│  (aegis-mobile)  │     │  (aegis-api)      │     │  (src/)           │
└────────┬────────┘     └────────┬─────────┘     └───────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌──────────────────┐
│ SharedPreferences│     │ Supabase PG +    │
│ FlutterSecure    │     │ PostGIS          │
│ Storage          │     └──────────────────┘
└─────────────────┘
```

All fixes maintain this architecture. No new services are introduced.

## Components and Interfaces

### Component 1: Guardian Persistence Service

**Location:** `apps/aegis-mobile/lib/services/guardian_service.dart` (new)

**Purpose:** Encapsulates guardian CRUD with correct JSON typing, Supabase sync, and SharedPreferences fallback.

**Key Changes:**
- Cast decoded JSON elements to `Map<String, dynamic>` instead of `Map<String, String>`
- Use `addPostFrameCallback` or explicit `await` to ensure save completes before UI update
- Wrap `jsonDecode` in try-catch for malformed data

```dart
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'supabase_service.dart';

class GuardianService {
  static const _storageKey = 'guardians';
  List<Map<String, dynamic>> _guardians = [];

  List<Map<String, dynamic>> get guardians => List.unmodifiable(_guardians);

  /// Load guardians: Supabase first, SharedPreferences fallback
  Future<List<Map<String, dynamic>>> loadGuardians(String userId) async {
    try {
      final remote = await SupabaseService.getGuardians(userId);
      _guardians = remote;
      // Cache locally for offline access
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_storageKey, jsonEncode(_guardians));
      return _guardians;
    } catch (_) {
      return _loadFromPrefs();
    }
  }

  Future<List<Map<String, dynamic>>> _loadFromPrefs() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final data = prefs.getString(_storageKey);
      if (data == null) {
        _guardians = [];
        return _guardians;
      }
      final decoded = jsonDecode(data);
      if (decoded is! List) {
        _guardians = [];
        return _guardians;
      }
      _guardians = decoded
          .map((e) => Map<String, dynamic>.from(e as Map))
          .toList();
      return _guardians;
    } catch (_) {
      _guardians = [];
      return _guardians;
    }
  }
}
```

### Component 2: Authentication Logout Handler

**Location:** `apps/aegis-mobile/lib/screens/settings_screen.dart`, `apps/aegis-mobile/lib/screens/home_screen.dart`

**Purpose:** Ensure full state cleanup on logout.

**Key Changes:**
- Call `AuthService().clearAuth()` (already clears FlutterSecureStorage via `deleteAll()`)
- Reset any in-memory BLoC/service state (ApiClient credentials)
- Navigate with `pushNamedAndRemoveUntil('/login', (route) => false)` to prevent back-navigation

```dart
Future<void> _logout(BuildContext context) async {
  // 1. Clear persistent auth storage
  await AuthService().clearAuth();

  // 2. Reset in-memory state
  ApiClient().resetCredentials();

  // 3. Navigate and clear stack
  if (context.mounted) {
    Navigator.of(context).pushNamedAndRemoveUntil('/login', (route) => false);
  }
}
```

### Component 3: Journey Navigation Fix

**Location:** `apps/aegis-mobile/lib/screens/home_screen.dart`

**Purpose:** Replace SnackBar placeholder with actual navigation.

**Key Change:** Single line replacement in the Journey action card callback.

```dart
// Before (bug):
ScaffoldMessenger.of(context).showSnackBar(...);

// After (fix):
Navigator.pushNamed(context, '/journey');
```

### Component 4: Alert Supabase Sync

**Location:** `apps/aegis-mobile/lib/screens/emergency_trigger_screen.dart`, `apps/aegis-mobile/lib/services/supabase_service.dart`

**Purpose:** Persist alerts to Supabase after successful API trigger.

**Design:**
After `_apiClient.triggerEmergency()` succeeds, insert into Supabase:

```dart
// After API success in _triggerEmergency():
try {
  await SupabaseService.createAlert({
    'device_id': deviceId,
    'latitude': position.latitude,
    'longitude': position.longitude,
    'accuracy': position.accuracy,
    'timestamp': DateTime.now().toUtc().toIso8601String(),
    'battery_level': batteryLevel,
    'network_type': networkType,
    'trigger_method': 'button_hold',
  });
  await SupabaseService.addAlertLocation({
    'alert_id': alertResult['id'],
    'location': 'POINT(${position.longitude} ${position.latitude})',
    'accuracy': position.accuracy,
  });
} catch (_) {
  // Queue for retry via OfflineQueueService
  OfflineQueueService.enqueue('alert_sync', alertPayload);
}
```

### Component 5: Unified Alert Schema

**Location:** `apps/aegis-api/app/models/alert.py` (update), `src/types/aegis.ts` (update)

**Purpose:** Single schema for device-originated and victim-info alerts.

**Database Migration:**
```sql
-- Add new columns to alerts table
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS device_id UUID REFERENCES devices(id);
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS trigger_method VARCHAR(50);
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS battery_level INT;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS network_type VARCHAR(50);

-- Make victim fields nullable
ALTER TABLE alerts ALTER COLUMN victim_name DROP NOT NULL;
```

**API Normalization Logic:**
```python
# In alert creation endpoint
def normalize_alert_response(alert: dict, device_id: str | None) -> dict:
    if not alert.get("victim_name") and device_id:
        alert["victim_name"] = f"Device {device_id[:8]}"
    alert.setdefault("victim_age", None)
    alert.setdefault("victim_gender", None)
    alert.setdefault("address", None)
    return alert
```

**TypeScript Interface Update:**
```typescript
export interface Alert {
  id: string;
  victimName: string;        // Device label if no victim info
  victimAge?: number | null;  // Nullable for device-only alerts
  victimGender?: 'M' | 'F' | null;
  location: GeoLocation;
  address?: string | null;
  status: AlertStatus;
  priority: AlertPriority;
  timestamp: string;
  batteryLevel: number;
  signalStrength: string;
  guardiansNotified: number;
  guardiansAcknowledged: number;
  audioStreaming: boolean;
  deviceId?: string;
  triggerMethod?: string;
  networkType?: string;
  logEntries: LogEntry[];
}
```

### Component 6: GPS Location Service Update

**Location:** `apps/aegis-mobile/lib/services/location_service.dart`

**Purpose:** Replace deprecated `desiredAccuracy` with `LocationSettings`.

```dart
import 'package:geolocator/geolocator.dart';
import 'dart:io' show Platform;

class LocationService {
  Future<Position?> getCurrentPosition({
    bool highAccuracy = true,
    Duration timeout = const Duration(seconds: 10),
  }) async {
    try {
      final hasPermission = await requestLocationPermission();
      if (!hasPermission) return null;
      final isEnabled = await isLocationServiceEnabled();
      if (!isEnabled) return null;

      final LocationSettings settings;
      if (Platform.isAndroid) {
        settings = AndroidSettings(
          accuracy: highAccuracy
              ? LocationAccuracy.high
              : LocationAccuracy.low,
          forceLocationManager: false,
        );
      } else {
        settings = AppleSettings(
          accuracy: highAccuracy
              ? LocationAccuracy.high
              : LocationAccuracy.low,
        );
      }

      return await Geolocator.getCurrentPosition(
        locationSettings: settings,
      ).timeout(timeout);
    } catch (e) {
      // Fallback to last known position
      try {
        return await Geolocator.getLastKnownPosition();
      } catch (_) {
        return null;
      }
    }
  }
}
```

### Component 7: Permission Dialog Service

**Location:** `apps/aegis-mobile/lib/services/permission_service.dart` (new)

**Purpose:** Show rationale dialogs before system permission requests, handle permanent denial.

```dart
import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';

class PermissionService {
  bool _locationPermissionCached = false;
  PermissionStatus? _cachedStatus;

  Future<bool> requestLocationWithRationale(BuildContext context) async {
    if (_locationPermissionCached && _cachedStatus?.isGranted == true) {
      return true;
    }

    final status = await Permission.location.status;

    if (status.isGranted) {
      _cachedStatus = status;
      _locationPermissionCached = true;
      return true;
    }

    if (status.isPermanentlyDenied) {
      await _showSettingsDialog(context);
      return false;
    }

    // Show rationale before requesting
    final shouldProceed = await _showRationaleDialog(context);
    if (!shouldProceed) return false;

    final result = await Permission.location.request();
    _cachedStatus = result;
    _locationPermissionCached = true;

    if (result.isPermanentlyDenied) {
      await _showSettingsDialog(context);
      return false;
    }

    return result.isGranted;
  }

  Future<bool> _showRationaleDialog(BuildContext context) async {
    return await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Location Access Required'),
        content: const Text(
          'Aegis needs your location to send accurate emergency alerts '
          'and provide safety monitoring in your area.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Not Now'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Allow'),
          ),
        ],
      ),
    ) ?? false;
  }

  Future<void> _showSettingsDialog(BuildContext context) async {
    await showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Location Permission Required'),
        content: const Text(
          'Location access was permanently denied. '
          'Please enable it in Settings > Apps > Aegis > Permissions.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              openAppSettings();
            },
            child: const Text('Open Settings'),
          ),
        ],
      ),
    );
  }
}
```

### Component 8: Sentinel Mode BLE Scanner

**Location:** `apps/aegis-mobile/lib/services/ble_scanner_service.dart` (new), `apps/aegis-mobile/lib/screens/sentinel_mode_screen.dart` (update)

**Purpose:** Implement real BLE/WiFi scanning with flutter_blue_plus.

**Dependencies to add:** `flutter_blue_plus: any`

```dart
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
  List<ScanResult> get discoveredDevices =>
      List.unmodifiable(_discoveredDevices);
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

    // Repeat scan every 30 seconds
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
```

### Component 9: Risk Assessment with Real GPS

**Location:** `apps/aegis-mobile/lib/screens/home_screen.dart`

**Purpose:** Pass actual GPS coordinates to risk assessment instead of hardcoded values.

```dart
Future<void> _loadData() async {
  setState(() => _isLoading = true);
  try {
    await _apiClient.loadStoredCredentials();

    // Get real GPS position
    final position = await _locationService.getCurrentPosition();
    if (position != null) {
      final risk = await _apiClient.assessRisk(
        latitude: position.latitude,
        longitude: position.longitude,
      );
      if (mounted) setState(() { _riskData = risk; _isLoading = false; });
    } else {
      // No GPS: show unknown risk
      if (mounted) setState(() {
        _riskData = {'risk_score': 0.0, 'risk_level': 'Unknown'};
        _isLoading = false;
      });
    }
  } catch (e) {
    if (mounted) setState(() => _isLoading = false);
  }
}
```

### Component 10: Audio WebSocket Streaming Service

**Location:** `apps/aegis-mobile/lib/services/audio_streaming_service.dart` (new)

**Purpose:** Stream live microphone audio over WebSocket during emergencies.

```dart
import 'dart:async';
import 'dart:io';
import 'dart:typed_data';

class AudioStreamingService {
  static const int _maxChunkSize = 4096;
  static const int _maxReconnectAttempts = 3;
  static const String _wsBaseUrl = 'wss://aegiscsg.onrender.com/ws/alerts';

  WebSocket? _socket;
  bool _isStreaming = false;
  int _reconnectAttempts = 0;
  StreamSubscription? _audioSubscription;

  bool get isStreaming => _isStreaming;

  Future<bool> startStreaming(String alertId) async {
    try {
      _socket = await WebSocket.connect('$_wsBaseUrl?alert_id=$alertId');
      _isStreaming = true;
      _reconnectAttempts = 0;

      _socket!.listen(
        (_) {},
        onDone: () => _handleDisconnect(alertId),
        onError: (_) => _handleDisconnect(alertId),
      );

      return true;
    } catch (_) {
      return false;
    }
  }

  void sendAudioChunk(Uint8List audioData) {
    if (!_isStreaming || _socket == null) return;

    // Split into chunks ≤ 4096 bytes
    for (int offset = 0; offset < audioData.length; offset += _maxChunkSize) {
      final end = (offset + _maxChunkSize).clamp(0, audioData.length);
      final chunk = audioData.sublist(offset, end);
      _socket!.add(chunk);
    }
  }

  Future<void> _handleDisconnect(String alertId) async {
    if (!_isStreaming) return;

    while (_reconnectAttempts < _maxReconnectAttempts && _isStreaming) {
      _reconnectAttempts++;
      final delay = Duration(
        seconds: (1 << _reconnectAttempts), // Exponential: 2, 4, 8
      );
      await Future.delayed(delay);

      try {
        _socket = await WebSocket.connect('$_wsBaseUrl?alert_id=$alertId');
        _reconnectAttempts = 0;
        return;
      } catch (_) {
        continue;
      }
    }

    // Fallback: stop streaming, continue local recording
    _isStreaming = false;
  }

  Future<void> stopStreaming() async {
    _isStreaming = false;
    _audioSubscription?.cancel();
    await _socket?.close();
    _socket = null;
  }
}
```

### Component 11: Offline Queue Service

**Location:** `apps/aegis-mobile/lib/services/offline_queue_service.dart` (new)

**Purpose:** Wrap all network calls in try-catch, queue failed requests for retry.

```dart
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'dart:async';

class OfflineQueueService {
  static const _queueKey = 'offline_request_queue';
  static StreamSubscription? _connectivitySub;
  static bool _isRetrying = false;

  /// Wraps a network call with offline handling
  static Future<T?> withOfflineHandling<T>({
    required Future<T?> Function() networkCall,
    required String operationType,
    required Map<String, dynamic> payload,
  }) async {
    try {
      return await networkCall();
    } on SocketException {
      await enqueue(operationType, payload);
      return null;
    } on TimeoutException {
      await enqueue(operationType, payload);
      return null;
    } catch (e) {
      // Re-throw non-network errors
      if (e.toString().contains('SocketException') ||
          e.toString().contains('Connection')) {
        await enqueue(operationType, payload);
        return null;
      }
      rethrow;
    }
  }

  static Future<void> enqueue(
    String operationType,
    Map<String, dynamic> payload,
  ) async {
    final prefs = await SharedPreferences.getInstance();
    final queue = _getQueue(prefs);
    queue.add({
      'type': operationType,
      'payload': payload,
      'timestamp': DateTime.now().toIso8601String(),
    });
    await prefs.setString(_queueKey, jsonEncode(queue));
  }

  static List<Map<String, dynamic>> _getQueue(SharedPreferences prefs) {
    final data = prefs.getString(_queueKey);
    if (data == null) return [];
    try {
      final decoded = jsonDecode(data) as List;
      return decoded.map((e) => Map<String, dynamic>.from(e)).toList();
    } catch (_) {
      return [];
    }
  }

  /// Start listening for connectivity changes to retry queued requests
  static void startListening(Future<void> Function(String, Map<String, dynamic>) retryHandler) {
    _connectivitySub = Connectivity().onConnectivityChanged.listen((result) {
      if (result != ConnectivityResult.none && !_isRetrying) {
        _retryQueue(retryHandler);
      }
    });
  }

  static Future<void> _retryQueue(
    Future<void> Function(String, Map<String, dynamic>) retryHandler,
  ) async {
    _isRetrying = true;
    final prefs = await SharedPreferences.getInstance();
    final queue = _getQueue(prefs);
    final failed = <Map<String, dynamic>>[];

    for (final item in queue) {
      try {
        await retryHandler(item['type'], item['payload']);
      } catch (_) {
        failed.add(item);
      }
    }

    await prefs.setString(_queueKey, jsonEncode(failed));
    _isRetrying = false;
  }

  static void dispose() {
    _connectivitySub?.cancel();
  }
}
```

### Component 12: Settings Navigation Screens

**Location:** `apps/aegis-mobile/lib/screens/privacy_settings_screen.dart` (new), `apps/aegis-mobile/lib/screens/notifications_settings_screen.dart` (new), `apps/aegis-mobile/lib/screens/settings_screen.dart` (update)

**Purpose:** Create destination screens and wire up navigation.

```dart
// privacy_settings_screen.dart
class PrivacySettingsScreen extends StatelessWidget {
  const PrivacySettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Privacy Settings')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          SwitchListTile(
            title: const Text('End-to-end Encryption'),
            subtitle: const Text('All data is encrypted in transit'),
            value: true,
            onChanged: null, // Always enabled
          ),
          SwitchListTile(
            title: const Text('Location Sharing'),
            subtitle: const Text('Share location during emergencies only'),
            value: true,
            onChanged: (v) { /* toggle */ },
          ),
        ],
      ),
    );
  }
}
```

**Settings screen update:**
```dart
// Replace SnackBar callbacks with navigation:
ListTile(
  title: const Text('Privacy Settings'),
  onTap: () => Navigator.pushNamed(context, '/privacy_settings'),
),
ListTile(
  title: const Text('Notifications'),
  onTap: () => Navigator.pushNamed(context, '/notifications_settings'),
),
```

### Component 13: Guardian Supabase Sync

**Location:** `apps/aegis-mobile/lib/services/guardian_service.dart` (integrated with Component 1)

**Purpose:** Insert guardians to Supabase with user_id, fetch from Supabase first.

**Key behavior:**
- On `addGuardian`: save to SharedPreferences immediately, then async insert to Supabase with user_id
- On `loadGuardians`: try Supabase first, fallback to SharedPreferences on network error
- On offline add: store locally, mark as `pending_sync`, sync on connectivity restoration via OfflineQueueService

```dart
Future<void> addGuardian({
  required String userId,
  required String name,
  required String phone,
  String relationship = 'family',
}) async {
  final guardian = {
    'user_id': userId,
    'name': name,
    'phone': phone,
    'relationship': relationship,
    'status': 'offline',
  };

  // Save locally first (always succeeds)
  _guardians.add(guardian);
  final prefs = await SharedPreferences.getInstance();
  await prefs.setString(_storageKey, jsonEncode(_guardians));

  // Sync to Supabase (may fail offline)
  try {
    await SupabaseService.addGuardian(guardian);
  } catch (_) {
    await OfflineQueueService.enqueue('guardian_sync', guardian);
  }
}
```

## Data Models

### Alert Schema (Unified)

| Field | Type | Required | Source |
|-------|------|----------|--------|
| id | UUID | Yes | Auto-generated |
| device_id | UUID | Yes (device) | Mobile app |
| victim_name | VARCHAR(255) | No | Normalized by API |
| victim_age | INT | No | Web/API |
| victim_gender | VARCHAR(10) | No | Web/API |
| location | GEOGRAPHY(POINT) | Yes | Mobile GPS |
| address | VARCHAR(500) | No | Geocoded |
| status | VARCHAR(50) | Yes | Default: 'active' |
| priority | VARCHAR(20) | Yes | Default: 'medium' |
| timestamp | TIMESTAMPTZ | Yes | Mobile device |
| battery_level | INT | No | Mobile device |
| network_type | VARCHAR(50) | No | Mobile device |
| signal_strength | VARCHAR(50) | No | Mobile device |
| trigger_method | VARCHAR(50) | No | Mobile device |
| audio_streaming | BOOLEAN | Yes | Default: false |

### Guardian Schema

| Field | Type | Required |
|-------|------|----------|
| id | UUID | Yes (auto) |
| user_id | UUID | Yes |
| name | VARCHAR(255) | Yes |
| phone | VARCHAR(20) | Yes |
| relationship | VARCHAR(100) | Yes |
| status | VARCHAR(50) | Yes |
| is_active | BOOLEAN | Yes (default: true) |
| created_at | TIMESTAMPTZ | Yes (auto) |

### Offline Queue Item

| Field | Type | Description |
|-------|------|-------------|
| type | String | Operation type (alert_sync, guardian_sync) |
| payload | Map | Serialized request body |
| timestamp | String | ISO 8601 enqueue time |

## Error Handling

### Network Errors (Component 11)

All network calls across the app follow a uniform pattern:

1. **Try** the network call
2. **Catch** `SocketException`, `TimeoutException`, or connectivity errors
3. **Queue** the failed request payload via `OfflineQueueService`
4. **Display** offline indicator to user (non-blocking)
5. **Retry** automatically when connectivity is restored

### GPS Errors (Component 6)

1. **Try** `getCurrentPosition` with platform-specific settings
2. **On timeout/exception**: fall back to `getLastKnownPosition`
3. **If both fail**: return `null`, caller handles gracefully

### WebSocket Errors (Component 10)

1. **On disconnect**: retry up to 3 times with exponential backoff (2s, 4s, 8s)
2. **After max retries**: fall back to local-only recording
3. **On alert resolve**: clean close connection

### Permission Errors (Component 7)

1. **Undetermined/Denied**: show rationale dialog, then request
2. **Permanently Denied**: direct user to system settings
3. **Cache result**: avoid repeated prompts in same session

## Interfaces

### SupabaseService (Updated)

```dart
class SupabaseService {
  static Future<void> createAlert(Map<String, dynamic> data) async;
  static Future<void> addAlertLocation(Map<String, dynamic> data) async;
  static Future<void> addGuardian(Map<String, dynamic> data) async;
  static Future<List<Map<String, dynamic>>> getGuardians(String userId) async;
  static Future<void> registerDevice(Map<String, dynamic> data) async;
}
```

### API Alert Endpoint (Updated)

```
POST /api/v1/alerts/
Body: {
  device_id: string,
  timestamp: string (ISO 8601),
  location: { latitude: number, longitude: number, accuracy?: number },
  battery_level?: number,
  network_type?: string,
  signal_strength?: number,
  trigger_method?: string,
  is_silent?: boolean,
  // Optional victim info:
  victim_name?: string,
  victim_age?: number,
  victim_gender?: string,
  address?: string
}
Response: {
  id: string,
  victim_name: string,  // Normalized
  location: { lat, lng, accuracy },
  status: string,
  priority: string,
  timestamp: string,
  battery_level: number,
  signal_strength: string,
  guardians_notified: number,
  guardians_acknowledged: number,
  audio_streaming: boolean,
  log_entries: LogEntry[]
}
```

### WebSocket Audio Endpoint

```
WS /ws/alerts?alert_id={uuid}
Client → Server: raw audio bytes (chunks ≤ 4096 bytes)
Server → Web Clients: forwarded audio bytes
```

## Testing Strategy

**Unit Tests (Dart):** Verify specific examples and edge cases for each component — mock SharedPreferences, FlutterSecureStorage, Geolocator, and SupabaseClient. Use `flutter_test` with `mockito` or `mocktail` for dependency injection.

**Property Tests (Dart):** Use `glados` or `test` with custom generators to verify universal properties (serialization round-trips, chunk size constraints, offline queue behavior). Minimum 100 iterations per property.

**Integration Tests (Python):** FastAPI `TestClient` for API endpoint validation of the unified schema (Properties 3–5).

**Widget Tests (Dart):** Verify navigation flows (Journey, Settings, Logout) render correct screens and don't show SnackBar placeholders.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Guardian JSON Deserialization Round-Trip

*For any* list of guardian maps containing mixed-type values (strings, numbers, booleans, nulls), encoding to JSON and then decoding with `Map<String, dynamic>` casting SHALL produce an equivalent list without type cast exceptions.

**Validates: Requirements 1.1, 1.3**

### Property 2: Alert Supabase Insert Completeness

*For any* valid emergency alert with location data (latitude, longitude, accuracy), battery level, network type, and trigger method, the Supabase insert payload SHALL contain all required fields (device_id, latitude, longitude, timestamp, battery_level, network_type, trigger_method) and a corresponding alert_locations insert SHALL be made with matching coordinates.

**Validates: Requirements 4.1, 4.2**

### Property 3: API Alert Schema Accepts Valid Payloads

*For any* alert creation payload containing valid required fields (device_id, location, timestamp) and any combination of optional fields (victim_name, victim_age, victim_gender, address, battery_level, network_type, signal_strength, trigger_method), the API SHALL accept the request and return a success response.

**Validates: Requirements 5.1, 5.2**

### Property 4: Alert Response Normalization

*For any* alert creation request without victim_name, the API response SHALL populate victim_name with a device identifier label derived from the device_id, and SHALL set victim_age, victim_gender, and address to null.

**Validates: Requirements 5.3**

### Property 5: Alert Response Structure Consistency

*For any* alert creation request (with or without victim information), the API response SHALL contain all fields: id, victim_name, location, status, priority, timestamp, battery_level, signal_strength, guardians_notified, guardians_acknowledged, audio_streaming, and log_entries.

**Validates: Requirements 5.5**

### Property 6: GPS Fallback on Exception

*For any* exception thrown by `Geolocator.getCurrentPosition` (timeout, platform exception, or location service disabled), the LocationService SHALL attempt `getLastKnownPosition` as a fallback before returning null.

**Validates: Requirements 6.3**

### Property 7: BLE Scan Interval Constraint

*For any* duration that Sentinel Mode is active, BLE scans SHALL occur at intervals no greater than 30 seconds, and the discovered device count displayed SHALL equal the number of unique devices detected in the most recent scan.

**Validates: Requirements 8.2, 8.3**

### Property 8: Sentinel Mode Resource Cleanup

*For any* active Sentinel Mode session with ongoing BLE scans, deactivating Sentinel Mode SHALL stop all scan timers, cancel BLE discovery, and clear the discovered devices list to zero.

**Validates: Requirements 8.5**

### Property 9: Risk Assessment Uses Real Coordinates

*For any* GPS position returned by LocationService, the risk assessment API call SHALL pass those exact latitude and longitude values rather than any hardcoded constants.

**Validates: Requirements 9.1**

### Property 10: Audio Chunk Size Constraint

*For any* audio data of arbitrary size streamed over WebSocket, every transmitted chunk SHALL be no larger than 4096 bytes.

**Validates: Requirements 10.2**

### Property 11: WebSocket Reconnect with Exponential Backoff

*For any* WebSocket disconnection during active streaming, the service SHALL attempt reconnection up to 3 times with delays following exponential backoff (each delay ≥ double the previous), and SHALL stop streaming after exhausting retries.

**Validates: Requirements 10.5**

### Property 12: Offline Resilience with Request Queuing

*For any* network request that throws a connectivity exception (SocketException, TimeoutException), the app SHALL not crash, SHALL queue the request payload locally, and SHALL retry all queued requests when connectivity is restored.

**Validates: Requirements 11.1, 11.3**

### Property 13: Offline Data Accessibility

*For any* previously cached data (guardian list, last risk level, settings), the data SHALL remain accessible via local storage reads while the device has no internet connectivity.

**Validates: Requirements 11.2**

### Property 14: Guardian Insert Includes User ID

*For any* guardian added by an authenticated user, the Supabase insert payload SHALL include the authenticated user_id along with name, phone, relationship, and status fields.

**Validates: Requirements 13.1, 13.4**

### Property 15: Audio Server Forwarding

*For any* audio byte sequence received on the `ws/alerts` WebSocket endpoint, the API server SHALL forward the identical bytes to all connected Web Command Center clients subscribed to that alert.

**Validates: Requirements 10.3**
