package com.example.androidofpcsense.data;

import android.content.Context;
import android.content.SharedPreferences;

import com.example.androidofpcsense.BuildConfig;

public class RuntimeConfigStore {

    private static final String PREFS_NAME = "pcsensei_runtime_config";
    private static final String KEY_API_COMPONENTS_URL = "api_components_url";
    private static final String KEY_DATA_COMPONENTS_URL = "data_components_url";
    private static final String KEY_CHAT_BASE_URL = "chat_base_url";

    private final SharedPreferences preferences;

    public RuntimeConfigStore(Context context) {
        this.preferences = context.getApplicationContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    public String getApiComponentsUrl() {
        return getOrDefault(KEY_API_COMPONENTS_URL, BuildConfig.PCSENSEI_API_URL);
    }

    public String getDataComponentsUrl() {
        return getOrDefault(KEY_DATA_COMPONENTS_URL, BuildConfig.PCSENSEI_DATA_URL);
    }

    public String getChatBaseUrl() {
        return getOrDefault(KEY_CHAT_BASE_URL, BuildConfig.PCSENSEI_CHAT_URL);
    }

    public void save(String apiUrl, String dataUrl, String chatBaseUrl) {
        preferences.edit()
                .putString(KEY_API_COMPONENTS_URL, sanitize(apiUrl, BuildConfig.PCSENSEI_API_URL))
                .putString(KEY_DATA_COMPONENTS_URL, sanitize(dataUrl, BuildConfig.PCSENSEI_DATA_URL))
                .putString(KEY_CHAT_BASE_URL, sanitize(chatBaseUrl, BuildConfig.PCSENSEI_CHAT_URL))
                .apply();
    }

    public void reset() {
        preferences.edit()
                .putString(KEY_API_COMPONENTS_URL, BuildConfig.PCSENSEI_API_URL)
                .putString(KEY_DATA_COMPONENTS_URL, BuildConfig.PCSENSEI_DATA_URL)
                .putString(KEY_CHAT_BASE_URL, BuildConfig.PCSENSEI_CHAT_URL)
                .apply();
    }

    private String getOrDefault(String key, String fallback) {
        return sanitize(preferences.getString(key, fallback), fallback);
    }

    private String sanitize(String value, String fallback) {
        if (value == null || value.trim().isEmpty()) {
            return fallback;
        }
        String trimmed = value.trim();
        while (trimmed.endsWith("/")) {
            trimmed = trimmed.substring(0, trimmed.length() - 1);
        }
        return trimmed;
    }
}
