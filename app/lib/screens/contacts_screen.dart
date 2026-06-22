import 'package:flutter/material.dart';
import 'package:flutter_contacts/flutter_contacts.dart';
import '../services/desktop_sync_service.dart';

class ContactsScreen extends StatefulWidget {
  const ContactsScreen({super.key});

  @override
  State<ContactsScreen> createState() => _ContactsScreenState();
}

class _ContactsScreenState extends State<ContactsScreen> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _numberController = TextEditingController();
  bool _isPickingContact = false;

  void _pickFromPhoneContacts() async {
    setState(() => _isPickingContact = true);
    try {
      if (await FlutterContacts.requestPermission(readonly: true)) {
        final contact = await FlutterContacts.openExternalPick();
        if (contact != null) {
          final full = await FlutterContacts.getContact(contact.id, withProperties: true);
          final name = full?.displayName ?? contact.displayName;
          final number = full?.phones.isNotEmpty == true
              ? full!.phones.first.number
              : null;

          if (number != null && number.isNotEmpty) {
            DesktopSyncService().priorityContacts.value = [
              ...DesktopSyncService().priorityContacts.value,
              {
                'name': name,
                'number': number,
                'emoji': '👤',
                'allowed': true,
                'priority': 'Priority',
              }
            ];
          } else {
            // Contact has no phone number — open manual entry with name pre-filled
            _nameController.text = name;
            _numberController.clear();
            _showManualEntry();
          }
        }
      } else {
        // Permission denied — fall back to manual entry
        _showManualEntry();
      }
    } catch (e) {
      debugPrint('Contact picker error: $e');
      _showManualEntry();
    } finally {
      setState(() => _isPickingContact = false);
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _numberController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<List<Map<String, dynamic>>>(
      valueListenable: DesktopSyncService().priorityContacts,
      builder: (context, contacts, child) {
        final allowed = contacts.where((c) => c['allowed'] == true).toList();
        final blocked = contacts.where((c) => c['allowed'] == false).toList();

        return SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                child: Row(
                  children: [
                    const Text('Priority Contacts', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: -0.5)),
                    const Spacer(),
                    GestureDetector(
                      onTap: _isPickingContact ? null : _pickFromPhoneContacts,
                      child: Container(
                        width: 38,
                        height: 38,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: const Color(0xFF6366F1).withOpacity(0.15),
                          border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.3)),
                        ),
                        child: _isPickingContact
                            ? const Padding(
                                padding: EdgeInsets.all(10),
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Color(0xFF6366F1),
                                ),
                              )
                            : const Icon(Icons.person_add_outlined, color: Color(0xFF6366F1), size: 18),
                      ),
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 6, 20, 16),
                child: Text(
                  'These contacts bypass DND during focus sessions',
                  style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.35)),
                ),
              ),

              // Info card
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF59E0B).withOpacity(0.07),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFF59E0B).withOpacity(0.2)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.info_outline, color: Color(0xFFF59E0B), size: 16),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'Calls from blocked contacts are silently rejected when DND is active',
                          style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.5)),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),

              if (contacts.isEmpty)
                Expanded(
                  child: Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.contact_phone_outlined, size: 64, color: Colors.white.withOpacity(0.1)),
                        const SizedBox(height: 16),
                        Text('No priority contacts yet', style: TextStyle(color: Colors.white.withOpacity(0.3))),
                      ],
                    ),
                  ),
                )
              else
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    children: [
                      if (allowed.isNotEmpty) ...[
                        _sectionHeader('✅  ALLOWED  (${allowed.length})', const Color(0xFF6366F1)),
                        const SizedBox(height: 10),
                        ...allowed.map((c) => _buildContactTile(c)),
                        const SizedBox(height: 20),
                      ],
                      if (blocked.isNotEmpty) ...[
                        _sectionHeader('🚫  BLOCKED  (${blocked.length})', const Color(0xFFEF4444)),
                        const SizedBox(height: 10),
                        ...blocked.map((c) => _buildContactTile(c)),
                        const SizedBox(height: 16),
                      ],
                    ],
                  ),
                ),
            ],
          ),
        );
      },
    );
  }

  Widget _sectionHeader(String text, Color color) {
    return Text(
      text,
      style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: color.withOpacity(0.6), letterSpacing: 2),
    );
  }

  Widget _buildContactTile(Map<String, dynamic> contact) {
    final allowed = contact['allowed'] as bool;
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF13131A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: allowed ? const Color(0xFF1E1E2E) : const Color(0xFFEF4444).withOpacity(0.1),
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: allowed ? const Color(0xFF6366F1).withOpacity(0.1) : const Color(0xFFEF4444).withOpacity(0.08),
            ),
            child: Center(child: Text(contact['emoji'] as String, style: const TextStyle(fontSize: 20))),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(contact['name'] as String, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                const SizedBox(height: 2),
                Text(contact['number'] as String, style: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 11, fontFamily: 'monospace')),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Switch(
                value: allowed,
                onChanged: (val) {
                  setState(() {
                    contact['allowed'] = val;
                    // Trigger notifier update
                    DesktopSyncService().priorityContacts.value = List.from(DesktopSyncService().priorityContacts.value);
                  });
                },
                activeColor: const Color(0xFF6366F1),
                materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
              Text(
                contact['priority'] as String,
                style: TextStyle(
                  fontSize: 10,
                  color: allowed ? const Color(0xFF6366F1).withOpacity(0.6) : const Color(0xFFEF4444).withOpacity(0.5),
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showManualEntry() {
    _nameController.clear();
    _numberController.clear();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF13131A),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => Padding(
        padding: EdgeInsets.fromLTRB(24, 16, 24, MediaQuery.of(context).viewInsets.bottom + 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(child: Container(width: 36, height: 4, decoration: BoxDecoration(color: Colors.white.withOpacity(0.15), borderRadius: BorderRadius.circular(2)))),
            const SizedBox(height: 20),
            const Text('Add Priority Contact', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
            const SizedBox(height: 20),
            TextField(
              controller: _nameController,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Contact name',
                hintStyle: TextStyle(color: Colors.white.withOpacity(0.3)),
                filled: true,
                fillColor: Colors.white.withOpacity(0.05),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                prefixIcon: Icon(Icons.person_outline, color: Colors.white.withOpacity(0.3), size: 18),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _numberController,
              style: const TextStyle(color: Colors.white),
              keyboardType: TextInputType.phone,
              decoration: InputDecoration(
                hintText: 'Phone number',
                hintStyle: TextStyle(color: Colors.white.withOpacity(0.3)),
                filled: true,
                fillColor: Colors.white.withOpacity(0.05),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                prefixIcon: Icon(Icons.phone_outlined, color: Colors.white.withOpacity(0.3), size: 18),
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  if (_nameController.text.isNotEmpty && _numberController.text.isNotEmpty) {
                    final newContact = {
                      'name': _nameController.text,
                      'number': _numberController.text,
                      'emoji': '👤',
                      'allowed': true,
                      'priority': 'Priority',
                    };
                    
                    DesktopSyncService().priorityContacts.value = [
                      ...DesktopSyncService().priorityContacts.value,
                      newContact
                    ];
                    
                    Navigator.pop(context);
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF6366F1),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: const Text('Add Contact', style: TextStyle(fontWeight: FontWeight.w700)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
