package com.example.androidofpcsense.models;

public class GPU extends Component {
    private String vram; // Changed to String (JSON has "8GB", "Shared System RAM", etc.)
    private String tdp; // Changed to String (JSON has "220W", "Integrated (15W typical)", etc.)
    private String tier; // budget, mid, high, ultra

    public GPU() {
        super();
    }

    // Getters and Setters
    public String getVram() {
        return vram;
    }

    public void setVram(String vram) {
        this.vram = vram;
    }
    
    /**
     * Extract numeric VRAM value from string like "8GB"
     */
    public int getVramValue() {
        if (vram == null || vram.toLowerCase().contains("shared") || vram.toLowerCase().contains("system")) {
            return 0; // Integrated graphics
        }
        try {
            return Integer.parseInt(vram.replaceAll("[^0-9]", ""));
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    public String getTdp() {
        return tdp;
    }

    public void setTdp(String tdp) {
        this.tdp = tdp;
    }
    
    /**
     * Extract numeric TDP value from string like "220W"
     */
    public int getTdpValue() {
        if (tdp == null) return 150; // Default
        try {
            String numbers = tdp.replaceAll("[^0-9]", "");
            if (numbers.isEmpty()) return 150;
            return Integer.parseInt(numbers);
        } catch (NumberFormatException e) {
            return 150;
        }
    }

    public String getTier() {
        return tier;
    }

    public void setTier(String tier) {
        this.tier = tier;
    }

    @Override
    public String getCategory() {
        return "GPU";
    }
}
