package com.example.androidofpcsense.models.chat;

public class ConnectionResult {

    private final boolean success;
    private final String message;

    public ConnectionResult(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }
}
