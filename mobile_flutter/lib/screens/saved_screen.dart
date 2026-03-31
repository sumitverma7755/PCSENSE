import "package:flutter/material.dart";
import "package:pcsensei_mobile/widgets/glass_card.dart";

class SavedScreen extends StatelessWidget {
  const SavedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("Saved Builds", style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
          SizedBox(height: 8),
          Text("Phase 2: persist build history with share links like pcsensei.app/build/abc123."),
        ],
      ),
    );
  }
}

