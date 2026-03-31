import "package:flutter/material.dart";
import "package:google_fonts/google_fonts.dart";

class AppTheme {
  static const Color bg = Color(0xFF081219);
  static const Color card = Color(0xBB132734);
  static const Color line = Color(0x445A809B);
  static const Color accent = Color(0xFF2DD4BF);
  static const Color accent2 = Color(0xFFF59E0B);
  static const Color text = Color(0xFFE8F1F8);
  static const Color muted = Color(0xFF9AB3C6);

  static ThemeData dark() {
    final base = ThemeData.dark(useMaterial3: true);
    return base.copyWith(
      scaffoldBackgroundColor: bg,
      textTheme: GoogleFonts.manropeTextTheme(base.textTheme).apply(
        bodyColor: text,
        displayColor: text,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: bg.withOpacity(0.82),
        elevation: 0,
        centerTitle: false,
        titleTextStyle: GoogleFonts.spaceGrotesk(
          color: text,
          fontSize: 20,
          fontWeight: FontWeight.w700,
        ),
      ),
      colorScheme: const ColorScheme.dark(
        primary: accent,
        secondary: accent2,
        surface: card,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xAA0E202C),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: line),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: line),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: accent),
        ),
      ),
    );
  }
}

