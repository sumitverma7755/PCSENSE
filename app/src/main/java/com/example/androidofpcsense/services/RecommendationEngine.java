package com.example.androidofpcsense.services;

import android.util.Log;

import com.example.androidofpcsense.models.ComponentDatabase;
import com.example.androidofpcsense.models.Laptop;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Recommendation engine for laptop selection
 * Matches main.html lines 980-1040
 */
public class RecommendationEngine {

    private static final String TAG = "RecommendationEngine";

    /**
     * Select top 3 laptops based on budget and usage
     * Matches main.html selectLaptops() function
     */
    public List<Laptop> selectLaptops(ComponentDatabase db, int budget, String usage) {
        if (db == null || db.getLaptops() == null) {
            Log.e(TAG, "Database or laptops list is null");
            return new ArrayList<>();
        }

        List<Laptop> filtered = new ArrayList<>();

        // Step 1: Filter by budget with tolerance
        for (Laptop laptop : db.getLaptops()) {
            // Try exact budget first
            if (laptop.getPrice() <= budget) {
                filtered.add(laptop);
                continue;
            }
            // Allow 5% overage
            if (laptop.getPrice() <= budget * 1.05) {
                filtered.add(laptop);
                continue;
            }
            // Last resort: 20% overage for high-end
            if (budget > 100000 && laptop.getPrice() <= budget * 1.20) {
                filtered.add(laptop);
            }
        }

        Log.d(TAG, "Filtered " + filtered.size() + " laptops within budget");

        // Step 2: Score each laptop
        for (Laptop laptop : filtered) {
            int score = calculateLaptopScore(laptop, budget, usage);
            laptop.setAiScore(score);
            Log.d(TAG, laptop.getName() + " - Score: " + score);
        }

        // Step 3: Sort by score DESC, then price DESC
        Collections.sort(filtered, (a, b) -> {
            int scoreDiff = b.getAiScore() - a.getAiScore();
            if (Math.abs(scoreDiff) > 10) {
                return scoreDiff; // Significant score difference
            }
            return b.getPrice() - a.getPrice(); // Tiebreaker: higher price
        });

        // Return top 3
        int resultSize = Math.min(3, filtered.size());
        List<Laptop> topPicks = filtered.subList(0, resultSize);

        Log.d(TAG, "Returning top " + resultSize + " laptops");
        return topPicks;
    }

    /**
     * Calculate AI score for a laptop based on usage and budget efficiency
     * Matches main.html calculateLaptopScore() function
     */
    private int calculateLaptopScore(Laptop laptop, int budget, String usage) {
        int score = 0;
        String spec = laptop.getSpec() != null ? laptop.getSpec().toLowerCase() : "";

        // Usage-based scoring
        switch (usage.toLowerCase()) {
            case "gaming":
                // GPU tier bonus
                if (spec.contains("rtx 4060")) score += 30;
                else if (spec.contains("rtx 4050")) score += 25;
                else if (spec.contains("rtx 3060")) score += 28;
                else if (spec.contains("rtx 3050")) score += 20;
                else if (spec.contains("gtx 1650")) score += 15;

                // High refresh rate
                if (laptop.getRefreshInt() >= 144) score += 15;
                else if (laptop.getRefreshInt() >= 120) score += 10;
                else if (laptop.getRefreshInt() >= 90) score += 5;
                break;

            case "productivity":
            case "office":
                // RAM bonus
                if (spec.contains("32gb")) score += 30;
                else if (spec.contains("16gb")) score += 20;
                else if (spec.contains("8gb")) score += 10;

                // Battery life
                if (laptop.getBattery() != null) {
                    String battery = laptop.getBattery().toLowerCase();
                    if (battery.contains("80wh") || battery.contains("90wh")) score += 25;
                    else if (battery.contains("70wh")) score += 20;
                    else if (battery.contains("56wh") || battery.contains("60wh")) score += 15;
                }

                // Lightweight
                if (laptop.getWeight() > 0 && laptop.getWeight() < 1.5) score += 10;
                break;

            case "coding":
            case "development":
                // RAM + Storage
                if (spec.contains("16gb") || spec.contains("32gb")) score += 25;
                if (spec.contains("512gb ssd") || spec.contains("1tb ssd")) score += 15;

                // Good screen for long coding sessions
                if (laptop.getScreen() != null && laptop.getScreen().contains("FHD")) score += 10;
                break;

            case "content":
            case "creative":
                // Display quality
                if (laptop.getScreen() != null) {
                    String screen = laptop.getScreen().toLowerCase();
                    if (screen.contains("oled")) score += 20;
                    if (screen.contains("4k")) score += 15;
                    if (screen.contains("qhd") || screen.contains("2k")) score += 12;
                }

                // GPU for rendering
                if (spec.contains("rtx")) score += 20;

                // RAM for editing
                if (spec.contains("32gb")) score += 15;
                break;
        }

        // Budget efficiency bonus (CRITICAL!)
        double utilization = (double) laptop.getPrice() / budget;
        if (utilization >= 0.85 && utilization <= 1.0) {
            score += 25; // Perfect budget use
        } else if (utilization >= 0.70 && utilization < 0.85) {
            score += 15; // Good budget use
        } else if (utilization >= 0.50 && utilization < 0.70) {
            score += 5; // Moderate budget use
        }

        return score;
    }
}

