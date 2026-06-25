# Implementation Plan: Aegis Critical Fixes

## Overview

Fix all P0 and P1 bugs across the Aegis platform (Flutter mobile, FastAPI backend, React web dashboard). Tasks follow the design's implementation order: persistence and auth fixes first, then API schema unification, then new services (BLE, audio, offline), then settings/navigation polish. Each task builds incrementally so no code is orphaned.

## Tasks

- [x] 1. Set up dependencies and project scaffolding
  - [x] 1.1 Add required dependencies to pubspec.yaml
    - Add `flutter_blue_plus`, `connectivity_plus`, `permission_handler` to `apps/aegis-mobile/pubspec.yaml`
    - Run `flutter pub get` to verify resolution
    - _Requirements: 8.1, 7.1, 11.1_

  - [x] 1.2 Create Supabase database migration for unified alert schema
    - Create `supabase/migrations/YYYYMMDDHHMMSS_unified_alert_schema.sql`
    - Add columns: `device_id UUID`, `trigger_method VARCHAR(50)`, `battery_level INT`, `network_type VARCHAR(50)` to alerts table
    - Make `victim_name` nullable
    - Create `guardians` table with `id`, `user_id`, `name`, `phone`, `relationship`, `status`, `is_active`, `created_at`
    - _Requirements: 5.1, 13.1_

- [x] 2. Implement Guardian Persistence Service
  - [x] 2.1 Create GuardianService with SharedPreferences fix
    - Create `apps/aegis-mobile/lib/services/guardian_service.dart`
    - Decode JSON with `Map<String, dynamic>` cast (not `Map<String, String>`)
    - Handle null/malformed JSON gracefully (return empty list)
    - Await save before updating in-memory list
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ]* 2.2 Write property test for guardian JSON round-trip
    - **Property 1: Guardian JSON Deserialization Round-Trip**
    - Generate lists of guardian maps with mixed-type values, verify encode→decode produces equivalent list
    - **Validates: Requirements 1.1, 1.3**

  - [x] 2.3 Implement Guardian Supabase sync in GuardianService
    - Add `loadGuardians(userId)`: try Supabase first, fallback to SharedPreferences
    - Add `addGuardian(userId, name, phone, relationship)`: save locally, then async Supabase insert with user_id
    - Queue failed inserts via OfflineQueueService
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

  - [ ]* 2.4 Write property test for guardian insert includes user_id
    - **Property 14: Guardian Insert Includes User ID**
    - For any guardian added by authenticated user, verify Supabase payload includes user_id, name, phone, relationship, status
    - **Validates: Requirements 13.1, 13.4**

- [x] 3. Implement Authentication Logout Fix
  - [x] 3.1 Implement full logout state cleanup
    - Update `apps/aegis-mobile/lib/screens/settings_screen.dart` logout handler
    - Clear FlutterSecureStorage (auth token, API key, device ID, user ID)
    - Reset in-memory ApiClient credentials
    - Navigate with `pushNamedAndRemoveUntil('/login', (route) => false)`
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ]* 3.2 Write widget test for logout navigation stack cleanup
    - Verify that after logout, back navigation does not reach authenticated screens
    - Verify FlutterSecureStorage is empty after logout
    - _Requirements: 2.3_

- [x] 4. Checkpoint - Core persistence and auth fixes
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement GPS Location Service Update
  - [x] 5.1 Update LocationService to use LocationSettings API
    - Modify `apps/aegis-mobile/lib/services/location_service.dart`
    - Replace deprecated `desiredAccuracy` with `AndroidSettings` / `AppleSettings`
    - Add timeout handling with fallback to `getLastKnownPosition`
    - Return null if both fail
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ]* 5.2 Write property test for GPS fallback behavior
    - **Property 6: GPS Fallback on Exception**
    - For any exception from getCurrentPosition, verify getLastKnownPosition is attempted before returning null
    - **Validates: Requirements 6.3**

- [x] 6. Implement Permission Dialog Service
  - [x] 6.1 Create PermissionService with rationale dialogs
    - Create `apps/aegis-mobile/lib/services/permission_service.dart`
    - Show rationale dialog before requesting location permission
    - Handle permanent denial with settings redirect
    - Cache permission result to avoid repeated prompts in same session
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ]* 6.2 Write widget test for permission rationale dialog display
    - Verify rationale dialog appears when permission is undetermined
    - Verify settings dialog appears when permanently denied
    - _Requirements: 7.1, 7.2_

- [x] 7. Implement Offline Queue Service
  - [x] 7.1 Create OfflineQueueService with try-catch wrapper and retry
    - Create `apps/aegis-mobile/lib/services/offline_queue_service.dart`
    - Implement `withOfflineHandling<T>()` wrapper for network calls
    - Implement `enqueue()` to persist failed requests to SharedPreferences
    - Listen for connectivity changes and retry queued requests
    - _Requirements: 11.1, 11.2, 11.3_

  - [ ]* 7.2 Write property test for offline resilience with request queuing
    - **Property 12: Offline Resilience with Request Queuing**
    - For any network exception (SocketException, TimeoutException), verify no crash, payload queued, retried on reconnect
    - **Validates: Requirements 11.1, 11.3**

  - [ ]* 7.3 Write property test for offline data accessibility
    - **Property 13: Offline Data Accessibility**
    - For any previously cached data, verify it remains accessible via local storage while offline
    - **Validates: Requirements 11.2**

- [x] 8. Checkpoint - Location, permissions, and offline services
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement Unified Alert Schema (API + Web)
  - [x] 9.1 Update API alert models and creation endpoint
    - Update `apps/aegis-api/app/models/schemas.py` to accept device_id, trigger_method, battery_level, network_type, signal_strength fields
    - Accept optional victim_name, victim_age, victim_gender, address
    - Implement normalization: populate victim_name from device_id if absent, set optional fields to null
    - _Requirements: 5.1, 5.2, 5.3, 5.5_

  - [x] 9.2 Update API alert router response structure
    - Update `apps/aegis-api/app/routers/alerts.py` to return consistent response with all fields
    - Include id, victim_name, location, status, priority, timestamp, battery_level, signal_strength, guardians_notified, guardians_acknowledged, audio_streaming, log_entries
    - _Requirements: 5.5_

  - [ ]* 9.3 Write property test for API alert schema accepts valid payloads
    - **Property 3: API Alert Schema Accepts Valid Payloads**
    - Generate valid payloads with required + random optional fields, verify API accepts all
    - **Validates: Requirements 5.1, 5.2**

  - [ ]* 9.4 Write property test for alert response normalization
    - **Property 4: Alert Response Normalization**
    - For alerts without victim_name, verify response has device label and nulled optional fields
    - **Validates: Requirements 5.3**

  - [ ]* 9.5 Write property test for alert response structure consistency
    - **Property 5: Alert Response Structure Consistency**
    - For any alert creation, verify response contains all required fields
    - **Validates: Requirements 5.5**

  - [x] 9.6 Update TypeScript Alert interface and web types
    - Update `src/types/aegis.ts` with unified Alert interface (deviceId, triggerMethod, networkType optional fields)
    - Update `src/services/aegis-db.ts` to handle both device-originated and victim-info alerts
    - _Requirements: 5.4_

- [x] 10. Implement Alert Supabase Sync (Mobile)
  - [x] 10.1 Add SupabaseService alert methods and wire to emergency trigger
    - Update `apps/aegis-mobile/lib/services/supabase_service.dart` with `createAlert()` and `addAlertLocation()` methods
    - Update `apps/aegis-mobile/lib/screens/emergency_trigger_screen.dart` to call Supabase after API success
    - Queue failed inserts via OfflineQueueService
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]* 10.2 Write property test for alert Supabase insert completeness
    - **Property 2: Alert Supabase Insert Completeness**
    - For any valid alert with location, verify payload contains all required fields and alert_locations insert is made
    - **Validates: Requirements 4.1, 4.2**

- [x] 11. Implement Journey Navigation and Home Screen Fixes
  - [x] 11.1 Fix Journey Mode navigation on home screen
    - Update `apps/aegis-mobile/lib/screens/home_screen.dart`
    - Replace SnackBar placeholder with `Navigator.pushNamed(context, '/journey')`
    - _Requirements: 3.1, 3.2_

  - [x] 11.2 Fix risk assessment to use real GPS coordinates
    - Update `_loadData()` in `apps/aegis-mobile/lib/screens/home_screen.dart`
    - Get real position from LocationService, pass to `assessRisk()`
    - Show "Unknown" risk level if GPS unavailable
    - _Requirements: 9.1, 9.2_

  - [ ]* 11.3 Write property test for risk assessment uses real coordinates
    - **Property 9: Risk Assessment Uses Real Coordinates**
    - For any GPS position from LocationService, verify the exact lat/lng are passed to the API (no hardcoded values)
    - **Validates: Requirements 9.1**

- [x] 12. Checkpoint - API schema, alert sync, and navigation
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Implement Sentinel Mode BLE Scanning
  - [x] 13.1 Create BleScannerService with flutter_blue_plus
    - Create `apps/aegis-mobile/lib/services/ble_scanner_service.dart`
    - Implement `startScanning()` with permission requests (BLUETOOTH_SCAN, BLUETOOTH_CONNECT, LOCATION)
    - Scan every 30 seconds, expose device stream
    - Implement `stopScanning()` to cancel timers and release resources
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 13.2 Wire BleScannerService into Sentinel Mode screen
    - Update `apps/aegis-mobile/lib/screens/sentinel_mode_screen.dart`
    - Display discovered device count and anonymized identifiers with signal strength
    - Start scan on activation, stop on deactivation
    - _Requirements: 8.3, 8.5_

  - [ ]* 13.3 Write property test for BLE scan interval constraint
    - **Property 7: BLE Scan Interval Constraint**
    - Verify scans occur at intervals ≤ 30 seconds and device count matches unique devices in latest scan
    - **Validates: Requirements 8.2, 8.3**

  - [ ]* 13.4 Write property test for Sentinel Mode resource cleanup
    - **Property 8: Sentinel Mode Resource Cleanup**
    - Verify deactivation stops timers, cancels BLE, clears device list to zero
    - **Validates: Requirements 8.5**

- [x] 14. Implement Audio WebSocket Streaming
  - [x] 14.1 Create AudioStreamingService
    - Create `apps/aegis-mobile/lib/services/audio_streaming_service.dart`
    - Implement `startStreaming(alertId)` to open WebSocket
    - Implement `sendAudioChunk()` splitting data into ≤ 4096 byte chunks
    - Implement reconnect with exponential backoff (3 attempts: 2s, 4s, 8s)
    - Implement `stopStreaming()` to close connection
    - _Requirements: 10.1, 10.2, 10.4, 10.5_

  - [x] 14.2 Wire audio streaming into emergency trigger flow
    - Update `apps/aegis-mobile/lib/screens/emergency_trigger_screen.dart`
    - Start streaming after alert triggers successfully
    - Stop streaming when alert is resolved or cancelled
    - _Requirements: 10.1, 10.4_

  - [ ]* 14.3 Write property test for audio chunk size constraint
    - **Property 10: Audio Chunk Size Constraint**
    - For any audio data of arbitrary size, verify every transmitted chunk is ≤ 4096 bytes
    - **Validates: Requirements 10.2**

  - [ ]* 14.4 Write property test for WebSocket reconnect with exponential backoff
    - **Property 11: WebSocket Reconnect with Exponential Backoff**
    - Verify up to 3 reconnection attempts with each delay ≥ double the previous, then stop streaming
    - **Validates: Requirements 10.5**

- [x] 15. Implement Settings Navigation Screens
  - [x] 15.1 Create Privacy Settings and Notifications Settings screens
    - Create `apps/aegis-mobile/lib/screens/privacy_settings_screen.dart`
    - Create `apps/aegis-mobile/lib/screens/notifications_settings_screen.dart`
    - _Requirements: 12.1, 12.2_

  - [x] 15.2 Wire settings navigation and About dialog
    - Update `apps/aegis-mobile/lib/screens/settings_screen.dart`
    - Replace SnackBar placeholders with `Navigator.pushNamed()` for Privacy and Notifications
    - Implement About dialog with app name, version, and legal info
    - _Requirements: 12.1, 12.2, 12.3_

  - [x] 15.3 Register all new routes in main.dart
    - Update `apps/aegis-mobile/lib/main.dart`
    - Add routes: `/privacy_settings`, `/notifications_settings`
    - Verify all existing routes (`/journey`, `/login`, etc.) remain registered
    - _Requirements: 3.1, 12.1, 12.2_

- [x] 16. Final checkpoint - All features integrated
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document (15 properties total)
- Unit/widget tests validate specific examples and edge cases
- Flutter services (guardian, permission, BLE, audio, offline) are all new files — no merge conflicts expected
- API and TypeScript changes are additive (new columns, new optional fields) — backward compatible
- The offline queue service (task 7) must be created before tasks that depend on it (10, 13, 14)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "5.1", "7.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "3.1", "5.2", "6.1", "7.2", "7.3"] },
    { "id": 3, "tasks": ["2.4", "3.2", "6.2", "9.1", "9.6", "11.1"] },
    { "id": 4, "tasks": ["9.2", "9.3", "9.4", "10.1", "11.2"] },
    { "id": 5, "tasks": ["9.5", "10.2", "11.3", "13.1", "14.1", "15.1"] },
    { "id": 6, "tasks": ["13.2", "13.3", "14.2", "14.3", "15.2"] },
    { "id": 7, "tasks": ["13.4", "14.4", "15.3"] }
  ]
}
```
