package com.example.androidofpcsense.ui.settings;

import android.app.Application;

import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.example.androidofpcsense.data.ComponentRepository;
import com.example.androidofpcsense.data.RuntimeConfigStore;
import com.example.androidofpcsense.models.chat.ConnectionResult;

public class SettingsViewModel extends AndroidViewModel {

    private final RuntimeConfigStore configStore;
    private final ComponentRepository repository;

    private final MutableLiveData<String> apiUrl = new MutableLiveData<>();
    private final MutableLiveData<String> dataUrl = new MutableLiveData<>();
    private final MutableLiveData<String> chatBaseUrl = new MutableLiveData<>();
    private final MutableLiveData<String> status = new MutableLiveData<>("Ready");

    public SettingsViewModel(@NonNull Application application) {
        super(application);
        repository = ComponentRepository.getInstance(application);
        configStore = repository.getConfigStore();
        loadFromStore();
    }

    public LiveData<String> getApiUrl() {
        return apiUrl;
    }

    public LiveData<String> getDataUrl() {
        return dataUrl;
    }

    public LiveData<String> getChatBaseUrl() {
        return chatBaseUrl;
    }

    public LiveData<String> getStatus() {
        return status;
    }

    public void save(String api, String data, String chatBase) {
        configStore.save(api, data, chatBase);
        loadFromStore();
        status.setValue("Saved runtime endpoints.");
    }

    public void resetDefaults() {
        configStore.reset();
        loadFromStore();
        status.setValue("Reset to defaults.");
    }

    public void testConnection() {
        status.setValue("Testing connection...");
        repository.testConnection(result -> {
            String prefix = result.isSuccess() ? "Connected: " : "Failed: ";
            status.setValue(prefix + result.getMessage());
        });
    }

    private void loadFromStore() {
        apiUrl.setValue(configStore.getApiComponentsUrl());
        dataUrl.setValue(configStore.getDataComponentsUrl());
        chatBaseUrl.setValue(configStore.getChatBaseUrl());
    }
}
