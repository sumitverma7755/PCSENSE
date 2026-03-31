package com.example.androidofpcsense.ui.home;

import android.app.Application;

import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.example.androidofpcsense.data.ComponentRepository;
import com.example.androidofpcsense.models.ComponentDatabase;
import com.example.androidofpcsense.ui.common.UiState;

public class HomeViewModel extends AndroidViewModel {

    private final ComponentRepository repository;
    private final MutableLiveData<UiState<ComponentDatabase>> state;

    public HomeViewModel(@NonNull Application application) {
        super(application);
        repository = ComponentRepository.getInstance(application);
        state = new MutableLiveData<>(UiState.idle());
    }

    public LiveData<UiState<ComponentDatabase>> getState() {
        return state;
    }

    public void loadComponents() {
        repository.fetchComponents(state::setValue);
    }
}
