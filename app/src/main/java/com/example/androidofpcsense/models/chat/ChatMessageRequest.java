package com.example.androidofpcsense.models.chat;

public class ChatMessageRequest {

    private String sessionId;
    private String message;

    public ChatMessageRequest(String sessionId, String message) {
        this.sessionId = sessionId;
        this.message = message;
    }

    public String getSessionId() {
        return sessionId;
    }

    public String getMessage() {
        return message;
    }
}
