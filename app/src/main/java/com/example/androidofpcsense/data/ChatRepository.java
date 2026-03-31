package com.example.androidofpcsense.data;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;

import com.example.androidofpcsense.data.network.ApiClientFactory;
import com.example.androidofpcsense.data.network.PcsenseiApiService;
import com.example.androidofpcsense.models.chat.ChatMessageRequest;
import com.example.androidofpcsense.models.chat.ChatMessageResponse;
import com.example.androidofpcsense.models.chat.ChatSessionRequest;
import com.example.androidofpcsense.models.chat.ChatSessionResponse;

import java.io.IOException;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import retrofit2.Response;

public class ChatRepository {

    public interface ChatCallback {
        void onReply(String reply);
        void onError(String message);
    }

    public interface SessionCallback {
        void onReady(String sessionId, String welcomeMessage);
        void onError(String message);
    }

    private static volatile ChatRepository instance;

    private final RuntimeConfigStore configStore;
    private final PcsenseiApiService apiService;
    private final ExecutorService ioExecutor;
    private final Handler mainHandler;

    private String sessionId;

    private ChatRepository(Context context) {
        this.configStore = new RuntimeConfigStore(context.getApplicationContext());
        this.apiService = ApiClientFactory.getApiService();
        this.ioExecutor = Executors.newSingleThreadExecutor();
        this.mainHandler = new Handler(Looper.getMainLooper());
    }

    public static ChatRepository getInstance(Context context) {
        if (instance == null) {
            synchronized (ChatRepository.class) {
                if (instance == null) {
                    instance = new ChatRepository(context);
                }
            }
        }
        return instance;
    }

    public void ensureSession(SessionCallback callback) {
        if (sessionId != null && !sessionId.trim().isEmpty()) {
            postSessionReady(callback, sessionId, null);
            return;
        }

        ioExecutor.execute(() -> {
            try {
                ChatSessionRequest request = new ChatSessionRequest(UUID.randomUUID().toString());
                String url = EndpointResolver.chatSessionUrl(configStore);
                Response<ChatSessionResponse> response = apiService.createSession(url, request).execute();

                if (!response.isSuccessful() || response.body() == null || !response.body().isSuccess()) {
                    postSessionError(callback, "Unable to start chat session");
                    return;
                }

                sessionId = response.body().getSessionId();
                postSessionReady(callback, sessionId, response.body().getWelcomeMessage());
            } catch (IOException e) {
                postSessionError(callback, "Chat service unavailable: " + e.getMessage());
            }
        });
    }

    public void sendMessage(String message, ChatCallback callback) {
        ensureSession(new SessionCallback() {
            @Override
            public void onReady(String ensuredSessionId, String welcomeMessage) {
                ioExecutor.execute(() -> {
                    try {
                        ChatMessageRequest request = new ChatMessageRequest(ensuredSessionId, message);
                        String url = EndpointResolver.chatMessageUrl(configStore);
                        Response<ChatMessageResponse> response = apiService.sendMessage(url, request).execute();

                        if (!response.isSuccessful() || response.body() == null || !response.body().isSuccess()) {
                            postChatError(callback, "Expert reply failed");
                            return;
                        }

                        postChatReply(callback, response.body().getReply());
                    } catch (IOException e) {
                        postChatError(callback, "Chat connection error: " + e.getMessage());
                    }
                });
            }

            @Override
            public void onError(String error) {
                postChatError(callback, error);
            }
        });
    }

    private void postSessionReady(SessionCallback callback, String id, String welcome) {
        mainHandler.post(() -> callback.onReady(id, welcome));
    }

    private void postSessionError(SessionCallback callback, String message) {
        mainHandler.post(() -> callback.onError(message));
    }

    private void postChatReply(ChatCallback callback, String reply) {
        mainHandler.post(() -> callback.onReply(reply));
    }

    private void postChatError(ChatCallback callback, String message) {
        mainHandler.post(() -> callback.onError(message));
    }
}
