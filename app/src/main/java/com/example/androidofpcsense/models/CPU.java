package com.example.androidofpcsense.models;

public class CPU extends Component {
    private int cores;
    private int threads;
    private String socket;
    private int tdp;

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

    public int getTdp() {
        return tdp;
    }

    public void setTdp(int tdp) {
        this.tdp = tdp;
    }

    @Override
    public String getCategory() {
        return "CPU";
    }
}

