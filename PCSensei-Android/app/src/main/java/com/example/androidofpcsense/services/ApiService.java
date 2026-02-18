package com.example.androidofpcsense.services;

import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import com.example.androidofpcsense.models.ComponentDatabase;
import com.google.gson.Gson;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class ApiService {

    private static final String TAG = "ApiService";
    private static final String API_BASE = "http://192.168.29.76:8000";

    /**
     * Fetch components.json from local server
     * CRITICAL: Must run on background thread!
     */
    public void fetchComponents(ComponentCallback callback) {
        new Thread(() -> {
            try {
                Log.d(TAG, "Fetching components from: " + API_BASE + "/data/components.json");

                // Make HTTP request
                URL url = new URL(API_BASE + "/data/components.json");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setConnectTimeout(10000); // 10 seconds
                conn.setReadTimeout(10000);

                // Check response code
                int responseCode = conn.getResponseCode();
                Log.d(TAG, "Response code: " + responseCode);

                if (responseCode != 200) {
                    throw new Exception("Server returned: " + responseCode);
                }

                // Read response
                InputStream is = conn.getInputStream();
                BufferedReader reader = new BufferedReader(new InputStreamReader(is));
                StringBuilder json = new StringBuilder();
                String line;

                while ((line = reader.readLine()) != null) {
                    json.append(line);
                }

                reader.close();
                conn.disconnect();

                Log.d(TAG, "JSON length: " + json.length() + " characters");

                // Parse JSON using Gson
                Gson gson = new Gson();
                ComponentDatabase db = gson.fromJson(json.toString(), ComponentDatabase.class);

                Log.d(TAG, "Parsed successfully!");
                if (db.getLaptops() != null) Log.d(TAG, "Laptops: " + db.getLaptops().size());
                if (db.getCpus() != null) Log.d(TAG, "CPUs: " + db.getCpus().size());
                if (db.getGpus() != null) Log.d(TAG, "GPUs: " + db.getGpus().size());

                // Return result on MAIN THREAD (required for UI updates)
                new Handler(Looper.getMainLooper()).post(() ->
                    callback.onSuccess(db)
                );

            } catch (Exception e) {
                Log.e(TAG, "Error fetching components", e);
                // Return error on main thread
                new Handler(Looper.getMainLooper()).post(() ->
                    callback.onError(e)
                );
            }
        }).start();
    }

    /**
     * Callback interface for async API calls
     */
    public interface ComponentCallback {
        void onSuccess(ComponentDatabase db);
        void onError(Exception e);
    }
}

