import 'package:flutter/material.dart';
import 'dart:async';
import '../widgets/session_ring.dart';
import '../services/desktop_sync_service.dart';
import '../services/focus_bridge_service.dart';
import 'leaderboard_screen.dart';
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
  bool _isCountdownMode = false;
  int _countdownSeconds = 25 * 60; // default 25 minutes
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
        if (_isCountdownMode && _countdownSeconds - _elapsed <= 0) {
          _stopSession();
        }
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
        onEditCountdown: _showCountdownEditor,
        onToggleMode: () {
          if (_sessionState == SessionState.idle) {
            setState(() => _isCountdownMode = !_isCountdownMode);
          }
        },
        displayText: _formatTime(_isCountdownMode ? (_countdownSeconds - _elapsed) : _elapsed),
        isActive: _sessionState != SessionState.idle,
        isCountdownMode: _isCountdownMode,
        onPresetSelected: (minutes) {
          setState(() {
            _countdownSeconds = minutes * 60;
            _elapsed = 0;
          });
        },
      ),
      const LeaderboardScreen(),
      const SettingsScreen(),
    ];

    return Scaffold(
      backgroundColor: Colors.black,
      extendBody: true,
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 400),
        switchInCurve: Curves.easeOutCubic,
        switchOutCurve: Curves.easeInCubic,
        transitionBuilder: (Widget child, Animation<double> animation) {
          return FadeTransition(
            opacity: animation,
            child: ScaleTransition(
              scale: Tween<double>(begin: 0.98, end: 1.0).animate(animation),
              child: child,
            ),
          );
        },
        child: KeyedSubtree(
          key: ValueKey<int>(_currentIndex),
          child: screens[_currentIndex],
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.only(bottom: 24, left: 32, right: 32),
          child: Container(
            height: 64,
            decoration: BoxDecoration(
              color: const Color(0xFF13131A).withOpacity(0.85),
              borderRadius: BorderRadius.circular(32),
              border: Border.all(color: Colors.white.withOpacity(0.05), width: 1),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.5),
                  blurRadius: 30,
                  offset: const Offset(0, 10),
                )
              ],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildNavItem(0, Icons.home_outlined, Icons.home, 'Home'),
                _buildNavItem(1, Icons.emoji_events_outlined, Icons.emoji_events, 'Leaderboard'),
                _buildNavItem(2, Icons.settings_outlined, Icons.settings, 'Settings'),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData iconOutlined, IconData iconSolid, String label) {
    final isSelected = _currentIndex == index;
    return GestureDetector(
      onTap: () => setState(() => _currentIndex = index),
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOutQuint,
        padding: EdgeInsets.symmetric(horizontal: isSelected ? 20 : 12, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF6366F1).withOpacity(0.15) : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isSelected ? iconSolid : iconOutlined,
              color: isSelected ? const Color(0xFF6366F1) : Colors.white.withOpacity(0.4),
              size: 24,
            ),
            AnimatedSize(
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeOutQuint,
              child: SizedBox(
                width: isSelected ? null : 0,
                child: Padding(
                  padding: const EdgeInsets.only(left: 8),
                  child: Text(
                    label,
                    style: const TextStyle(
                      color: Color(0xFF6366F1),
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.clip,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showCountdownEditor() {
    if (_sessionState != SessionState.idle || !_isCountdownMode) return;
    int selectedMinutes = _countdownSeconds ~/ 60;
    if (selectedMinutes == 0) selectedMinutes = 25; // if it was 0, default to 25

    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF13131A),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(32))),
      builder: (context) {
        return StatefulBuilder(builder: (context, setModalState) {
          return Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 40, height: 4,
                  decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(2)),
                ),
                const SizedBox(height: 24),
                const Text('SET COUNTDOWN', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800, letterSpacing: 3)),
                const SizedBox(height: 40),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.remove_circle_outline, color: Color(0xFF6366F1), size: 40),
                      onPressed: () {
                        if (selectedMinutes > 5) setModalState(() => selectedMinutes -= 5);
                      },
                    ),
                    const SizedBox(width: 24),
                    SizedBox(
                      width: 100,
                      child: Text(
                        '$selectedMinutes',
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: Colors.white, fontSize: 56, fontFamily: 'VastShadow'),
                      ),
                    ),
                    const SizedBox(width: 24),
                    IconButton(
                      icon: const Icon(Icons.add_circle_outline, color: Color(0xFF6366F1), size: 40),
                      onPressed: () {
                        if (selectedMinutes < 120) setModalState(() => selectedMinutes += 5);
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                const Text('MINUTES', style: TextStyle(color: Colors.white54, fontSize: 12, fontWeight: FontWeight.w700, letterSpacing: 2)),
                const SizedBox(height: 40),
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF6366F1),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    ),
                    onPressed: () {
                      setState(() {
                        _countdownSeconds = selectedMinutes * 60;
                        _elapsed = 0;
                      });
                      Navigator.pop(context);
                    },
                    child: const Text('SAVE TIMER', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800, letterSpacing: 2)),
                  ),
                ),
                const SizedBox(height: 20),
              ],
            ),
          );
        });
      },
    );
  }
}

class _HomeTab extends StatelessWidget {
  final VoidCallback onToggleSession;
  final VoidCallback onEditCountdown;
  final VoidCallback onToggleMode;
  final Function(int) onPresetSelected;
  final String displayText;
  final bool isActive;
  final bool isCountdownMode;

  const _HomeTab({
    required this.onToggleSession,
    required this.onEditCountdown,
    required this.onToggleMode,
    required this.onPresetSelected,
    required this.displayText,
    required this.isActive,
    required this.isCountdownMode,
  });

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: GestureDetector(
        onPanEnd: (details) {
          if (!isActive) {
            final dx = details.velocity.pixelsPerSecond.dx;
            final dy = details.velocity.pixelsPerSecond.dy;

            // Swipe Left or Right (switch modes)
            if (dx.abs() > 50 && dx.abs() > dy.abs()) {
              onToggleMode();
            } 
            // Swipe Up (edit countdown)
            else if (dy < -50 && dy.abs() > dx.abs()) {
              if (isCountdownMode) {
                onEditCountdown();
              }
            }
          }
        },
        behavior: HitTestBehavior.opaque,
        child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Centered Focus Ring
            Expanded(
              child: Center(
                child: SessionRing(
                  onTap: onToggleSession,
                  displayText: displayText,
                  isActive: isActive,
                  isCountdownMode: isCountdownMode,
                  onPresetSelected: onPresetSelected,
                ),
              ),
            ),
            
            // Bottom spacing to offset the header slightly
            const SizedBox(height: 44),
          ],
        ),
      ),
      ),
    );
  }
}
