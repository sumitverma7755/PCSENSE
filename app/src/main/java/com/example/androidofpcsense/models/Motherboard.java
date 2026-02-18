package com.example.androidofpcsense.models;

public class Motherboard extends Component {
    private String socket;
    private String chipset;
    private String formFactor;

    public Motherboard() {
        super();
    }

    // Getters and Setters
    public String getSocket() {
        return socket;
    }

    public void setSocket(String socket) {
        this.socket = socket;
    }

    public String getChipset() {
        return chipset;
    }

    public void setChipset(String chipset) {
        this.chipset = chipset;
    }

    public String getFormFactor() {
        return formFactor;
    }

    public void setFormFactor(String formFactor) {
        this.formFactor = formFactor;
    }

    @Override
    public String getCategory() {
        return "Motherboard";
    }
}

