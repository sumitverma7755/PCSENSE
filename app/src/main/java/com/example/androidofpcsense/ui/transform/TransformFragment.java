package com.example.androidofpcsense.ui.transform;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
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
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.androidofpcsense.R;
import com.example.androidofpcsense.adapters.ComponentAdapter;
import com.example.androidofpcsense.models.ComponentDatabase;
import com.example.androidofpcsense.models.DesktopBuild;
import com.example.androidofpcsense.models.Laptop;
import com.example.androidofpcsense.services.DesktopBuildEngine;
import com.example.androidofpcsense.services.RecommendationEngine;
import com.example.androidofpcsense.ui.common.UiState;
import com.facebook.shimmer.ShimmerFrameLayout;
import com.google.android.material.transition.MaterialSharedAxis;

import java.util.List;

public class TransformFragment extends Fragment {

    private EditText budgetInput;
    private Spinner usageSpinner;
    private Button generateButton;
    private ProgressBar loadingBar;
    private RecyclerView resultsRecyclerView;
    private TextView resultsTitle;
    private TextView emptyStateText;
    private ShimmerFrameLayout builderShimmer;

    private String buildType = "desktop";
    private ComponentDatabase cachedDatabase;
    private TransformViewModel viewModel;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setEnterTransition(new MaterialSharedAxis(MaterialSharedAxis.X, true));
        setReturnTransition(new MaterialSharedAxis(MaterialSharedAxis.X, false));
    }

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        View root = inflater.inflate(R.layout.fragment_transform, container, false);

        if (getArguments() != null) {
            buildType = getArguments().getString("buildType", "desktop");
        }

        budgetInput = root.findViewById(R.id.budget_input);
        usageSpinner = root.findViewById(R.id.usage_spinner);
        generateButton = root.findViewById(R.id.generate_button);
        loadingBar = root.findViewById(R.id.loading_bar);
        resultsRecyclerView = root.findViewById(R.id.results_recycler);
        resultsTitle = root.findViewById(R.id.results_title);
        emptyStateText = root.findViewById(R.id.empty_state_text);
        builderShimmer = root.findViewById(R.id.builder_loading_shimmer);

        setupUsageSpinner();
        resultsRecyclerView.setLayoutManager(new LinearLayoutManager(getContext()));

        viewModel = new ViewModelProvider(this).get(TransformViewModel.class);
        viewModel.getComponentsState().observe(getViewLifecycleOwner(), this::renderComponentsState);
        viewModel.loadComponents();

        generateButton.setOnClickListener(v -> generateRecommendation());

        return root;
    }

    private void setupUsageSpinner() {
        ArrayAdapter<CharSequence> adapter = ArrayAdapter.createFromResource(
                getContext(),
                R.array.usage_types,
                android.R.layout.simple_spinner_item
        );
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        usageSpinner.setAdapter(adapter);
    }

    private void renderComponentsState(UiState<ComponentDatabase> state) {
        if (state == null) {
            return;
        }

        switch (state.getStatus()) {
            case LOADING:
                generateButton.setEnabled(false);
                showSkeleton(true);
                showEmpty("Loading component catalog...");
                break;

            case SUCCESS:
                cachedDatabase = state.getData();
                generateButton.setEnabled(cachedDatabase != null);
                showSkeleton(false);
                hideEmpty();
                if (state.isFromCache()) {
                    Toast.makeText(getContext(), "Using cached data", Toast.LENGTH_SHORT).show();
                }
                break;

            case ERROR:
                generateButton.setEnabled(false);
                showSkeleton(false);
                showEmpty(state.getMessage() == null
                        ? "Unable to load components."
                        : state.getMessage());
                break;

            case IDLE:
            default:
                break;
        }
    }

    private void generateRecommendation() {
        String budgetStr = budgetInput.getText().toString().trim();
        if (budgetStr.isEmpty()) {
            Toast.makeText(getContext(), "Please enter a budget", Toast.LENGTH_SHORT).show();
            return;
        }

        if (cachedDatabase == null) {
            showEmpty("Component data still loading. Please wait and try again.");
            viewModel.loadComponents();
            return;
        }

        int budget;
        try {
            budget = Integer.parseInt(budgetStr);
        } catch (NumberFormatException numberFormatException) {
            Toast.makeText(getContext(), "Invalid budget amount", Toast.LENGTH_SHORT).show();
            return;
        }

        String usage = usageSpinner.getSelectedItem().toString();
        showGenerating(true);

        new Thread(() -> {
            if ("laptop".equals(buildType)) {
                generateLaptopRecommendations(cachedDatabase, budget, usage);
            } else {
                generateDesktopBuild(cachedDatabase, budget, usage);
            }
            new Handler(Looper.getMainLooper()).post(() -> showGenerating(false));
        }).start();
    }

    private void generateLaptopRecommendations(ComponentDatabase db, int budget, String usage) {
        RecommendationEngine engine = new RecommendationEngine();
        List<Laptop> laptops = engine.selectLaptops(db, budget, usage);

        new Handler(Looper.getMainLooper()).post(() -> {
            if (laptops == null || laptops.isEmpty()) {
                showEmpty("No laptops found for this budget and usage.");
                resultsRecyclerView.setVisibility(View.GONE);
                resultsTitle.setVisibility(View.GONE);
                return;
            }

            hideEmpty();
            resultsTitle.setText("Top " + laptops.size() + " Laptop Recommendations");
            resultsTitle.setVisibility(View.VISIBLE);

            ComponentAdapter adapter = new ComponentAdapter(getContext(), laptops, 0, true);
            resultsRecyclerView.setAdapter(adapter);
            resultsRecyclerView.setVisibility(View.VISIBLE);
        });
    }

    private void generateDesktopBuild(ComponentDatabase db, int budget, String usage) {
        DesktopBuildEngine engine = new DesktopBuildEngine();
        DesktopBuild build = engine.buildPC(db, budget, usage, "any", "any");

        new Handler(Looper.getMainLooper()).post(() -> {
            if (build == null || build.getCpu() == null) {
                showEmpty("Unable to create a build for this budget.");
                resultsRecyclerView.setVisibility(View.GONE);
                resultsTitle.setVisibility(View.GONE);
                return;
            }

            hideEmpty();
            resultsTitle.setText("Recommended Desktop Build - Total: Rs. "
                    + String.format("%,d", build.getTotalPrice()));
            resultsTitle.setVisibility(View.VISIBLE);

            ComponentAdapter adapter = new ComponentAdapter(getContext(), build, budget, false);
            resultsRecyclerView.setAdapter(adapter);
            resultsRecyclerView.setVisibility(View.VISIBLE);
        });
    }

    private void showGenerating(boolean generating) {
        loadingBar.setVisibility(generating ? View.VISIBLE : View.GONE);
        generateButton.setEnabled(!generating && cachedDatabase != null);
        if (generating) {
            showSkeleton(true);
        } else {
            showSkeleton(false);
        }
    }

    private void showSkeleton(boolean show) {
        builderShimmer.setVisibility(show ? View.VISIBLE : View.GONE);
        if (show) {
            builderShimmer.startShimmer();
        } else {
            builderShimmer.stopShimmer();
        }
    }

    private void showEmpty(String message) {
        emptyStateText.setText(message);
        emptyStateText.setVisibility(View.VISIBLE);
    }

    private void hideEmpty() {
        emptyStateText.setVisibility(View.GONE);
    }
}
