package com.example.androidofpcsense.models;

import java.io.Serializable;
import java.util.Map;

public class Component implements Serializable {
    private String id;
    private String name;
    private int price;
    private String brand;
    private String spec;
    private Map<String, String> shopLinks;

    // Default constructor for Gson
    public Component() {}

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getPrice() {
        return price;
    }

    public void setPrice(int price) {
        this.price = price;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getSpec() {
        return spec;
    }

    public void setSpec(String spec) {
        this.spec = spec;
    }

    public Map<String, String> getShopLinks() {
        return shopLinks;
    }

    public void setShopLinks(Map<String, String> shopLinks) {
        this.shopLinks = shopLinks;
    }

    public String getCategory() {
        return "Component";
    }
}

