package com.example.androidofpcsense.ui.settings;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;

import com.example.androidofpcsense.R;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.transition.MaterialSharedAxis;

import android.widget.TextView;

public class SettingsFragment extends Fragment {

    private SettingsViewModel viewModel;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setEnterTransition(new MaterialSharedAxis(MaterialSharedAxis.X, true));
        setReturnTransition(new MaterialSharedAxis(MaterialSharedAxis.X, false));
    }

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        View root = inflater.inflate(R.layout.fragment_settings, container, false);

        TextInputEditText apiUrlInput = root.findViewById(R.id.settings_api_url);
        TextInputEditText dataUrlInput = root.findViewById(R.id.settings_data_url);
        TextInputEditText chatBaseInput = root.findViewById(R.id.settings_chat_base_url);

        MaterialButton saveButton = root.findViewById(R.id.settings_save_button);
        MaterialButton testButton = root.findViewById(R.id.settings_test_button);
        MaterialButton resetButton = root.findViewById(R.id.settings_reset_button);

        TextView statusText = root.findViewById(R.id.settings_status);

        viewModel = new ViewModelProvider(this).get(SettingsViewModel.class);

        viewModel.getApiUrl().observe(getViewLifecycleOwner(), value -> {
            String safeValue = value == null ? "" : value;
            if (apiUrlInput.getText() == null || !safeValue.equals(apiUrlInput.getText().toString())) {
                apiUrlInput.setText(safeValue);
            }
        });
        viewModel.getDataUrl().observe(getViewLifecycleOwner(), value -> {
            String safeValue = value == null ? "" : value;
            if (dataUrlInput.getText() == null || !safeValue.equals(dataUrlInput.getText().toString())) {
                dataUrlInput.setText(safeValue);
            }
        });
        viewModel.getChatBaseUrl().observe(getViewLifecycleOwner(), value -> {
            String safeValue = value == null ? "" : value;
            if (chatBaseInput.getText() == null || !safeValue.equals(chatBaseInput.getText().toString())) {
                chatBaseInput.setText(safeValue);
            }
        });
        viewModel.getStatus().observe(getViewLifecycleOwner(), statusText::setText);

        saveButton.setOnClickListener(v -> viewModel.save(
                readText(apiUrlInput),
                readText(dataUrlInput),
                readText(chatBaseInput)
        ));

        testButton.setOnClickListener(v -> viewModel.testConnection());

        resetButton.setOnClickListener(v -> viewModel.resetDefaults());

        return root;
    }

    private String readText(TextInputEditText input) {
        return input.getText() == null ? "" : input.getText().toString();
    }
}
