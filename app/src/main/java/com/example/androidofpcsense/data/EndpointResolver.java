package com.example.androidofpcsense.data;

import com.example.androidofpcsense.BuildConfig;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;

public final class EndpointResolver {

    private EndpointResolver() {
    }

    public static List<String> componentCandidates(RuntimeConfigStore configStore) {
        return componentCandidates(configStore.getApiComponentsUrl(), configStore.getDataComponentsUrl());
    }

    public static List<String> componentCandidates(String apiComponentsUrl, String dataComponentsUrl) {
        LinkedHashSet<String> urls = new LinkedHashSet<>();

        urls.add(apiComponentsUrl);
        urls.add(dataComponentsUrl);

        urls.add(BuildConfig.PCSENSEI_API_URL);
        urls.add(BuildConfig.PCSENSEI_DATA_URL);

        urls.add("http://10.0.2.2:3001/api/components");
        urls.add("http://10.0.2.2:8000/data/components.json");
        urls.add("http://127.0.0.1:3001/api/components");
        urls.add("http://127.0.0.1:8000/data/components.json");
        urls.add("http://localhost:3001/api/components");
        urls.add("http://localhost:8000/data/components.json");

        return filterValidUrls(urls);
    }

    public static String healthUrl(RuntimeConfigStore configStore) {
        return normalizeBaseUrl(configStore.getChatBaseUrl()) + "/api/health";
    }

    public static String chatSessionUrl(RuntimeConfigStore configStore) {
        return normalizeBaseUrl(configStore.getChatBaseUrl()) + "/api/chat/session";
    }

    public static String chatMessageUrl(RuntimeConfigStore configStore) {
        return normalizeBaseUrl(configStore.getChatBaseUrl()) + "/api/chat/message";
    }

    public static String normalizeBaseUrl(String raw) {
        if (raw == null || raw.trim().isEmpty()) {
            return BuildConfig.PCSENSEI_CHAT_URL;
        }
        String trimmed = raw.trim();
        while (trimmed.endsWith("/")) {
            trimmed = trimmed.substring(0, trimmed.length() - 1);
        }
        return trimmed;
    }

    private static List<String> filterValidUrls(LinkedHashSet<String> rawUrls) {
        List<String> urls = new ArrayList<>();
        for (String value : rawUrls) {
            if (value == null || value.trim().isEmpty()) {
                continue;
            }
            String normalized = value.trim();
            while (normalized.endsWith("/")) {
                normalized = normalized.substring(0, normalized.length() - 1);
            }
            if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
                urls.add(normalized);
            }
        }
        return urls;
    }
}
