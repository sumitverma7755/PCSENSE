import "package:flutter/material.dart";
import "package:pcsensei_mobile/screens/builder_screen.dart";
import "package:pcsensei_mobile/screens/chat_screen.dart";
import "package:pcsensei_mobile/screens/compare_screen.dart";
import "package:pcsensei_mobile/screens/home_screen.dart";
import "package:pcsensei_mobile/screens/profile_screen.dart";
import "package:pcsensei_mobile/screens/saved_screen.dart";
import "package:pcsensei_mobile/theme/app_theme.dart";

void main() {
  runApp(const PcSenseiApp());
}

class PcSenseiApp extends StatelessWidget {
  const PcSenseiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: "PCSensei",
      theme: AppTheme.dark(),
      home: const AppShell(),
    );
  }
}

class AppShell extends StatefulWidget {
  const AppShell({super.key});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int index = 0;

  final screens = const [
    HomeScreen(),
    BuilderScreen(),
    CompareScreen(),
    SavedScreen(),
    ChatScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("PCSensei")),
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 250),
        child: Padding(
          key: ValueKey(index),
          padding: const EdgeInsets.all(14),
          child: screens[index],
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: index,
        onDestinationSelected: (value) => setState(() => index = value),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), label: "Home"),
          NavigationDestination(icon: Icon(Icons.memory_outlined), label: "Builder"),
          NavigationDestination(icon: Icon(Icons.compare_arrows_outlined), label: "Compare"),
          NavigationDestination(icon: Icon(Icons.bookmark_outline), label: "Saved"),
          NavigationDestination(icon: Icon(Icons.chat_bubble_outline), label: "Chat"),
          NavigationDestination(icon: Icon(Icons.person_outline), label: "Profile"),
        ],
      ),
    );
  }
}

