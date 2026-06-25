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
