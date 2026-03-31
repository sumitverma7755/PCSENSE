package com.example.androidofpcsense.models.chat;

public class ChatMessageResponse {

    private boolean success;
    private String sessionId;
    private String reply;

    public boolean isSuccess() {
        return success;
    }

    public String getSessionId() {
        return sessionId;
    }

    public String getReply() {
        return reply;
    }
}
