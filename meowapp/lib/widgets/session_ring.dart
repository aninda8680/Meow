import 'package:flutter/material.dart';

class SessionRing extends StatelessWidget {
  final VoidCallback? onTap;
  final String? displayText;
  final bool isActive;
  final bool isCountdownMode;
  final Function(int)? onPresetSelected;

  const SessionRing({
    super.key,
    this.onTap,
    this.displayText,
    this.isActive = false,
    this.isCountdownMode = false,
    this.onPresetSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.transparent,
      padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Mode Indicator
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 300),
            child: Row(
              key: ValueKey<bool>(isCountdownMode),
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  isCountdownMode ? Icons.hourglass_bottom : Icons.timer_outlined,
                  color: const Color(0xFF6366F1).withOpacity(0.8),
                  size: 14,
                ),
                const SizedBox(width: 8),
                Text(
                  isCountdownMode ? 'COUNTDOWN' : 'STOPWATCH',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFF6366F1).withOpacity(0.8),
                    letterSpacing: 4,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          
          // Main Timer Display
          GestureDetector(
            onTap: onTap,
            child: Text(
              displayText ?? '00:00',
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontFamily: 'VastShadow',
                fontSize: 72,
                fontWeight: FontWeight.normal,
                color: Colors.white,
                letterSpacing: 2,
                height: 1.2,
              ),
            ),
          ),
          const SizedBox(height: 16),
          
          // Action Text
          GestureDetector(
            onTap: onTap,
            child: Text(
              isActive ? 'TAP TO STOP' : 'TAP TO BEGIN',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: isActive
                    ? const Color(0xFF6366F1)
                    : Colors.white.withOpacity(0.5),
                letterSpacing: 3,
              ),
            ),
          ),

          // Settings Layer (Presets)
          if (!isActive)
            AnimatedSize(
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeInOutCubic,
              child: isCountdownMode
                  ? Padding(
                      padding: const EdgeInsets.only(top: 40),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [25, 45, 60].map((m) {
                              return Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 6),
                                child: InkWell(
                                  onTap: () => onPresetSelected?.call(m),
                                  borderRadius: BorderRadius.circular(12),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                    decoration: BoxDecoration(
                                      color: Colors.white.withOpacity(0.05),
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(color: Colors.white.withOpacity(0.1)),
                                    ),
                                    child: Text(
                                      '${m}m',
                                      style: TextStyle(
                                        color: Colors.white.withOpacity(0.7),
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        letterSpacing: 1,
                                      ),
                                    ),
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'SWIPE UP FOR CUSTOM',
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.w600,
                              color: Colors.white.withOpacity(0.3),
                              letterSpacing: 2,
                            ),
                          ),
                        ],
                      ),
                    )
                  : Padding(
                      padding: const EdgeInsets.only(top: 40),
                      child: Text(
                        'SWIPE LEFT/RIGHT TO SWITCH MODE',
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w600,
                          color: Colors.white.withOpacity(0.3),
                          letterSpacing: 2,
                        ),
                      ),
                    ),
            ),
        ],
      ),
    );
  }
}

