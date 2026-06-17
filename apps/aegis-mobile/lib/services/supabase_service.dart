import 'package:supabase/supabase.dart';

class SupabaseService {
  static const _url = 'https://mnxeqxgesletaddvcouy.supabase.co';
  static const _anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ueGVxeGdlc2xldGFkZHZjb3V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMTkwNTcsImV4cCI6MjA5NjY5NTA1N30.xACkhvz6L5UoL6nYrnG0R19eSkLReahKagxY6nC4Urk';

  static final SupabaseClient _client = SupabaseClient(_url, _anonKey);
  static SupabaseClient get client => _client;

  static Future<void> addGuardian(Map<String, dynamic> data) async {
    await client.from('guardians').insert(data);
  }

  static Future<List<Map<String, dynamic>>> getGuardians(String userId) async {
    final response = await client.from('guardians').select().eq('user_id', userId);
    return List<Map<String, dynamic>>.from(response);
  }

  static Future<void> createAlert(Map<String, dynamic> data) async {
    await client.from('alerts').insert(data);
  }

  static Future<void> registerDevice(Map<String, dynamic> data) async {
    await client.from('devices').upsert(data);
  }

  static Future<void> addAlertLocation(Map<String, dynamic> data) async {
    await client.from('alert_locations').insert(data);
  }
}
