package com.example.androidofpcsense.ui.transform;

import android.app.Application;

import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.example.androidofpcsense.data.ComponentRepository;
import com.example.androidofpcsense.models.ComponentDatabase;
import com.example.androidofpcsense.ui.common.UiState;

public class TransformViewModel extends AndroidViewModel {

    private final ComponentRepository repository;
    private final MutableLiveData<UiState<ComponentDatabase>> componentsState;

    public TransformViewModel(@NonNull Application application) {
        super(application);
        repository = ComponentRepository.getInstance(application);
        componentsState = new MutableLiveData<>(UiState.idle());
    }

    public LiveData<UiState<ComponentDatabase>> getComponentsState() {
        return componentsState;
    }

    public void loadComponents() {
        repository.fetchComponents(componentsState::setValue);
    }
}
