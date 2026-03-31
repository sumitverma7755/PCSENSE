package com.example.androidofpcsense.data;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;

import com.example.androidofpcsense.data.local.ComponentCacheDao;
import com.example.androidofpcsense.data.local.ComponentCacheEntity;
import com.example.androidofpcsense.data.local.PCSenseiDatabase;
import com.example.androidofpcsense.data.network.ApiClientFactory;
import com.example.androidofpcsense.data.network.PcsenseiApiService;
import com.example.androidofpcsense.models.ComponentDatabase;
import com.example.androidofpcsense.models.chat.ConnectionResult;
import com.example.androidofpcsense.ui.common.UiState;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import retrofit2.Call;
import retrofit2.Response;

public class ComponentRepository {

    public interface ComponentStateCallback {
        void onState(UiState<ComponentDatabase> state);
    }

    public interface ConnectionCallback {
        void onResult(ConnectionResult result);
    }

    private static final String CACHE_KEY_COMPONENTS = "components";

    private static volatile ComponentRepository instance;

    private final RuntimeConfigStore configStore;
    private final PcsenseiApiService apiService;
    private final ComponentCacheDao cacheDao;
    private final Gson gson;
    private final ExecutorService ioExecutor;
    private final Handler mainHandler;

    private ComponentRepository(Context context) {
        Context appContext = context.getApplicationContext();
        this.configStore = new RuntimeConfigStore(appContext);
        this.apiService = ApiClientFactory.getApiService();
        this.cacheDao = PCSenseiDatabase.getInstance(appContext).componentCacheDao();
        this.gson = new Gson();
        this.ioExecutor = Executors.newSingleThreadExecutor();
        this.mainHandler = new Handler(Looper.getMainLooper());
    }

    public static ComponentRepository getInstance(Context context) {
        if (instance == null) {
            synchronized (ComponentRepository.class) {
                if (instance == null) {
                    instance = new ComponentRepository(context);
                }
            }
        }
        return instance;
    }

    public RuntimeConfigStore getConfigStore() {
        return configStore;
    }

    public void fetchComponents(ComponentStateCallback callback) {
        postState(callback, UiState.loading());

        ioExecutor.execute(() -> {
            List<String> candidates = EndpointResolver.componentCandidates(configStore);
            StringBuilder errors = new StringBuilder();

            for (String endpoint : candidates) {
                try {
                    Response<ComponentDatabase> response = apiService.fetchComponents(endpoint).execute();
                    if (!response.isSuccessful()) {
                        errors.append(endpoint)
                                .append(" -> HTTP ")
                                .append(response.code())
                                .append("\n");
                        continue;
                    }

                    ComponentDatabase body = response.body();
                    if (!isValid(body)) {
                        errors.append(endpoint).append(" -> invalid payload\n");
                        continue;
                    }

                    cacheDao.upsert(new ComponentCacheEntity(
                            CACHE_KEY_COMPONENTS,
                            gson.toJson(body),
                            System.currentTimeMillis()
                    ));
                    postState(callback, UiState.success(body, false, "Live data"));
                    return;
                } catch (IOException ioException) {
                    errors.append(endpoint).append(" -> ").append(ioException.getMessage()).append("\n");
                }
            }

            ComponentCacheEntity cached = cacheDao.findById(CACHE_KEY_COMPONENTS);
            if (cached != null && cached.payloadJson != null && !cached.payloadJson.isEmpty()) {
                try {
                    ComponentDatabase cachedDb = gson.fromJson(cached.payloadJson, ComponentDatabase.class);
                    if (isValid(cachedDb)) {
                        postState(callback, UiState.success(cachedDb, true,
                                "Using cached data. Live endpoints were unreachable."));
                        return;
                    }
                } catch (Exception ignored) {
                    // fall through to error
                }
            }

            String message = "Unable to load components.\n" + errors;
            postState(callback, UiState.error(message.trim(), null));
        });
    }

    public void testConnection(ConnectionCallback callback) {
        ioExecutor.execute(() -> {
            try {
                String healthUrl = EndpointResolver.healthUrl(configStore);
                Call<JsonObject> call = apiService.fetchHealth(healthUrl);
                Response<JsonObject> response = call.execute();
                if (response.isSuccessful()) {
                    postConnection(callback, new ConnectionResult(true, "Connection OK: " + healthUrl));
                    return;
                }
                postConnection(callback, new ConnectionResult(false,
                        "Health check failed (HTTP " + response.code() + ")"));
            } catch (Exception e) {
                postConnection(callback, new ConnectionResult(false,
                        "Connection failed: " + e.getMessage()));
            }
        });
    }

    private void postState(ComponentStateCallback callback, UiState<ComponentDatabase> state) {
        mainHandler.post(() -> callback.onState(state));
    }

    private void postConnection(ConnectionCallback callback, ConnectionResult result) {
        mainHandler.post(() -> callback.onResult(result));
    }

    private boolean isValid(ComponentDatabase db) {
        return db != null && db.getLaptops() != null && db.getCpus() != null && db.getGpus() != null;
    }
}
