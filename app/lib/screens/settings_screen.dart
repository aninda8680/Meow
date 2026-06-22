import 'package:flutter/material.dart';
import 'qr_scanner_screen.dart';
import '../services/desktop_sync_service.dart';
import '../services/focus_bridge_service.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _autoStartDnd = true;
  bool _showCallPopup = true;
  bool _vibratePriority = true;
  bool _autoRejectUnknown = false;
  bool _syncWithDesktop = true;
  bool _startOnBoot = true;
  String _defaultMode = 'Stopwatch';
  int _pomodoroLength = 25;
  int _breakLength = 5;

  // Live permission status
  bool _dndGranted = false;

  @override
  void initState() {
    super.initState();
    _checkPermissions();
  }

  Future<void> _checkPermissions() async {
    final dnd = await FocusBridgeService().isDndPermissionGranted();
    if (mounted) setState(() => _dndGranted = dnd);
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const SizedBox(height: 8),
          const Text('Settings', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: -0.5)),
          const SizedBox(height: 6),
          Text('Configure FocusSync to your workflow', style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.35))),
          const SizedBox(height: 24),

          // Focus settings
          _sectionLabel('FOCUS'),
          _settingsCard([
            _dropdownTile('Default Timer Mode', _defaultMode, ['Stopwatch', 'Pomodoro', 'Countdown'],
                (v) => setState(() => _defaultMode = v!)),
            _divider(),
            _stepperTile('Pomodoro Length', '$_pomodoroLength min',
                onMinus: () { if (_pomodoroLength > 5) setState(() => _pomodoroLength -= 5); },
                onPlus: () { if (_pomodoroLength < 90) setState(() => _pomodoroLength += 5); }),
            _divider(),
            _stepperTile('Break Length', '$_breakLength min',
                onMinus: () { if (_breakLength > 1) setState(() => _breakLength -= 1); },
                onPlus: () { if (_breakLength < 30) setState(() => _breakLength += 1); }),
          ]),
          const SizedBox(height: 20),

          // Call management
          _sectionLabel('CALL MANAGEMENT'),
          _settingsCard([
            _switchTile('Auto-Enable DND on Focus Start', 'Phone enters DND when session starts', _autoStartDnd,
                (v) => setState(() => _autoStartDnd = v)),
            _divider(),
            _switchTile('Show Call Popup on Desktop', 'Displays incoming calls on your PC/Mac', _showCallPopup,
                (v) => setState(() => _showCallPopup = v)),
            _divider(),
            _switchTile('Vibrate for Priority Calls', 'Silent vibration for whitelisted contacts', _vibratePriority,
                (v) => setState(() => _vibratePriority = v)),
            _divider(),
            _switchTile('Auto-Reject Unknown Numbers', 'Reject calls from numbers not in contacts', _autoRejectUnknown,
                (v) => setState(() => _autoRejectUnknown = v)),
          ]),
          const SizedBox(height: 20),

          // Sync
          _sectionLabel('DESKTOP SYNC'),
          _settingsCard([
            _switchTile('Sync with Desktop App', 'Real-time WebSocket sync with the Meow tray app', _syncWithDesktop,
                (v) => setState(() => _syncWithDesktop = v)),
            _divider(),
            ValueListenableBuilder<String?>(
              valueListenable: DesktopSyncService().connectedUrl,
              builder: (context, url, child) {
                return _infoTile('Desktop Connection', url ?? 'Not connected', Icons.wifi_outlined);
              },
            ),
            _divider(),
            _actionTile('Scan QR Code to Pair', Icons.qr_code_scanner_outlined, () => _openScanner()),
          ]),
          const SizedBox(height: 20),

          // Permissions — required for actual blocking
          _sectionLabel('PERMISSIONS'),
          _settingsCard([
            // DND Access
            ListTile(
              leading: Icon(
                Icons.do_not_disturb_on_outlined,
                color: _dndGranted
                    ? const Color(0xFF22C55E).withOpacity(0.7)
                    : const Color(0xFFEF4444).withOpacity(0.7),
                size: 18,
              ),
              title: const Text(
                'Do Not Disturb Access',
                style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
              ),
              subtitle: Text(
                _dndGranted ? 'Granted — DND will activate with focus' : 'Required to silence your phone',
                style: TextStyle(
                  fontSize: 11,
                  color: _dndGranted
                      ? const Color(0xFF22C55E).withOpacity(0.7)
                      : const Color(0xFFEF4444).withOpacity(0.7),
                ),
              ),
              trailing: _dndGranted
                  ? Icon(Icons.check_circle_outline, color: const Color(0xFF22C55E).withOpacity(0.8), size: 18)
                  : TextButton(
                      onPressed: () async {
                        await FocusBridgeService().openDndSettings();
                        await Future.delayed(const Duration(seconds: 2));
                        _checkPermissions();
                      },
                      child: const Text('Grant', style: TextStyle(color: Color(0xFF6366F1), fontSize: 12, fontWeight: FontWeight.w700)),
                    ),
            ),
            _divider(),
            // Call Screening Role
            ListTile(
              leading: Icon(
                Icons.phone_callback_outlined,
                color: const Color(0xFFF59E0B).withOpacity(0.7),
                size: 18,
              ),
              title: const Text(
                'Call Screening Role',
                style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
              ),
              subtitle: Text(
                'Set FocusSync as your call screener to block calls',
                style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.3)),
              ),
              trailing: TextButton(
                onPressed: () => FocusBridgeService().openCallScreeningSettings(),
                child: const Text('Setup', style: TextStyle(color: Color(0xFF6366F1), fontSize: 12, fontWeight: FontWeight.w700)),
              ),
            ),
          ]),
          const SizedBox(height: 20),

          // System
          _sectionLabel('SYSTEM'),
          _settingsCard([
            _switchTile('Start on Boot', 'Launch FocusSync automatically on phone restart', _startOnBoot,
                (v) => setState(() => _startOnBoot = v)),
            _divider(),
            _actionTile('Request Permissions', Icons.security_outlined, () {}),
            _divider(),
            _actionTile('Clear Session History', Icons.delete_outline, () {}, destructive: true),
          ]),
          const SizedBox(height: 20),

          // About
          _sectionLabel('ABOUT'),
          _settingsCard([
            _infoTile('Version', '1.0.0 (FocusSync Beta)', Icons.info_outline),
            _divider(),
            _infoTile('Part of', 'Meow Companion Ecosystem', Icons.pets_outlined),
          ]),
          const SizedBox(height: 30),
        ],
      ),
    );
  }

  Widget _sectionLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10, left: 2),
      child: Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.white.withOpacity(0.3), letterSpacing: 3)),
    );
  }

  Widget _settingsCard(List<Widget> children) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF13131A),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF1E1E2E)),
      ),
      child: Column(children: children),
    );
  }

  Widget _divider() => Divider(height: 1, color: Colors.white.withOpacity(0.05), indent: 16, endIndent: 16);

  Widget _switchTile(String title, String subtitle, bool value, ValueChanged<bool> onChanged) {
    return ListTile(
      title: Text(title, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
      subtitle: Text(subtitle, style: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 11)),
      trailing: Switch(value: value, onChanged: onChanged, activeColor: const Color(0xFF6366F1)),
    );
  }

  Widget _infoTile(String title, String value, IconData icon) {
    return ListTile(
      leading: Icon(icon, color: Colors.white.withOpacity(0.3), size: 18),
      title: Text(title, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
      trailing: Text(value, style: TextStyle(color: Colors.white.withOpacity(0.35), fontSize: 11)),
    );
  }

  Widget _actionTile(String title, IconData icon, VoidCallback onTap, {bool destructive = false}) {
    return ListTile(
      onTap: onTap,
      leading: Icon(icon, color: destructive ? const Color(0xFFEF4444).withOpacity(0.7) : const Color(0xFF6366F1).withOpacity(0.7), size: 18),
      title: Text(title, style: TextStyle(color: destructive ? const Color(0xFFEF4444).withOpacity(0.8) : Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
      trailing: Icon(Icons.chevron_right, color: Colors.white.withOpacity(0.2), size: 18),
    );
  }

  Widget _dropdownTile(String title, String value, List<String> options, ValueChanged<String?> onChanged) {
    return ListTile(
      title: Text(title, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
      trailing: DropdownButton<String>(
        value: value,
        dropdownColor: const Color(0xFF1E1E2E),
        underline: const SizedBox(),
        style: const TextStyle(color: Color(0xFF6366F1), fontSize: 12, fontWeight: FontWeight.w700),
        items: options.map((o) => DropdownMenuItem(value: o, child: Text(o))).toList(),
        onChanged: onChanged,
      ),
    );
  }

  Widget _stepperTile(String title, String value, {required VoidCallback onMinus, required VoidCallback onPlus}) {
    return ListTile(
      title: Text(title, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          GestureDetector(
            onTap: onMinus,
            child: Container(
              width: 28, height: 28,
              decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.white.withOpacity(0.08)),
              child: const Icon(Icons.remove, color: Colors.white, size: 14),
            ),
          ),
          const SizedBox(width: 10),
          Text(value, style: const TextStyle(color: Color(0xFF6366F1), fontSize: 13, fontWeight: FontWeight.w700)),
          const SizedBox(width: 10),
          GestureDetector(
            onTap: onPlus,
            child: Container(
              width: 28, height: 28,
              decoration: BoxDecoration(shape: BoxShape.circle, color: const Color(0xFF6366F1).withOpacity(0.15)),
              child: const Icon(Icons.add, color: Color(0xFF6366F1), size: 14),
            ),
          ),
        ],
      ),
    );
  }

  void _openScanner() {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const QrScannerScreen()),
    );
  }
}
