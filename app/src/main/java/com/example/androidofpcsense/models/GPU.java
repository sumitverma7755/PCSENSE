package com.example.androidofpcsense.models;

public class GPU extends Component {
    private int vram;
    private int tdp;
    private String tier; // budget, mid, high, ultra

    public GPU() {
        super();
    }

    // Getters and Setters
    public int getVram() {
        return vram;
    }

    public void setVram(int vram) {
        this.vram = vram;
    }

    public int getTdp() {
        return tdp;
    }

    public void setTdp(int tdp) {
        this.tdp = tdp;
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

