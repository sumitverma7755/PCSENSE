package com.example.androidofpcsense.services;

import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import com.example.androidofpcsense.BuildConfig;
import com.example.androidofpcsense.models.ComponentDatabase;
import com.google.gson.Gson;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;

public class ApiService {

    private static final String TAG = "ApiService";
    private static final int CONNECT_TIMEOUT_MS = 8000;
    private static final int READ_TIMEOUT_MS = 12000;

    public void fetchComponents(ComponentCallback callback) {
        new Thread(() -> {
            Exception lastError = null;

            for (String endpoint : buildEndpointCandidates()) {
                try {
                    Log.d(TAG, "Trying endpoint: " + endpoint);
                    ComponentDatabase db = fetchFromEndpoint(endpoint);

                    new Handler(Looper.getMainLooper()).post(() -> callback.onSuccess(db));
                    return;
                } catch (Exception e) {
                    lastError = e;
                    Log.w(TAG, "Failed endpoint " + endpoint + ": " + e.getMessage());
                }
            }

            Exception error = lastError != null
                    ? lastError
                    : new IOException("No reachable data endpoint configured");
            new Handler(Looper.getMainLooper()).post(() -> callback.onError(error));
        }).start();
    }

    private ComponentDatabase fetchFromEndpoint(String endpoint) throws Exception {
        HttpURLConnection conn = null;
        try {
            URL url = new URL(endpoint);
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(CONNECT_TIMEOUT_MS);
            conn.setReadTimeout(READ_TIMEOUT_MS);
            conn.setRequestProperty("Accept", "application/json");
            conn.setRequestProperty("Connection", "close");
            conn.setUseCaches(false);

            int responseCode = conn.getResponseCode();
            if (responseCode != HttpURLConnection.HTTP_OK) {
                throw new IOException("HTTP " + responseCode + " from " + endpoint);
            }

            String body = readFully(conn.getInputStream());
            if (body.trim().isEmpty()) {
                throw new IOException("Empty response body from " + endpoint);
            }

            Gson gson = new Gson();
            ComponentDatabase db = gson.fromJson(body, ComponentDatabase.class);
            if (!isValidDatabase(db)) {
                throw new IOException("Invalid component payload from " + endpoint);
            }

            return db;
        } catch (IOException ioException) {
            String message = ioException.getMessage();
            if (message != null && message.toLowerCase().contains("unexpected end of stream")) {
                throw new IOException("Unexpected end of stream. Check server connectivity and keep-alive handling.", ioException);
            }
            throw ioException;
        } finally {
            if (conn != null) {
                conn.disconnect();
            }
        }
    }

    private String readFully(InputStream inputStream) throws IOException {
        StringBuilder json = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {
            String line;
            while ((line = reader.readLine()) != null) {
                json.append(line);
            }
        }
        return json.toString();
    }

    private List<String> buildEndpointCandidates() {
        LinkedHashSet<String> urls = new LinkedHashSet<>();

        urls.add(BuildConfig.PCSENSEI_API_URL);
        urls.add(BuildConfig.PCSENSEI_DATA_URL);

        urls.add("http://10.0.2.2:3001/api/components");
        urls.add("http://10.0.2.2:8000/data/components.json");
        urls.add("http://127.0.0.1:3001/api/components");
        urls.add("http://127.0.0.1:8000/data/components.json");
        urls.add("http://192.168.29.76:3001/api/components");
        urls.add("http://192.168.29.76:8000/data/components.json");

        return new ArrayList<>(urls);
    }

    private boolean isValidDatabase(ComponentDatabase db) {
        return db != null
                && db.getCpus() != null
                && db.getGpus() != null
                && db.getLaptops() != null;
    }

    public interface ComponentCallback {
        void onSuccess(ComponentDatabase db);
        void onError(Exception e);
    }
}
