import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

class DesktopSyncService {
  static final DesktopSyncService _instance = DesktopSyncService._internal();
  factory DesktopSyncService() => _instance;
  DesktopSyncService._internal();

  WebSocketChannel? _channel;
  
  final ValueNotifier<bool> isConnected = ValueNotifier(false);
  final ValueNotifier<String?> connectedUrl = ValueNotifier(null);
  final ValueNotifier<bool> isFocusActive = ValueNotifier(false);
  final ValueNotifier<int?> focusStartTime = ValueNotifier(null);
  
  // Contact Management
  final ValueNotifier<List<Map<String, dynamic>>> priorityContacts = ValueNotifier([]);

  bool isNumberAllowed(String number) {
    if (!isFocusActive.value) return true;
    
    // Normalize number for comparison (strip non-digits)
    final cleanTarget = number.replaceAll(RegExp(r'\D'), '');
    
    return priorityContacts.value.any((c) {
      if (c['allowed'] != true) return false;
      final cleanContact = (c['number'] as String).replaceAll(RegExp(r'\D'), '');
      return cleanTarget.contains(cleanContact) || cleanContact.contains(cleanTarget);
    });
  }
  
  void connect(String ip, int port) {
    try {
      final url = 'ws://$ip:$port';
      print('=== ATTEMPTING TO CONNECT TO $url ===');
      _channel?.sink.close();
      
      _channel = WebSocketChannel.connect(Uri.parse(url));
      
      _channel!.stream.listen(
        (message) {
          isConnected.value = true;
          connectedUrl.value = url;
          _handleMessage(message.toString());
        },
        onDone: () {
          _handleDisconnect();
        },
        onError: (error) {
          print('WebSocket Error: $error');
          _handleDisconnect();
        },
      );
      
      // We assume connected once we don't get an immediate error, 
      // but ideally the desktop app sends a status message right away.
    } catch (e) {
      print('Connection failed: $e');
      _handleDisconnect();
    }
  }
  
  void _handleMessage(String message) {
    try {
      final data = jsonDecode(message);
      print('Received from desktop: $data');
      
      if (data['type'] == 'status') {
        isFocusActive.value = data['focusActive'] ?? false;
        focusStartTime.value = data['startTime'];
      } else if (data['type'] == 'focus-started') {
        isFocusActive.value = true;
        focusStartTime.value = data['startTime'];
      } else if (data['type'] == 'focus-stopped') {
        isFocusActive.value = false;
        focusStartTime.value = null;
      } else if (data['type'] == 'incoming-call') {
        final number = data['payload']?['number'] ?? '';
        final name = data['payload']?['name'] ?? 'Unknown';
        
        if (isNumberAllowed(number)) {
          print('Priority Call Allowed: $name ($number)');
          // Allow call (this would trigger the system to let it through)
        } else {
          print('Focus Mode: Blocking call from $name ($number)');
          // Reject call immediately
          sendMessage({
            'type': 'call-ended', 
            'payload': {'reason': 'Focus Mode Active'}
          });
        }
      }
    } catch (e) {
      print('Error parsing message: $e');
    }
  }
  
  void _handleDisconnect() {
    isConnected.value = false;
    connectedUrl.value = null;
    _channel = null;
  }
  
  void disconnect() {
    _channel?.sink.close();
    _handleDisconnect();
  }
  
  void sendMessage(Map<String, dynamic> data) {
    if (isConnected.value && _channel != null) {
      _channel!.sink.add(jsonEncode(data));
    }
  }
}
