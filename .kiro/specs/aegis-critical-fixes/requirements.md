# Requirements Document

## Introduction

This document specifies requirements for fixing all P0 (critical) and P1 (important) bugs in the Aegis CSG multi-app civilian safety platform. The platform consists of a Flutter mobile app (aegis-mobile), a FastAPI backend (aegis-api), and a React web command center (aegis-web), all backed by Supabase PostgreSQL with PostGIS. These fixes address guardian persistence failures, authentication state leaks, navigation errors, alert synchronization gaps, schema mismatches, deprecated API usage, missing permissions dialogs, non-functional Sentinel Mode scanning, hardcoded risk assessment coordinates, absent audio streaming, crash-on-offline errors, non-navigating settings items, and missing Supabase guardian sync.

## Glossary

- **Mobile_App**: The Flutter-based Aegis Sentinel mobile application (apps/aegis-mobile)
- **API_Server**: The FastAPI backend service (apps/aegis-api)
- **Web_Command_Center**: The React + Vite + TypeScript web dashboard (src/)
- **Guardian**: A trusted contact designated to receive emergency alerts on behalf of a user
- **Sentinel_Mode**: A background scanning feature that detects nearby BLE/WiFi devices for threat assessment
- **Journey_Mode**: A travel safety feature that tracks user location and sends periodic check-ins to guardians
- **Alert**: An emergency notification created by the Mobile_App and routed through the API_Server to the Web_Command_Center
- **Supabase**: The PostgreSQL + PostGIS cloud database used for persistent storage and real-time sync
- **SharedPreferences**: Local key-value storage on the mobile device used for guardian caching
- **BLE**: Bluetooth Low Energy protocol used for proximity device scanning
- **WebSocket**: A persistent bidirectional connection used for real-time audio streaming
- **Oracle_Service**: The risk assessment and anomaly detection module within the API_Server (services/oracle)

## Requirements

### Requirement 1: Guardian Local Persistence

**User Story:** As a user, I want my guardian list to persist correctly between app sessions, so that I do not lose my emergency contacts.

#### Acceptance Criteria

1. WHEN the Mobile_App loads guardians from SharedPreferences, THE Mobile_App SHALL decode the stored JSON array and cast each element to `Map<String, dynamic>` instead of `Map<String, String>` to prevent type cast failures.
2. WHEN the Mobile_App adds a new guardian, THE Mobile_App SHALL await the SharedPreferences save operation before updating the in-memory guardian list to prevent timing-related data loss.
3. IF SharedPreferences returns null or contains malformed JSON, THEN THE Mobile_App SHALL initialize an empty guardian list without throwing an exception.

### Requirement 2: Authentication State Cleanup on Logout

**User Story:** As a user, I want logout to fully clear my session, so that no stale authentication data remains on the device.

#### Acceptance Criteria

1. WHEN the user confirms logout, THE Mobile_App SHALL clear all keys from FlutterSecureStorage including auth token, API key, device ID, and user ID.
2. WHEN the user confirms logout, THE Mobile_App SHALL reset all in-memory authentication state held by services and BLoC instances before navigating to the login screen.
3. WHEN the Mobile_App navigates to the login screen after logout, THE Mobile_App SHALL remove all previous routes from the navigation stack to prevent back-navigation to authenticated screens.

### Requirement 3: Journey Mode Navigation

**User Story:** As a user, I want to access Journey Mode from the home screen, so that I can track my travel with guardian notifications.

#### Acceptance Criteria

1. WHEN the user taps the Journey action card on the home screen, THE Mobile_App SHALL navigate to the Journey Mode screen using the registered `/journey` route.
2. THE Mobile_App SHALL display the Journey Mode screen with destination input and journey controls instead of showing a SnackBar placeholder message.

### Requirement 4: Emergency Alert Supabase Synchronization

**User Story:** As a user, I want my emergency alerts stored in Supabase, so that my alert history persists and the Web_Command_Center can access real-time data.

#### Acceptance Criteria

1. WHEN the Mobile_App triggers an emergency alert, THE Mobile_App SHALL insert the alert record into the Supabase `alerts` table with device_id, location (latitude, longitude, accuracy), timestamp, battery_level, network_type, and trigger_method fields.
2. WHEN the Mobile_App inserts an alert into Supabase, THE Mobile_App SHALL also insert the associated location data into the Supabase `alert_locations` table with PostGIS geometry.
3. IF the Supabase insert fails due to network error, THEN THE Mobile_App SHALL queue the alert locally and retry the insert when connectivity is restored.

### Requirement 5: Unified Alert Schema

**User Story:** As a developer, I want a single alert schema consumed by both mobile and web clients, so that all platforms display consistent alert data.

#### Acceptance Criteria

1. THE API_Server SHALL accept alert creation requests containing device_id, location (lat, lng, accuracy), timestamp, battery_level, network_type, signal_strength, and trigger_method fields from the Mobile_App.
2. THE API_Server SHALL accept optional victim information fields (victim_name, victim_age, victim_gender, address) in the same alert creation endpoint.
3. WHEN the API_Server receives an alert from the Mobile_App without victim information, THE API_Server SHALL normalize the response by populating victim_name with a device identifier label and setting optional victim fields to null.
4. THE Web_Command_Center SHALL read alerts from the unified schema and render both device-originated alerts and victim-info alerts using the same Alert TypeScript interface.
5. THE API_Server SHALL return alert responses with a consistent structure containing id, victim_name, location, status, priority, timestamp, battery_level, signal_strength, guardians_notified, guardians_acknowledged, audio_streaming, and log_entries fields.

### Requirement 6: GPS Location Using Current Geolocator API

**User Story:** As a user, I want accurate GPS location on all devices including emulators, so that my emergency alerts include correct coordinates.

#### Acceptance Criteria

1. THE Mobile_App SHALL use the `LocationSettings` parameter (or `AndroidSettings` / `AppleSettings` as appropriate) instead of the deprecated `desiredAccuracy` parameter when calling `Geolocator.getCurrentPosition`.
2. WHEN the Mobile_App runs on an Android emulator, THE Mobile_App SHALL retrieve the emulated GPS position without failure by using the updated Geolocator API.
3. IF `Geolocator.getCurrentPosition` throws a timeout or platform exception, THEN THE Mobile_App SHALL fall back to `Geolocator.getLastKnownPosition` and return that position to the caller.

### Requirement 7: Location Permission Dialog

**User Story:** As a user, I want to be prompted for location permission with a clear explanation, so that I understand why Aegis needs my location.

#### Acceptance Criteria

1. WHEN the Mobile_App requires location access and the permission status is undetermined or denied, THE Mobile_App SHALL display a rationale dialog explaining that location is used for emergency alerts and safety monitoring before invoking the system permission request.
2. WHEN the user denies location permission permanently, THE Mobile_App SHALL display guidance directing the user to the device settings page to enable location access manually.
3. THE Mobile_App SHALL request location permission at app startup or before the first location-dependent action, and SHALL cache the permission result to avoid repeated prompts within the same session.

### Requirement 8: Sentinel Mode BLE/WiFi Scanning

**User Story:** As a user, I want Sentinel Mode to perform real wireless scanning, so that nearby device detection provides actual threat intelligence.

#### Acceptance Criteria

1. WHEN the user activates Sentinel Mode, THE Mobile_App SHALL start a BLE scan using the flutter_blue_plus package (or nearby_connections) to discover nearby Bluetooth devices.
2. WHILE Sentinel Mode is active, THE Mobile_App SHALL scan for nearby WiFi networks and BLE devices at an interval no greater than 30 seconds.
3. WHEN Sentinel Mode discovers nearby devices, THE Mobile_App SHALL display the count of detected devices and update the UI with scan results including anonymized device identifiers and signal strength.
4. WHEN the user activates Sentinel Mode, THE Mobile_App SHALL request Bluetooth and nearby devices permissions (ACCESS_FINE_LOCATION, BLUETOOTH_SCAN, BLUETOOTH_CONNECT on Android 12+) before starting the scan.
5. WHEN the user deactivates Sentinel Mode, THE Mobile_App SHALL stop all active BLE and WiFi scans and release associated system resources.

### Requirement 9: Risk Assessment with Real GPS Coordinates

**User Story:** As a user, I want risk assessment based on my actual location, so that safety recommendations are relevant to where I am.

#### Acceptance Criteria

1. WHEN the Mobile_App requests a risk assessment from the home screen, THE Mobile_App SHALL pass the real GPS coordinates obtained from the LocationService to the `/oracle/risk/assess` endpoint instead of hardcoded latitude and longitude values.
2. IF the Mobile_App cannot obtain a GPS position before requesting risk assessment, THEN THE Mobile_App SHALL display a risk level of "Unknown" with a message indicating location is unavailable, instead of sending hardcoded coordinates.

### Requirement 10: Audio Streaming During Emergencies

**User Story:** As a user, I want audio from my device streamed to the command center during an emergency, so that responders have real-time situational awareness.

#### Acceptance Criteria

1. WHEN an emergency alert is triggered, THE Mobile_App SHALL open a WebSocket connection to the API_Server `ws/alerts` endpoint and begin streaming raw audio bytes from the device microphone.
2. WHILE an emergency alert is active, THE Mobile_App SHALL continuously stream audio data over the WebSocket connection in chunks no larger than 4096 bytes.
3. WHEN the API_Server receives audio bytes on the `ws/alerts` WebSocket, THE API_Server SHALL forward the audio stream to connected Web_Command_Center clients for real-time monitoring.
4. WHEN the emergency alert is resolved or the user cancels the alert, THE Mobile_App SHALL close the WebSocket connection and stop microphone recording.
5. IF the WebSocket connection drops during streaming, THEN THE Mobile_App SHALL attempt to reconnect up to 3 times with exponential backoff before falling back to local-only recording.

### Requirement 11: Offline Crash Prevention

**User Story:** As a user, I want the app to remain functional without internet, so that core safety features are accessible in areas with poor connectivity.

#### Acceptance Criteria

1. WHEN the Mobile_App makes any network request (HTTP or WebSocket) and the device has no internet connectivity, THE Mobile_App SHALL catch the network exception and display a user-friendly offline indicator instead of crashing.
2. WHILE the device is offline, THE Mobile_App SHALL allow the user to access locally cached data including guardian list, last known risk level, and app settings.
3. IF a network request fails due to connectivity loss, THEN THE Mobile_App SHALL queue the request payload locally and retry when connectivity is restored, for operations including alert creation and guardian sync.

### Requirement 12: Settings Navigation

**User Story:** As a user, I want settings items to navigate to their respective detail screens, so that I can configure privacy, notifications, and view app information.

#### Acceptance Criteria

1. WHEN the user taps "Privacy Settings" in the Settings screen, THE Mobile_App SHALL navigate to a Privacy Settings detail screen instead of showing a SnackBar message.
2. WHEN the user taps "Notifications" in the Settings screen, THE Mobile_App SHALL navigate to a Notifications Settings detail screen instead of showing a SnackBar message.
3. WHEN the user taps "About Aegis" in the Settings screen, THE Mobile_App SHALL display the About dialog with application name, version, and legal information.

### Requirement 13: Guardian Supabase Persistence

**User Story:** As a user, I want my guardians synced to Supabase, so that my guardian list is available across devices and accessible to the backend for notifications.

#### Acceptance Criteria

1. WHEN the Mobile_App adds a new guardian, THE Mobile_App SHALL insert the guardian record into the Supabase `guardians` table with user_id, name, phone, relationship, and status fields.
2. WHEN the Mobile_App loads guardians, THE Mobile_App SHALL first attempt to fetch the guardian list from Supabase and fall back to SharedPreferences if the network request fails.
3. IF a guardian is added while offline, THEN THE Mobile_App SHALL store the guardian locally and sync the record to Supabase when connectivity is restored.
4. THE Mobile_App SHALL associate each guardian record with the authenticated user_id to prevent cross-user data leakage.
