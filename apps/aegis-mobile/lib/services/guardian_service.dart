import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'supabase_service.dart';
import 'offline_queue_service.dart';

/// Service for managing guardian persistence with SharedPreferences and Supabase sync.
///
/// Fixes:
/// - Decodes JSON with Map<String, dynamic> cast (not Map<String, String>)
/// - Handles null/malformed JSON gracefully (returns empty list)
/// - Awaits save before updating in-memory list
/// - Syncs guardians to/from Supabase with offline fallback
class GuardianService {
  static const _storageKey = 'guardians';
  List<Map<String, dynamic>> _guardians = [];

  /// Returns an unmodifiable view of the current guardian list.
  List<Map<String, dynamic>> get guardians => List.unmodifiable(_guardians);

  /// Load guardians: tries Supabase first, falls back to SharedPreferences.
  ///
  /// On Supabase success, caches results locally for offline access.
  /// On any network/Supabase error, returns locally cached data.
  Future<List<Map<String, dynamic>>> loadGuardians(String userId) async {
    try {
      final remote = await SupabaseService.getGuardians(userId);
      _guardians = remote;
      // Cache locally for offline access
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_storageKey, jsonEncode(_guardians));
      return _guardians;
    } catch (_) {
      return loadFromPrefs();
    }
  }

  /// Load guardians from SharedPreferences with proper typing.
  ///
  /// Returns an empty list if data is null, not a JSON array,
  /// or contains malformed JSON — never throws.
  Future<List<Map<String, dynamic>>> loadFromPrefs() async {
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

  /// Add a guardian with Supabase sync.
  ///
  /// Saves locally first (always succeeds), then attempts async Supabase insert
  /// with the authenticated user_id. On network failure, queues via OfflineQueueService
  /// for retry when connectivity is restored.
  Future<void> addGuardianWithSync({
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
    final newList = [..._guardians, guardian];
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_storageKey, jsonEncode(newList));
    _guardians = newList;

    // Sync to Supabase (may fail offline)
    try {
      await SupabaseService.addGuardian(guardian);
    } catch (_) {
      await OfflineQueueService.enqueue('guardian_sync', guardian);
    }
  }

  /// Add a guardian: awaits SharedPreferences save BEFORE updating in-memory list.
  ///
  /// This prevents timing-related data loss where the in-memory state diverges
  /// from persisted state if the save fails.
  Future<void> addGuardian(Map<String, dynamic> guardian) async {
    final newList = [..._guardians, guardian];
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_storageKey, jsonEncode(newList));
    _guardians = newList;
  }

  /// Remove a guardian by index: awaits save before updating in-memory list.
  ///
  /// Returns silently if index is out of bounds.
  Future<void> removeGuardian(int index) async {
    if (index < 0 || index >= _guardians.length) return;
    final newList = List<Map<String, dynamic>>.from(_guardians)
      ..removeAt(index);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_storageKey, jsonEncode(newList));
    _guardians = newList;
  }
}
