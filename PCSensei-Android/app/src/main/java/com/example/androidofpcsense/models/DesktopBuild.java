package com.example.androidofpcsense.models;

import java.io.Serializable;

public class DesktopBuild implements Serializable {
    private Component cpu;
    private Component gpu;
    private Component motherboard;
    private Component ram;
    private Component storage;
    private Component psu;
    private Component caseComponent;

    public DesktopBuild() {}

    public DesktopBuild(Component cpu, Component gpu, Component motherboard,
                        Component ram, Component storage, Component psu, Component caseComponent) {
        this.cpu = cpu;
        this.gpu = gpu;
        this.motherboard = motherboard;
        this.ram = ram;
        this.storage = storage;
        this.psu = psu;
        this.caseComponent = caseComponent;
    }

    public int getTotalPrice() {
        int total = 0;
        if (cpu != null) total += cpu.getPrice();
        if (gpu != null) total += gpu.getPrice();
        if (motherboard != null) total += motherboard.getPrice();
        if (ram != null) total += ram.getPrice();
        if (storage != null) total += storage.getPrice();
        if (psu != null) total += psu.getPrice();
        if (caseComponent != null) total += caseComponent.getPrice();
        return total;
    }

    // Getters and Setters
    public Component getCpu() {
        return cpu;
    }

    public void setCpu(Component cpu) {
        this.cpu = cpu;
    }

    public Component getGpu() {
        return gpu;
    }

    public void setGpu(Component gpu) {
        this.gpu = gpu;
    }

    public Component getMotherboard() {
        return motherboard;
    }

    public void setMotherboard(Component motherboard) {
        this.motherboard = motherboard;
    }

    public Component getRam() {
        return ram;
    }

    public void setRam(Component ram) {
        this.ram = ram;
    }

    public Component getStorage() {
        return storage;
    }

    public void setStorage(Component storage) {
        this.storage = storage;
    }

    public Component getPsu() {
        return psu;
    }

    public void setPsu(Component psu) {
        this.psu = psu;
    }

    public Component getCaseComponent() {
        return caseComponent;
    }

    public void setCaseComponent(Component caseComponent) {
        this.caseComponent = caseComponent;
    }
}

