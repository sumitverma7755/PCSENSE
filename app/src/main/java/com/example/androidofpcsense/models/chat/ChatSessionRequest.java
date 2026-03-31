package com.example.androidofpcsense.models.chat;

public class ChatSessionRequest {

    private String deviceId;

    public ChatSessionRequest(String deviceId) {
        this.deviceId = deviceId;
    }

    public String getDeviceId() {
        return deviceId;
    }
}
