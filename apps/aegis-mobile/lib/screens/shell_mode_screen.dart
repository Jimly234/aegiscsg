import 'package:flutter/material.dart';

class ShellModeScreen extends StatefulWidget {
  const ShellModeScreen({super.key});

  @override
  State<ShellModeScreen> createState() => _ShellModeScreenState();
}

class _ShellModeScreenState extends State<ShellModeScreen> {
  String _display = '0';
  String _expression = '';
  double? _firstOperand;
  String? _operator;

  void _onButtonPressed(String value) {
    setState(() {
      if (value == 'C') {
        _display = '0';
        _expression = '';
        _firstOperand = null;
        _operator = null;
      } else if (value == '=') {
        _calculate();
      } else if (['+', '-', '*', '/'].contains(value)) {
        _firstOperand = double.tryParse(_display);
        _operator = value;
        _expression = '$_display $value ';
        _display = '0';
      } else {
        if (_display == '0') {
          _display = value;
        } else {
          _display += value;
        }
      }
    });
  }

  void _calculate() {
    if (_firstOperand != null && _operator != null) {
      final secondOperand = double.tryParse(_display);
      if (secondOperand != null) {
        double result = 0;
        switch (_operator) {
          case '+':
            result = _firstOperand! + secondOperand;
            break;
          case '-':
            result = _firstOperand! - secondOperand;
            break;
          case '*':
            result = _firstOperand! * secondOperand;
            break;
          case '/':
            result = secondOperand != 0 ? _firstOperand! / secondOperand : 0;
            break;
        }
        _display = result.toStringAsFixed(result.truncateToDouble() == result ? 0 : 2);
        _expression = '';
        _firstOperand = null;
        _operator = null;
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0a0a),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1a1a2e),
        title: const Text('Calculator'),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Column(
        children: [
          // Secret activation hint (very subtle)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 2),
            color: Colors.transparent,
            child: GestureDetector(
              onLongPress: () {
                showDialog(
                  context: context,
                  builder: (_) => AlertDialog(
                    backgroundColor: const Color(0xFF1a1a2e),
                    title: const Text('Sentinel', style: TextStyle(color: Color(0xFF0A6847))),
                    content: const Text(
                      'Emergency mode is accessible from the home screen.',
                      style: TextStyle(color: Colors.white70),
                    ),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('OK', style: TextStyle(color: Color(0xFF0A6847))),
                      ),
                    ],
                  ),
                );
              },
              child: const SizedBox(height: 4),
            ),
          ),

          // Display
          Expanded(
            flex: 2,
            child: Container(
              padding: const EdgeInsets.all(24),
              alignment: Alignment.bottomRight,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.end,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    _expression,
                    style: const TextStyle(color: Colors.grey, fontSize: 18),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _display,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 48,
                      fontWeight: FontWeight.w300,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Keypad
          Expanded(
            flex: 4,
            child: GridView.count(
              crossAxisCount: 4,
              childAspectRatio: 1.2,
              padding: const EdgeInsets.all(12),
              crossAxisSpacing: 8,
              mainAxisSpacing: 8,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _buildButton('C', Colors.red),
                _buildButton('/', Colors.orange),
                _buildButton('*', Colors.orange),
                _buildButton('-', Colors.orange),
                _buildButton('7'),
                _buildButton('8'),
                _buildButton('9'),
                _buildButton('+', Colors.orange),
                _buildButton('4'),
                _buildButton('5'),
                _buildButton('6'),
                _buildButton('=', const Color(0xFF0A6847), flex: 2),
                _buildButton('1'),
                _buildButton('2'),
                _buildButton('3'),
                _buildButton('0', flex: 2),
                _buildButton('.'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildButton(String value, [Color? color, int? flex]) {
    return ElevatedButton(
      onPressed: () => _onButtonPressed(value),
      style: ElevatedButton.styleFrom(
        backgroundColor: value == '='
            ? const Color(0xFF0A6847)
            : value == 'C'
                ? Colors.red.withOpacity(0.2)
                : ['+', '-', '*', '/'].contains(value)
                    ? Colors.orange.withOpacity(0.2)
                    : const Color(0xFF2a2a3e),
        foregroundColor: color ?? Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        padding: EdgeInsets.zero,
      ),
      child: Text(
        value,
        style: TextStyle(
          fontSize: 24,
          fontWeight: FontWeight.w500,
          color: color ?? Colors.white,
        ),
      ),
    );
  }
}
