import 'package:flutter/material.dart';
import '../services/desktop_sync_service.dart';
import '../screens/qr_scanner_screen.dart';

class ConnectionBanner extends StatefulWidget {
  const ConnectionBanner({super.key});

  @override
  State<ConnectionBanner> createState() => _ConnectionBannerState();
}

class _ConnectionBannerState extends State<ConnectionBanner> with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(vsync: this, duration: const Duration(seconds: 2))..repeat(reverse: true);
    _pulseAnimation = Tween<double>(begin: 0.4, end: 1.0).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<bool>(
      valueListenable: DesktopSyncService().isConnected,
      builder: (context, isConnected, child) {
        return GestureDetector(
          onTap: () {
            if (!isConnected) {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const QrScannerScreen()),
              );
            }
          },
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: isConnected
                  ? const Color(0xFF22C55E).withOpacity(0.07)
                  : const Color(0xFF13131A),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isConnected
                    ? const Color(0xFF22C55E).withOpacity(0.25)
                    : const Color(0xFF1E1E2E),
              ),
            ),
            child: Row(
              children: [
                AnimatedBuilder(
                  animation: _pulseAnimation,
                  builder: (_, __) => Opacity(
                    opacity: isConnected ? _pulseAnimation.value : 0.3,
                    child: Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isConnected ? const Color(0xFF22C55E) : Colors.white.withOpacity(0.3),
                        boxShadow: isConnected
                            ? [BoxShadow(color: const Color(0xFF22C55E).withOpacity(0.6), blurRadius: 6)]
                            : null,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isConnected ? 'Desktop Connected' : 'No Desktop Connection',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: isConnected ? const Color(0xFF22C55E) : Colors.white.withOpacity(0.5),
                        ),
                      ),
                      ValueListenableBuilder<String?>(
                        valueListenable: DesktopSyncService().connectedUrl,
                        builder: (context, url, child) {
                          return Text(
                            isConnected ? 'Syncing via $url' : 'Tap to scan QR and connect',
                            style: TextStyle(fontSize: 10, color: Colors.white.withOpacity(0.25)),
                          );
                        }
                      ),
                    ],
                  ),
                ),
                Icon(
                  isConnected ? Icons.wifi : Icons.qr_code_scanner_outlined,
                  color: isConnected ? const Color(0xFF22C55E).withOpacity(0.6) : Colors.white.withOpacity(0.2),
                  size: 18,
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
