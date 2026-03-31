import "package:flutter/material.dart";
import "package:pcsensei_mobile/services/api_client.dart";
import "package:pcsensei_mobile/theme/app_theme.dart";
import "package:pcsensei_mobile/widgets/glass_card.dart";

class BuilderScreen extends StatefulWidget {
  const BuilderScreen({super.key});

  @override
  State<BuilderScreen> createState() => _BuilderScreenState();
}

class _BuilderScreenState extends State<BuilderScreen> {
  final budgetCtrl = TextEditingController(text: "100000");
  final goalCtrl = TextEditingController(text: "fps-first");
  String purpose = "gaming";
  String resolution = "1440p";
  bool loading = false;
  String? error;
  Map<String, dynamic>? result;

  Future<void> _generate() async {
    setState(() {
      loading = true;
      error = null;
    });
    try {
      result = await ApiClient.instance.generateBuild(
        budget: int.tryParse(budgetCtrl.text) ?? 100000,
        purpose: purpose,
        resolution: resolution,
        performanceGoal: goalCtrl.text.trim().isEmpty ? "balanced" : goalCtrl.text.trim(),
      );
    } catch (e) {
      error = e.toString();
      result = null;
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final build = (result?["build"] as Map<String, dynamic>? ?? {});
    final meta = (result?["meta"] as Map<String, dynamic>? ?? {});
    final fps = (result?["fpsPredictions"] as List<dynamic>? ?? []);
    final firstFps = fps.isNotEmpty ? fps.first as Map<String, dynamic> : null;

    return ListView(
      children: [
        GlassCard(
          child: Column(
            children: [
              TextField(
                controller: budgetCtrl,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: "Budget (INR)"),
              ),
              const SizedBox(height: 10),
              DropdownButtonFormField<String>(
                value: purpose,
                items: const [
                  DropdownMenuItem(value: "gaming", child: Text("Gaming")),
                  DropdownMenuItem(value: "editing", child: Text("Editing")),
                  DropdownMenuItem(value: "streaming", child: Text("Streaming")),
                  DropdownMenuItem(value: "office", child: Text("Office")),
                  DropdownMenuItem(value: "ai", child: Text("AI")),
                ],
                onChanged: (v) => setState(() => purpose = v ?? "gaming"),
                decoration: const InputDecoration(labelText: "Use Case"),
              ),
              const SizedBox(height: 10),
              DropdownButtonFormField<String>(
                value: resolution,
                items: const [
                  DropdownMenuItem(value: "1080p", child: Text("1080p")),
                  DropdownMenuItem(value: "1440p", child: Text("1440p")),
                  DropdownMenuItem(value: "4k", child: Text("4K")),
                ],
                onChanged: (v) => setState(() => resolution = v ?? "1080p"),
                decoration: const InputDecoration(labelText: "Resolution"),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: goalCtrl,
                decoration: const InputDecoration(labelText: "Performance Goal"),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: loading ? null : _generate,
                  child: Text(loading ? "Generating..." : "Generate AI Build"),
                ),
              ),
            ],
          ),
        ),
        if (error != null) ...[
          const SizedBox(height: 10),
          GlassCard(child: Text(error!, style: const TextStyle(color: Colors.redAccent))),
        ],
        if (result != null) ...[
          const SizedBox(height: 10),
          GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text("Recommended Build", style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                const SizedBox(height: 8),
                _line("CPU", (build["cpu"] as Map<String, dynamic>?)?["name"]),
                _line("GPU", (build["gpu"] as Map<String, dynamic>?)?["name"]),
                _line("Motherboard", (build["motherboard"] as Map<String, dynamic>?)?["name"]),
                _line("RAM", (build["ram"] as Map<String, dynamic>?)?["name"]),
                _line("Storage", (build["storage"] as Map<String, dynamic>?)?["name"]),
                _line("PSU", (build["psu"] as Map<String, dynamic>?)?["name"]),
                _line("Case", (build["case"] as Map<String, dynamic>?)?["name"]),
                const Divider(height: 20, color: AppTheme.line),
                _line("Performance Score", "${result?["performanceScore"]}"),
                _line("Total Price", "INR ${meta["totalPrice"]}"),
                _line("Compatibility", "${(result?["compatibility"] as Map<String, dynamic>?)?["isCompatible"] == true ? "Pass" : "Review"}"),
                if (firstFps != null) _line("Sample FPS", "${firstFps["game"]}: ${firstFps["fps"]} FPS"),
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _line(String left, Object? right) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Expanded(child: Text(left, style: const TextStyle(color: AppTheme.muted))),
          Expanded(child: Text(right?.toString() ?? "N/A", textAlign: TextAlign.right)),
        ],
      ),
    );
  }
}

