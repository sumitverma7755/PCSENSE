package com.example.androidofpcsense.ui.home;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.navigation.NavController;
import androidx.navigation.Navigation;

import com.example.androidofpcsense.R;
import com.example.androidofpcsense.models.ComponentDatabase;
import com.example.androidofpcsense.services.ApiService;

public class HomeFragment extends Fragment {

    private TextView statusText;
    private Button pcBuilderButton;
    private Button laptopFinderButton;
    private ComponentDatabase cachedDatabase;

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        View root = inflater.inflate(R.layout.fragment_home, container, false);

        statusText = root.findViewById(R.id.status_text);
        pcBuilderButton = root.findViewById(R.id.pc_builder_button);
        laptopFinderButton = root.findViewById(R.id.laptop_finder_button);

        // Load components in background
        loadComponents();

        // PC Builder button
        pcBuilderButton.setOnClickListener(v -> {
            if (cachedDatabase != null) {
                Bundle bundle = new Bundle();
                bundle.putString("buildType", "desktop");
                NavController navController = Navigation.findNavController(v);
                navController.navigate(R.id.nav_transform, bundle);
            } else {
                Toast.makeText(getContext(), "Loading components, please wait...",
                    Toast.LENGTH_SHORT).show();
            }
        });

        // Laptop Finder button
        laptopFinderButton.setOnClickListener(v -> {
            if (cachedDatabase != null) {
                Bundle bundle = new Bundle();
                bundle.putString("buildType", "laptop");
                NavController navController = Navigation.findNavController(v);
                navController.navigate(R.id.nav_transform, bundle);
            } else {
                Toast.makeText(getContext(), "Loading components, please wait...",
                    Toast.LENGTH_SHORT).show();
            }
        });

        return root;
    }

    private void loadComponents() {
        statusText.setText("Loading components...");
        pcBuilderButton.setEnabled(false);
        laptopFinderButton.setEnabled(false);

        ApiService apiService = new ApiService();
        apiService.fetchComponents(new ApiService.ComponentCallback() {
            @Override
            public void onSuccess(ComponentDatabase db) {
                cachedDatabase = db;
                int total = 0;
                if (db.getLaptops() != null) total += db.getLaptops().size();
                if (db.getCpus() != null) total += db.getCpus().size();
                if (db.getGpus() != null) total += db.getGpus().size();
                if (db.getMobos() != null) total += db.getMobos().size();
                if (db.getRam() != null) total += db.getRam().size();
                if (db.getStorage() != null) total += db.getStorage().size();
                if (db.getPsu() != null) total += db.getPsu().size();
                if (db.getCases() != null) total += db.getCases().size();

                statusText.setText("✅ Ready! " + total + " components loaded");
                pcBuilderButton.setEnabled(true);
                laptopFinderButton.setEnabled(true);
            }

            @Override
            public void onError(Exception e) {
                statusText.setText("❌ Error: " + e.getMessage() +
                    "\n\nMake sure:\n1. Python server is running (port 8000)\n2. Device can reach server");
                Toast.makeText(getContext(), "Failed to load components", Toast.LENGTH_LONG).show();
            }
        });
    }
}

