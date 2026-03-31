package com.example.androidofpcsense.models.chat;

public class ChatSessionResponse {

    private boolean success;
    private String sessionId;
    private String welcomeMessage;

    public boolean isSuccess() {
        return success;
    }

    public String getSessionId() {
        return sessionId;
    }

    public String getWelcomeMessage() {
        return welcomeMessage;
    }
}
