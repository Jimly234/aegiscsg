import 'package:flutter/material.dart';

class ShellModeScreen extends StatefulWidget {
  const ShellModeScreen({super.key});
  @override
  State<ShellModeScreen> createState() => _ShellModeScreenState();
}

class _ShellModeScreenState extends State<ShellModeScreen> {
  final List<Map<String, String>> _notes = [
    {'title': 'Shopping List', 'preview': 'Rice, beans, oil, tomatoes...', 'date': 'Today'},
    {'title': 'Meeting Notes', 'preview': 'Discuss Q3 budget and timeline...', 'date': 'Yesterday'},
    {'title': 'Phone Numbers', 'preview': 'Dr. Ibrahim: 0803... Pharmacy: 0805...', 'date': 'Jun 12'},
  ];
  int _titleTapCount = 0;
  DateTime? _lastTap;
  bool _showPinEntry = false;
  final _pinController = TextEditingController();
  final _correctPin = '2580';

  void _onTitleTap() {
    final now = DateTime.now();
    if (_lastTap != null && now.difference(_lastTap!) > const Duration(milliseconds: 600)) _titleTapCount = 0;
    _titleTapCount++; _lastTap = now;
    if (_titleTapCount >= 3) { _titleTapCount = 0; setState(() => _showPinEntry = true); }
  }

  void _verifyPin() {
    if (_pinController.text == _correctPin) { _pinController.clear(); setState(() => _showPinEntry = false); Navigator.of(context).pushReplacementNamed('/home'); }
    else { _pinController.clear(); setState(() => _showPinEntry = false); ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Incorrect PIN'), backgroundColor: Colors.red, duration: Duration(seconds: 1))); }
  }

  @override
  void dispose() { _pinController.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(title: GestureDetector(onTap: _onTitleTap, child: const Text('Quick Notes', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600))), backgroundColor: const Color(0xFF2D3748), elevation: 0, actions: [IconButton(icon: const Icon(Icons.search, color: Colors.white70), onPressed: () {}), PopupMenuButton(icon: const Icon(Icons.more_vert, color: Colors.white70), itemBuilder: (ctx) => [const PopupMenuItem(value: 'settings', child: Text('Settings')), const PopupMenuItem(value: 'about', child: Text('About'))])]),
      floatingActionButton: FloatingActionButton(backgroundColor: const Color(0xFF0A6847), onPressed: () { setState(() { _notes.insert(0, {'title': 'New Note', 'preview': 'Tap to edit...', 'date': 'Just now'}); }); }, child: const Icon(Icons.add, color: Colors.white)),
      body: Stack(children: [
        ListView.builder(padding: const EdgeInsets.all(12), itemCount: _notes.length, itemBuilder: (ctx, i) => Card(elevation: 0, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8), side: BorderSide(color: Colors.grey[200]!)), child: ListTile(title: Text(_notes[i]['title']!, style: const TextStyle(fontWeight: FontWeight.w600)), subtitle: Text(_notes[i]['preview']!, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: Colors.grey[600], fontSize: 13)), leading: const Icon(Icons.note, color: Color(0xFF0A6847)), trailing: Text(_notes[i]['date']!, style: TextStyle(color: Colors.grey[400], fontSize: 11))))),
        if (_showPinEntry) GestureDetector(onTap: () => setState(() => _showPinEntry = false), child: Container(color: Colors.black54, child: Center(child: GestureDetector(onTap: () {}, child: Container(margin: const EdgeInsets.all(32), padding: const EdgeInsets.all(24), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)), child: Column(mainAxisSize: MainAxisSize.min, children: [const Icon(Icons.lock_outline, color: Color(0xFF0A6847), size: 32), const SizedBox(height: 16), const Text('Enter Security Code', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16)), const SizedBox(height: 16), TextField(controller: _pinController, obscureText: true, keyboardType: TextInputType.number, maxLength: 4, textAlign: TextAlign.center, style: const TextStyle(fontSize: 24, letterSpacing: 8), decoration: InputDecoration(counterText: '', border: OutlineInputBorder(borderRadius: BorderRadius.circular(8))), onSubmitted: (_) => _verifyPin()), const SizedBox(height: 16), SizedBox(width: double.infinity, child: ElevatedButton(onPressed: _verifyPin, style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0A6847), padding: const EdgeInsets.symmetric(vertical: 14), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))), child: const Text('Unlock')))])))))),
      ]),
    );
  }
}
