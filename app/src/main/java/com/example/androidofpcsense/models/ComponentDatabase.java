package com.example.androidofpcsense.models;

import java.util.List;

public class ComponentDatabase {
    private List<Laptop> laptops;
    private List<Component> cpus;
    private List<Component> gpus;
    private List<Component> mobos;
    private List<Component> ram;
    private List<Component> storage;
    private List<Component> psu;
    private List<Component> cases;

    public ComponentDatabase() {}

    // Getters and Setters
    public List<Laptop> getLaptops() {
        return laptops;
    }

    public void setLaptops(List<Laptop> laptops) {
        this.laptops = laptops;
    }

    public List<Component> getCpus() {
        return cpus;
    }

    public void setCpus(List<Component> cpus) {
        this.cpus = cpus;
    }

    public List<Component> getGpus() {
        return gpus;
    }

    public void setGpus(List<Component> gpus) {
        this.gpus = gpus;
    }

    public List<Component> getMobos() {
        return mobos;
    }

    public void setMobos(List<Component> mobos) {
        this.mobos = mobos;
    }

    public List<Component> getRam() {
        return ram;
    }

    public void setRam(List<Component> ram) {
        this.ram = ram;
    }

    public List<Component> getStorage() {
        return storage;
    }

    public void setStorage(List<Component> storage) {
        this.storage = storage;
    }

    public List<Component> getPsu() {
        return psu;
    }

    public void setPsu(List<Component> psu) {
        this.psu = psu;
    }

    public List<Component> getCases() {
        return cases;
    }

    public void setCases(List<Component> cases) {
        this.cases = cases;
    }
}

