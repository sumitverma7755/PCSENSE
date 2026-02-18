package com.example.androidofpcsense.models;

public class Laptop extends Component {
    private String type; // gaming, office, creative, basic
    private String screen;
    private String refresh; // Changed from int to String to handle "60Hz", "144Hz" etc
    private String battery;
    private String weight; // Changed from double to String to handle "1.3kg", "2kg" etc
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

    // Helper method to get refresh rate as integer
    public int getRefreshInt() {
        if (refresh == null || refresh.isEmpty()) {
            return 60; // Default
        }
        try {
            return Integer.parseInt(refresh.replaceAll("[^0-9]", ""));
        } catch (NumberFormatException e) {
            return 60;
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

    // Helper to get weight as double (numeric value)
    public double getWeightValue() {
        if (weight == null || weight.isEmpty()) return 0.0;
        try {
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

