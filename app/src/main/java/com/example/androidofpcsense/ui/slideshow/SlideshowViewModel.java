package com.example.androidofpcsense.ui.slideshow;

import android.app.Application;

import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.example.androidofpcsense.data.ChatRepository;
import com.example.androidofpcsense.models.chat.ChatMessage;

import java.util.ArrayList;
import java.util.List;

public class SlideshowViewModel extends AndroidViewModel {

    private final ChatRepository chatRepository;
    private final MutableLiveData<List<ChatMessage>> messages;
    private final MutableLiveData<Boolean> sending;
    private final MutableLiveData<String> status;

    public SlideshowViewModel(@NonNull Application application) {
        super(application);
        chatRepository = ChatRepository.getInstance(application);
        messages = new MutableLiveData<>(new ArrayList<>());
        sending = new MutableLiveData<>(false);
        status = new MutableLiveData<>("Connecting to expert...");
        ensureSession();
    }

    public LiveData<List<ChatMessage>> getMessages() {
        return messages;
    }

    public LiveData<Boolean> getSending() {
        return sending;
    }

    public LiveData<String> getStatus() {
        return status;
    }

    public void send(String userText) {
        String normalized = userText == null ? "" : userText.trim();
        if (normalized.isEmpty()) {
            return;
        }

        appendMessage(new ChatMessage("user", normalized, System.currentTimeMillis()));
        sending.setValue(true);
        status.setValue("Expert is typing...");

        chatRepository.sendMessage(normalized, new ChatRepository.ChatCallback() {
            @Override
            public void onReply(String reply) {
                appendMessage(new ChatMessage("assistant", reply, System.currentTimeMillis()));
                sending.setValue(false);
                status.setValue("Connected");
            }

            @Override
            public void onError(String message) {
                appendMessage(new ChatMessage("assistant", "I am currently unavailable. " + message,
                        System.currentTimeMillis()));
                sending.setValue(false);
                status.setValue("Connection issue");
            }
        });
    }

    private void ensureSession() {
        chatRepository.ensureSession(new ChatRepository.SessionCallback() {
            @Override
            public void onReady(String sessionId, String welcomeMessage) {
                if (welcomeMessage != null && !welcomeMessage.trim().isEmpty()) {
                    appendMessage(new ChatMessage("assistant", welcomeMessage, System.currentTimeMillis()));
                }
                status.setValue("Connected");
            }

            @Override
            public void onError(String message) {
                status.setValue("Connection issue: " + message);
            }
        });
    }

    private void appendMessage(ChatMessage message) {
        List<ChatMessage> current = messages.getValue();
        List<ChatMessage> updated = current == null ? new ArrayList<>() : new ArrayList<>(current);
        updated.add(message);
        messages.setValue(updated);
    }
}
