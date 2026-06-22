import 'package:flutter/material.dart';

class SessionRing extends StatelessWidget {
  final VoidCallback? onTap;
  final String? displayText;
  final bool isActive;

  const SessionRing({
    super.key,
    this.onTap,
    this.displayText,
    this.isActive = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 240,
        height: 240,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: const Color(0xFF13131A),
          border: Border.all(
            color: isActive ? const Color(0xFF6366F1) : const Color(0xFF1E1E2E),
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: isActive
                  ? const Color(0xFF6366F1).withOpacity(0.2)
                  : const Color(0xFF6366F1).withOpacity(0.08),
              blurRadius: 50,
              spreadRadius: 15,
            ),
          ],
        ),
        child: Stack(
          alignment: Alignment.center,
          children: [
            SizedBox.expand(
              child: CircularProgressIndicator(
                value: isActive ? null : 0.0,
                strokeWidth: 6,
                backgroundColor: Colors.white.withOpacity(0.04),
                color: const Color(0xFF6366F1),
                strokeCap: StrokeCap.round,
              ),
            ),
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  isActive ? Icons.timer : Icons.timer_outlined,
                  color: const Color(0xFF6366F1),
                  size: 32,
                ),
                const SizedBox(height: 12),
                Text(
                  isActive ? (displayText ?? '00:00') : 'START\nFOCUS',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: isActive ? 36 : 14,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                    letterSpacing: isActive ? -1 : 2,
                    height: 1.2,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  isActive ? 'TAP TO STOP' : 'TAP TO BEGIN',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: isActive
                        ? const Color(0xFF6366F1)
                        : Colors.white.withOpacity(0.3),
                    letterSpacing: 2,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

