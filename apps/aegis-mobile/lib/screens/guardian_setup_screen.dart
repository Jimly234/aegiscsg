import 'package:flutter/material.dart';
import '../services/supabase_service.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class GuardianSetupScreen extends StatefulWidget {
  const GuardianSetupScreen({super.key});
  @override
  State<GuardianSetupScreen> createState() => _GuardianSetupScreenState();
}

class _GuardianSetupScreenState extends State<GuardianSetupScreen> {
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _nameController = TextEditingController();
  bool _isAdding = false;
  final List<Map<String, String>> _guardiansList = [];

  @override
  void initState() { super.initState(); _loadGuardians(); }

  Future<void> _loadGuardians() async {
    final prefs = await SharedPreferences.getInstance();
    final data = prefs.getString('guardians');
    if (data != null) {
      final list = jsonDecode(data) as List;
      setState(() { _guardiansList.addAll(list.cast<Map<String, String>>()); });
    }
  }

  Future<void> _saveGuardians() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('guardians', jsonEncode(_guardiansList));
    // Also save to Supabase
    try {
      for (final g in _guardiansList) {
        await SupabaseService.addGuardian({
          'name': g['name'],
          'phone': g['phone'],
          'relationship': 'family',
          'status': 'offline',
        });
      }
    } catch (_) {}
  }

  Future<void> _addGuardian() async {
    if (_phoneController.text.isEmpty || _nameController.text.isEmpty) return;
    setState(() => _isAdding = true);
    final name = _nameController.text;
    final phone = _phoneController.text;
    _guardiansList.add({'name': name, 'phone': phone});
    await _saveGuardians();
    _nameController.clear(); _phoneController.clear();
    setState(() => _isAdding = false);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$name added'), backgroundColor: const Color(0xFF0A6847)));
    }
  }

  @override
  void dispose() { _phoneController.dispose(); _nameController.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0a0a),
      appBar: AppBar(backgroundColor: const Color(0xFF1a1a2e), elevation: 0, title: const Text('Guardians')),
      body: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Card(color: const Color(0xFF1a1a2e), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), child: Padding(padding: const EdgeInsets.all(16), child: Column(children: [
          TextField(controller: _nameController, style: const TextStyle(color: Colors.white), decoration: const InputDecoration(labelText: 'Name', labelStyle: TextStyle(color: Colors.white38), enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white24)), focusedBorder: UnderlineInputBorder(borderSide: BorderSide(color: Color(0xFF0A6847))))),
          const SizedBox(height: 12),
          TextField(controller: _phoneController, keyboardType: TextInputType.phone, style: const TextStyle(color: Colors.white), decoration: const InputDecoration(labelText: 'Phone', labelStyle: TextStyle(color: Colors.white38), hintText: '+234 800 000 0000', hintStyle: TextStyle(color: Colors.white12), enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white24)), focusedBorder: UnderlineInputBorder(borderSide: BorderSide(color: Color(0xFF0A6847))))),
          const SizedBox(height: 16),
          SizedBox(width: double.infinity, child: ElevatedButton(onPressed: _isAdding ? null : _addGuardian, style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0A6847), padding: const EdgeInsets.symmetric(vertical: 14)), child: _isAdding ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) : const Text('Add Guardian'))),
        ]))),
        if (_guardiansList.isNotEmpty) ...[
          const SizedBox(height: 16),
          Card(color: const Color(0xFF1a1a2e), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('YOUR GUARDIANS', style: TextStyle(color: Colors.white38, fontSize: 11, letterSpacing: 2)),
            ...(_guardiansList.map((g) => ListTile(leading: const Icon(Icons.person, color: Color(0xFF0A6847)), title: Text(g['name']!, style: const TextStyle(color: Colors.white)), subtitle: Text(g['phone']!, style: const TextStyle(color: Colors.white38, fontSize: 12)), contentPadding: EdgeInsets.zero, dense: true))),
          ]))),
        ],
      ])),
    );
  }
}
