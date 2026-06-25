import 'dart:convert';
import 'dart:io';
import 'dart:async';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

class OfflineQueueService {
  static const _queueKey = 'offline_request_queue';
  static StreamSubscription<List<ConnectivityResult>>? _connectivitySub;
  static bool _isRetrying = false;

  /// Wraps a network call with offline handling.
  /// Returns the result of [networkCall] on success, or null if the request
  /// was queued due to a network error.
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

  /// Persists a failed request to SharedPreferences for later retry.
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

  /// Start listening for connectivity changes to retry queued requests.
  /// [retryHandler] is called for each queued item when connectivity is restored.
  static void startListening(
    Future<void> Function(String, Map<String, dynamic>) retryHandler,
  ) {
    _connectivitySub =
        Connectivity().onConnectivityChanged.listen((List<ConnectivityResult> results) {
      final hasConnection =
          results.isNotEmpty && !results.contains(ConnectivityResult.none);
      if (hasConnection && !_isRetrying) {
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
        await retryHandler(
          item['type'] as String,
          Map<String, dynamic>.from(item['payload'] as Map),
        );
      } catch (_) {
        failed.add(item);
      }
    }

    await prefs.setString(_queueKey, jsonEncode(failed));
    _isRetrying = false;
  }

  /// Cancel connectivity listener and release resources.
  static void dispose() {
    _connectivitySub?.cancel();
    _connectivitySub = null;
  }
}
