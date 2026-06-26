import 'package:flutter/material.dart';

class LeaderboardScreen extends StatelessWidget {
  const LeaderboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Dummy data for the leaderboard
    final List<Map<String, dynamic>> leaderboardData = [
      {'name': 'Alex', 'time': '32h 15m', 'rank': 1, 'color': const Color(0xFFFFD700)},
      {'name': 'Jordan', 'time': '28h 40m', 'rank': 2, 'color': const Color(0xFFC0C0C0)},
      {'name': 'Taylor', 'time': '25h 10m', 'rank': 3, 'color': const Color(0xFFCD7F32)},
      {'name': 'Sam', 'time': '18h 05m', 'rank': 4, 'color': Colors.transparent},
      {'name': 'Casey', 'time': '12h 30m', 'rank': 5, 'color': Colors.transparent},
      {'name': 'Riley', 'time': '9h 45m', 'rank': 6, 'color': Colors.transparent},
      {'name': 'Meow User', 'time': '2h 15m', 'rank': 7, 'color': Colors.transparent},
    ];

    return SafeArea(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
            child: Row(
              children: [
                const Text(
                  'Leaderboard',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                    letterSpacing: -0.5,
                  ),
                ),
                const Spacer(),
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: const Color(0xFF6366F1).withOpacity(0.15),
                    border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.3)),
                  ),
                  child: const Icon(Icons.emoji_events_outlined, color: Color(0xFF6366F1), size: 18),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 6, 20, 16),
            child: Text(
              'Top focusers this week',
              style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.35)),
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              itemCount: leaderboardData.length,
              itemBuilder: (context, index) {
                final user = leaderboardData[index];
                final isTop3 = user['rank'] <= 3;
                
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  decoration: BoxDecoration(
                    color: isTop3 ? const Color(0xFF6366F1).withOpacity(0.05) : const Color(0xFF13131A),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: isTop3 ? const Color(0xFF6366F1).withOpacity(0.2) : const Color(0xFF1E1E2E),
                      width: 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      SizedBox(
                        width: 30,
                        child: Text(
                          '#${user['rank']}',
                          style: TextStyle(
                            color: isTop3 ? user['color'] : Colors.white.withOpacity(0.4),
                            fontWeight: isTop3 ? FontWeight.w900 : FontWeight.w700,
                            fontSize: 14,
                          ),
                        ),
                      ),
                      Container(
                        width: 40,
                        height: 40,
                        margin: const EdgeInsets.only(right: 14),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isTop3 ? user['color'].withOpacity(0.15) : Colors.white.withOpacity(0.05),
                          border: Border.all(
                            color: isTop3 ? user['color'].withOpacity(0.3) : Colors.transparent,
                          ),
                        ),
                        child: Icon(
                          Icons.person_outline,
                          color: isTop3 ? user['color'] : Colors.white.withOpacity(0.5),
                          size: 18,
                        ),
                      ),
                      Expanded(
                        child: Text(
                          user['name'],
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 15,
                            fontWeight: isTop3 ? FontWeight.w800 : FontWeight.w600,
                          ),
                        ),
                      ),
                      Text(
                        user['time'],
                        style: TextStyle(
                          color: const Color(0xFF6366F1),
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          fontFamily: 'monospace',
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 80), // Padding for the floating navbar
        ],
      ),
    );
  }
}
