package com.example.androidofpcsense.ui.transform;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.navigation.NavController;
import androidx.navigation.Navigation;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.androidofpcsense.R;
import com.example.androidofpcsense.models.ComponentDatabase;
import com.example.androidofpcsense.models.DesktopBuild;
import com.example.androidofpcsense.models.Laptop;
import com.example.androidofpcsense.services.ApiService;
import com.example.androidofpcsense.services.DesktopBuildEngine;
import com.example.androidofpcsense.services.RecommendationEngine;
import com.example.androidofpcsense.adapters.ComponentAdapter;

import java.util.List;

/**
 * PC Builder / Laptop Finder Fragment
 */
public class TransformFragment extends Fragment {

    private EditText budgetInput;
    private Spinner usageSpinner;
    private Button generateButton;
    private ProgressBar loadingBar;
    private RecyclerView resultsRecyclerView;
    private TextView resultsTitle;
    private String buildType = "desktop";

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        View root = inflater.inflate(R.layout.fragment_transform, container, false);

        // Get build type from arguments
        if (getArguments() != null) {
            buildType = getArguments().getString("buildType", "desktop");
        }

        budgetInput = root.findViewById(R.id.budget_input);
        usageSpinner = root.findViewById(R.id.usage_spinner);
        generateButton = root.findViewById(R.id.generate_button);
        loadingBar = root.findViewById(R.id.loading_bar);
        resultsRecyclerView = root.findViewById(R.id.results_recycler);
        resultsTitle = root.findViewById(R.id.results_title);

        // Setup usage spinner
        ArrayAdapter<CharSequence> adapter = ArrayAdapter.createFromResource(
            getContext(),
            R.array.usage_types,
            android.R.layout.simple_spinner_item
        );
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        usageSpinner.setAdapter(adapter);

        // Setup RecyclerView
        resultsRecyclerView.setLayoutManager(new LinearLayoutManager(getContext()));

        // Generate button
        generateButton.setOnClickListener(v -> generateRecommendation());

        return root;
    }

    private void generateRecommendation() {
        String budgetStr = budgetInput.getText().toString().trim();

        if (budgetStr.isEmpty()) {
            Toast.makeText(getContext(), "Please enter a budget", Toast.LENGTH_SHORT).show();
            return;
        }

        int budget = Integer.parseInt(budgetStr);
        String usage = usageSpinner.getSelectedItem().toString();

        loadingBar.setVisibility(View.VISIBLE);
        generateButton.setEnabled(false);
        resultsRecyclerView.setVisibility(View.GONE);

        ApiService apiService = new ApiService();
        apiService.fetchComponents(new ApiService.ComponentCallback() {
            @Override
            public void onSuccess(ComponentDatabase db) {
                loadingBar.setVisibility(View.GONE);
                generateButton.setEnabled(true);

                if (buildType.equals("laptop")) {
                    generateLaptopRecommendations(db, budget, usage);
                } else {
                    generateDesktopBuild(db, budget, usage);
                }
            }

            @Override
            public void onError(Exception e) {
                loadingBar.setVisibility(View.GONE);
                generateButton.setEnabled(true);
                Toast.makeText(getContext(), "Error: " + e.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }

    private void generateLaptopRecommendations(ComponentDatabase db, int budget, String usage) {
        RecommendationEngine engine = new RecommendationEngine();
        List<Laptop> laptops = engine.selectLaptops(db, budget, usage);

        if (laptops.isEmpty()) {
            Toast.makeText(getContext(), "No laptops found for this budget", Toast.LENGTH_SHORT).show();
            return;
        }

        resultsTitle.setText("Top " + laptops.size() + " Laptop Recommendations");
        resultsTitle.setVisibility(View.VISIBLE);

        ComponentAdapter adapter = new ComponentAdapter(getContext(), laptops, 0, true);
        resultsRecyclerView.setAdapter(adapter);
        resultsRecyclerView.setVisibility(View.VISIBLE);
    }

    private void generateDesktopBuild(ComponentDatabase db, int budget, String usage) {
        DesktopBuildEngine engine = new DesktopBuildEngine();
        DesktopBuild build = engine.buildPC(db, budget, usage, "any", "any");

        if (build.getCpu() == null) {
            Toast.makeText(getContext(), "Unable to create build for this budget", Toast.LENGTH_SHORT).show();
            return;
        }

        resultsTitle.setText("Recommended Desktop Build - Total: ₹" +
            String.format("%,d", build.getTotalPrice()));
        resultsTitle.setVisibility(View.VISIBLE);

        ComponentAdapter adapter = new ComponentAdapter(getContext(), build, budget, false);
        resultsRecyclerView.setAdapter(adapter);
        resultsRecyclerView.setVisibility(View.VISIBLE);
    }
}