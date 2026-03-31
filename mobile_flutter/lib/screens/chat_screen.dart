import "package:flutter/material.dart";
import "package:pcsensei_mobile/widgets/glass_card.dart";

class ChatScreen extends StatelessWidget {
  const ChatScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("Expert Chat", style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
          SizedBox(height: 8),
          Text("Ask questions like:"),
          SizedBox(height: 6),
          Text("- Best GPU under 40k"),
          Text("- Is RTX 4060 good for 1440p?"),
          Text("- Build PC under 1 lakh"),
          SizedBox(height: 8),
          Text("Current backend chat endpoints: /api/chat/session and /api/chat/message"),
        ],
      ),
    );
  }
}

