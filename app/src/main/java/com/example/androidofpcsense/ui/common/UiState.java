package com.example.androidofpcsense.ui.common;

import androidx.annotation.Nullable;

public final class UiState<T> {

    public enum Status {
        IDLE,
        LOADING,
        SUCCESS,
        ERROR
    }

    private final Status status;
    private final T data;
    private final String message;
    private final boolean fromCache;

    private UiState(Status status, @Nullable T data, @Nullable String message, boolean fromCache) {
        this.status = status;
        this.data = data;
        this.message = message;
        this.fromCache = fromCache;
    }

    public static <T> UiState<T> idle() {
        return new UiState<>(Status.IDLE, null, null, false);
    }

    public static <T> UiState<T> loading() {
        return new UiState<>(Status.LOADING, null, null, false);
    }

    public static <T> UiState<T> success(T data, boolean fromCache, @Nullable String message) {
        return new UiState<>(Status.SUCCESS, data, message, fromCache);
    }

    public static <T> UiState<T> error(@Nullable String message, @Nullable T fallbackData) {
        return new UiState<>(Status.ERROR, fallbackData, message, fallbackData != null);
    }

    public Status getStatus() {
        return status;
    }

    @Nullable
    public T getData() {
        return data;
    }

    @Nullable
    public String getMessage() {
        return message;
    }

    public boolean isFromCache() {
        return fromCache;
    }
}
