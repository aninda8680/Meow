/// FocusService — manages focus session state and phone DND sync.
/// In the real implementation this would hook into:
///   - Android CallScreeningService
///   - TelecomManager
///   - NotificationListenerService
///   - WebSocket connection to the desktop Meow tray app
class FocusService {
  bool _isFocusActive = false;
  bool _isDndActive = false;
  DateTime? _sessionStart;

  bool get isFocusActive => _isFocusActive;
  bool get isDndActive => _isDndActive;

  Duration get sessionDuration {
    if (_sessionStart == null) return Duration.zero;
    return DateTime.now().difference(_sessionStart!);
  }

  void startFocus() {
    _isFocusActive = true;
    _sessionStart = DateTime.now();
    _enableDnd();
    _notifyDesktop('focus_started');
  }

  void pauseFocus() {
    _notifyDesktop('focus_paused');
  }

  void stopFocus() {
    _isFocusActive = false;
    _sessionStart = null;
    _disableDnd();
    _notifyDesktop('focus_stopped');
  }

  void _enableDnd() {
    _isDndActive = true;
    // TODO: Android DND API — NotificationManager.setInterruptionFilter(INTERRUPTION_FILTER_PRIORITY)
  }

  void _disableDnd() {
    _isDndActive = false;
    // TODO: Android DND API — NotificationManager.setInterruptionFilter(INTERRUPTION_FILTER_ALL)
  }

  void _notifyDesktop(String event) {
    // TODO: WebSocket message to ws://localhost:5263
    // payload: { event, timestamp: DateTime.now().toIso8601String() }
  }

  /// Called by CallScreeningService when a call arrives.
  /// Returns true if the call should be allowed through.
  bool shouldAllowCall(String phoneNumber, List<String> whitelist) {
    if (!_isFocusActive) return true;
    return whitelist.contains(phoneNumber);
  }

  /// Sends call info to the desktop tray popup.
  void sendCallToDesktop({
    required String callerName,
    required String phoneNumber,
    required String callType,
  }) {
    // TODO: WebSocket push to desktop
    // payload: { type: 'incoming_call', callerName, phoneNumber, callType }
  }
}
