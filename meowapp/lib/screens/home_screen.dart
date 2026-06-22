import 'package:flutter/material.dart';
import 'dart:async';
import '../widgets/connection_banner.dart';
import '../widgets/session_ring.dart';
import '../services/desktop_sync_service.dart';
import '../services/focus_bridge_service.dart';
import 'contacts_screen.dart';
import 'settings_screen.dart';

enum SessionState { idle, running, paused }

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with TickerProviderStateMixin {
  int _currentIndex = 0;
  
  // Focus Session State
  SessionState _sessionState = SessionState.idle;
  int _elapsed = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    DesktopSyncService().isFocusActive.addListener(_onSyncFocusChange);
  }

  void _onSyncFocusChange() {
    if (DesktopSyncService().isFocusActive.value) {
      if (_sessionState == SessionState.idle) {
        _startSession(
          broadcast: false, 
          startTime: DesktopSyncService().focusStartTime.value
        );
      }
    } else {
      if (_sessionState != SessionState.idle) {
        _stopSession(broadcast: false);
      }
    }
  }

  @override
  void dispose() {
    DesktopSyncService().isFocusActive.removeListener(_onSyncFocusChange);
    _timer?.cancel();
    super.dispose();
  }

  void _startSession({bool broadcast = true, int? startTime}) {
    if (_sessionState == SessionState.running) return;
    
    final effectiveStartTime = startTime ?? DateTime.now().millisecondsSinceEpoch;
    
    setState(() {
      _sessionState = SessionState.running;
      // Calculate initial elapsed time
      _elapsed = (DateTime.now().millisecondsSinceEpoch - effectiveStartTime) ~/ 1000;
    });
    
    // ─── Activate native DND + call blocking ───────────────────────────────
    final priorityNumbers = DesktopSyncService()
        .priorityContacts
        .value
        .where((c) => c['allowed'] == true)
        .map((c) => c['number'] as String)
        .toList();
    FocusBridgeService().activate(priorityNumbers);
    // ──────────────────────────────────────────────────────────────────────

    if (broadcast) {
      DesktopSyncService().sendMessage({
        'type': 'focus-started',
        'startTime': effectiveStartTime
      });
    }

    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(() {
        _elapsed++;
      });
    });
  }

  void _stopSession({bool broadcast = true}) {
    if (_sessionState == SessionState.idle) return;
    
    _timer?.cancel();
    setState(() {
      _sessionState = SessionState.idle;
      _elapsed = 0;
    });

    // ─── Deactivate native DND + call blocking ─────────────────────────────
    FocusBridgeService().deactivate();
    // ──────────────────────────────────────────────────────────────────────
    
    if (broadcast) {
      DesktopSyncService().sendMessage({'type': 'focus-stopped'});
    }
  }

  void _toggleSession() {
    if (_sessionState == SessionState.idle) {
      _startSession();
    } else {
      _stopSession();
    }
  }

  String _formatTime(int seconds) {
    final m = (seconds % 3600) ~/ 60;
    final s = seconds % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> screens = [
      _HomeTab(
        onToggleSession: _toggleSession,
        displayText: _formatTime(_elapsed),
        isActive: _sessionState != SessionState.idle,
      ),
      const ContactsScreen(),
      const SettingsScreen(),
    ];

    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0F),
      body: IndexedStack(index: _currentIndex, children: screens),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: Color(0xFF1E1E2E), width: 1)),
        ),
        child: NavigationBar(
          backgroundColor: const Color(0xFF0A0A0F),
          indicatorColor: const Color(0xFF6366F1).withOpacity(0.2),
          selectedIndex: _currentIndex,
          onDestinationSelected: (i) => setState(() => _currentIndex = i),
          labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.home_outlined),
              selectedIcon: Icon(Icons.home, color: Color(0xFF6366F1)),
              label: 'Home',
            ),
            NavigationDestination(
              icon: Icon(Icons.contacts_outlined),
              selectedIcon: Icon(Icons.contacts, color: Color(0xFF6366F1)),
              label: 'Contacts',
            ),
            NavigationDestination(
              icon: Icon(Icons.settings_outlined),
              selectedIcon: Icon(Icons.settings, color: Color(0xFF6366F1)),
              label: 'Settings',
            ),
          ],
        ),
      ),
    );
  }
}

class _HomeTab extends StatelessWidget {
  final VoidCallback onToggleSession;
  final String displayText;
  final bool isActive;

  const _HomeTab({
    required this.onToggleSession,
    required this.displayText,
    required this.isActive,
  });

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Header at the top
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'FocusSync',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                        letterSpacing: -0.5,
                      ),
                    ),
                    Text(
                      'by Meow',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF6366F1).withOpacity(0.7),
                        letterSpacing: 2,
                      ),
                    ),
                  ],
                ),
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: const Color(0xFF6366F1).withOpacity(0.15),
                    border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.3)),
                  ),
                  child: const Icon(Icons.person_outline, color: Color(0xFF6366F1), size: 20),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Connection Banner
            const ConnectionBanner(),
            
            // Centered Focus Ring
            Expanded(
              child: Center(
                child: SessionRing(
                  onTap: onToggleSession,
                  displayText: displayText,
                  isActive: isActive,
                ),
              ),
            ),
            
            // Bottom spacing to offset the header slightly
            const SizedBox(height: 44),
          ],
        ),
      ),
    );
  }
}
