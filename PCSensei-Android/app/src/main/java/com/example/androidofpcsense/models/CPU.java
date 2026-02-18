package com.example.androidofpcsense.models;

public class CPU extends Component {
    private int cores;
    private int threads;
    private String socket;
    private String tdp; // Changed from int to String (JSON has "35W", "65W", etc.)

    public CPU() {
        super();
    }

    // Getters and Setters
    public int getCores() {
        return cores;
    }

    public void setCores(int cores) {
        this.cores = cores;
    }

    public int getThreads() {
        return threads;
    }

    public void setThreads(int threads) {
        this.threads = threads;
    }

    public String getSocket() {
        return socket;
    }

    public void setSocket(String socket) {
        this.socket = socket;
    }

    public String getTdp() {
        return tdp;
    }

    public void setTdp(String tdp) {
        this.tdp = tdp;
    }

    /**
     * Extract numeric TDP value from string like "65W"
     */
    public int getTdpValue() {
        if (tdp == null) return 65; // Default
        try {
            // Extract number from strings like "65W", "95W", etc.
            return Integer.parseInt(tdp.replaceAll("[^0-9]", ""));
        } catch (NumberFormatException e) {
            return 65; // Default
        }
    }

    @Override
    public String getCategory() {
        return "CPU";
    }
}

