import "package:flutter/material.dart";
import "package:pcsensei_mobile/widgets/glass_card.dart";

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("Profile", style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
          SizedBox(height: 8),
          Text("Plan: Free"),
          SizedBox(height: 6),
          Text("Upgrade to Pro for advanced AI recommendations, price alerts, and deep FPS analytics."),
        ],
      ),
    );
  }
}

