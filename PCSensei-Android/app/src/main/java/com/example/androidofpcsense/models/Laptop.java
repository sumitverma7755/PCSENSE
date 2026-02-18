package com.example.androidofpcsense.models;

public class Laptop extends Component {
    private String type; // gaming, office, creative, basic
    private String screen;
    private String refresh; // Changed from int to String (JSON has "60Hz", "144Hz", etc.)
    private String battery;
    private String weight; // Changed from double to String (JSON has "1.3kg", "1.65kg", etc.)
    private int aiScore; // For recommendation scoring

    public Laptop() {
        super();
    }

    // Getters and Setters
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getScreen() {
        return screen;
    }

    public void setScreen(String screen) {
        this.screen = screen;
    }

    public String getRefresh() {
        return refresh;
    }

    public void setRefresh(String refresh) {
        this.refresh = refresh;
    }

    /**
     * Extract numeric refresh rate from string like "144Hz"
     */
    public int getRefreshRate() {
        if (refresh == null) return 60;
        try {
            // Extract number from strings like "144Hz", "60Hz", etc.
            return Integer.parseInt(refresh.replaceAll("[^0-9]", ""));
        } catch (NumberFormatException e) {
            return 60; // Default
        }
    }

    public String getBattery() {
        return battery;
    }

    public void setBattery(String battery) {
        this.battery = battery;
    }

    public String getWeight() {
        return weight;
    }

    public void setWeight(String weight) {
        this.weight = weight;
    }

    /**
     * Extract numeric weight from string like "1.3kg"
     */
    public double getWeightValue() {
        if (weight == null) return 0.0;
        try {
            // Extract number from strings like "1.3kg", "1.65kg", etc.
            return Double.parseDouble(weight.replaceAll("[^0-9.]", ""));
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }

    public int getAiScore() {
        return aiScore;
    }

    public void setAiScore(int aiScore) {
        this.aiScore = aiScore;
    }

    @Override
    public String getCategory() {
        return "Laptop";
    }
}

