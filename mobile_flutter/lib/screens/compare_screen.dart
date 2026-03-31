import "package:flutter/material.dart";
import "package:pcsensei_mobile/widgets/glass_card.dart";

class CompareScreen extends StatelessWidget {
  const CompareScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("Compare Parts", style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
          SizedBox(height: 8),
          Text("Store-wise component comparison is powered by GET /api/v2/prices."),
          SizedBox(height: 8),
          Text("Phase 2: add side-by-side filters for brand, socket, VRAM, and price history."),
        ],
      ),
    );
  }
}

