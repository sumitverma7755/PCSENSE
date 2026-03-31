import "package:flutter/material.dart";
import "package:pcsensei_mobile/services/api_client.dart";
import "package:pcsensei_mobile/theme/app_theme.dart";
import "package:pcsensei_mobile/widgets/glass_card.dart";

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool loading = true;
  List<dynamic> featured = const [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      featured = await ApiClient.instance.featuredBuilds();
    } catch (_) {
      featured = const [];
    } finally {
      if (mounted) {
        setState(() => loading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      children: [
        const GlassCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text("Stop Overpaying for PCs. Build Smarter.", style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
              SizedBox(height: 8),
              Text("AI recommendations, compatibility checks, FPS predictions, and store-wise comparison in one workflow.", style: TextStyle(color: AppTheme.muted)),
            ],
          ),
        ),
        const SizedBox(height: 12),
        const Text("Featured Builds", style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700)),
        const SizedBox(height: 8),
        if (loading)
          const Center(child: Padding(padding: EdgeInsets.all(24), child: CircularProgressIndicator()))
        else if (featured.isEmpty)
          const GlassCard(child: Text("No featured builds yet."))
        else
          ...featured.map((item) {
            final keyParts = (item["keyParts"] as Map<String, dynamic>? ?? {});
            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: GlassCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("${item["tier"]} | INR ${item["budget"]}", style: const TextStyle(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 6),
                    Text("CPU: ${keyParts["cpu"] ?? "N/A"}", style: const TextStyle(color: AppTheme.muted)),
                    Text("GPU: ${keyParts["gpu"] ?? "N/A"}", style: const TextStyle(color: AppTheme.muted)),
                    Text("Score: ${item["performanceScore"]} | Total: INR ${item["totalPrice"]}", style: const TextStyle(color: AppTheme.muted)),
                  ],
                ),
              ),
            );
          }),
      ],
    );
  }
}

