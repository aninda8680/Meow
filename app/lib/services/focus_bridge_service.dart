import 'package:flutter/services.dart';

/// Bridges Flutter focus state to native Android:
///   - Sets DND mode via NotificationManager
///   - Updates FocusStateStore (used by FocusCallScreeningService)
class FocusBridgeService {
  static final FocusBridgeService _instance = FocusBridgeService._internal();
  factory FocusBridgeService() => _instance;
  FocusBridgeService._internal();

  static const _channel = MethodChannel('com.example.meowapp/focus');

  /// Call when a focus session starts.
  /// Pushes active=true + current priority numbers to native layer.
  Future<void> activate(List<String> priorityNumbers) async {
    try {
      await _channel.invokeMethod('setPriorityNumbers', {'numbers': priorityNumbers});
      await _channel.invokeMethod('setFocusActive', {'active': true});
    } catch (e) {
      // Non-fatal: app may be running on non-Android platform
      print('[FocusBridge] activate failed: $e');
    }
  }

  /// Call when a focus session ends.
  Future<void> deactivate() async {
    try {
      await _channel.invokeMethod('setFocusActive', {'active': false});
    } catch (e) {
      print('[FocusBridge] deactivate failed: $e');
    }
  }

  /// Push an updated priority list mid-session.
  Future<void> updatePriorityNumbers(List<String> numbers) async {
    try {
      await _channel.invokeMethod('setPriorityNumbers', {'numbers': numbers});
    } catch (e) {
      print('[FocusBridge] updatePriorityNumbers failed: $e');
    }
  }

  /// Returns true if the app has DND access permission.
  Future<bool> isDndPermissionGranted() async {
    try {
      return await _channel.invokeMethod<bool>('isDndPermissionGranted') ?? false;
    } catch (e) {
      return false;
    }
  }

  /// Opens system DND permission settings page.
  Future<void> openDndSettings() async {
    try {
      await _channel.invokeMethod('openDndSettings');
    } catch (e) {
      print('[FocusBridge] openDndSettings failed: $e');
    }
  }

  /// Opens system call screening / dialer settings page.
  Future<void> openCallScreeningSettings() async {
    try {
      await _channel.invokeMethod('openCallScreeningSettings');
    } catch (e) {
      print('[FocusBridge] openCallScreeningSettings failed: $e');
    }
  }
}
