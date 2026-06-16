import 'dart:async';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'dart:io';

class AudioService {
  bool _isRecording = false;
  String? _currentRecordingPath;
  String? _currentAlertId;
  Timer? _chunkTimer;
  int _chunkIndex = 0;
  final List<String> _pendingChunks = [];

  Future<bool> requestMicrophonePermission() async {
    final status = await Permission.microphone.status;
    if (status.isGranted) return true;
    if (status.isPermanentlyDenied) return false;
    final result = await Permission.microphone.request();
    return result.isGranted;
  }

  Future<bool> startRecording(String alertId) async {
    if (_isRecording) return false;
    final hasPermission = await requestMicrophonePermission();
    if (!hasPermission) return false;
    try {
      final directory = await getApplicationDocumentsDirectory();
      final recordingDir = Directory('${directory.path}/aegis_recordings');
      if (!await recordingDir.exists()) await recordingDir.create(recursive: true);
      _currentAlertId = alertId;
      _currentRecordingPath = '${recordingDir.path}/${alertId}_chunk_0.aac';
      _chunkIndex = 0;
      _pendingChunks.clear();
      _isRecording = true;
      _chunkTimer = Timer.periodic(const Duration(seconds: 30), (_) { _rotateChunk(); });
      return true;
    } catch (e) { return false; }
  }

  void _rotateChunk() {
    if (!_isRecording) return;
    _chunkIndex++;
    final directory = '${_currentRecordingPath!.split('_chunk_')[0]}_chunk_$_chunkIndex.aac';
    _pendingChunks.add(_currentRecordingPath!);
    _currentRecordingPath = directory;
  }

  Future<List<String>> stopRecording() async {
    if (!_isRecording) return [];
    _isRecording = false;
    _chunkTimer?.cancel();
    _chunkTimer = null;
    if (_currentRecordingPath != null) _pendingChunks.add(_currentRecordingPath!);
    final chunks = List<String>.from(_pendingChunks);
    _pendingChunks.clear();
    return chunks;
  }

  String? get currentRecordingPath => _currentRecordingPath;
  bool get isRecording => _isRecording;
  List<String> get pendingChunks => List.unmodifiable(_pendingChunks);

  Future<void> cleanupOldRecordings() async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final recordingDir = Directory('${directory.path}/aegis_recordings');
      if (!await recordingDir.exists()) return;
      final cutoff = DateTime.now().subtract(const Duration(hours: 24));
      await for (final file in recordingDir.list()) {
        if (file is File) {
          final modified = await file.lastModified();
          if (modified.isBefore(cutoff)) await file.delete();
        }
      }
    } catch (_) {}
  }

  Future<void> deleteAlertRecordings(String alertId) async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final recordingDir = Directory('${directory.path}/aegis_recordings');
      if (!await recordingDir.exists()) return;
      await for (final file in recordingDir.list()) {
        if (file is File) {
          final name = file.path.split('/').last;
          if (name.startsWith(alertId)) await file.delete();
        }
      }
    } catch (_) {}
  }

  void dispose() { _chunkTimer?.cancel(); }
}
