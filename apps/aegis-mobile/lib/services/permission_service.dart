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
        ) ??
        false;
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
