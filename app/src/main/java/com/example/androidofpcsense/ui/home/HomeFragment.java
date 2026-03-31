package com.example.androidofpcsense.ui.home;

import android.graphics.drawable.AnimationDrawable;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.navigation.NavController;
import androidx.navigation.Navigation;

import com.example.androidofpcsense.R;
import com.example.androidofpcsense.models.ComponentDatabase;
import com.example.androidofpcsense.ui.common.UiState;
import com.facebook.shimmer.ShimmerFrameLayout;
import com.google.android.material.transition.MaterialSharedAxis;

public class HomeFragment extends Fragment {

    private TextView statusText;
    private Button pcBuilderButton;
    private Button laptopFinderButton;
    private ShimmerFrameLayout loadingShimmer;
    private ComponentDatabase cachedDatabase;
    private AnimationDrawable animatedBackground;
    private HomeViewModel viewModel;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setEnterTransition(new MaterialSharedAxis(MaterialSharedAxis.X, true));
        setReturnTransition(new MaterialSharedAxis(MaterialSharedAxis.X, false));
    }

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        View root = inflater.inflate(R.layout.fragment_home, container, false);

        statusText = root.findViewById(R.id.status_text);
        pcBuilderButton = root.findViewById(R.id.pc_builder_button);
        laptopFinderButton = root.findViewById(R.id.laptop_finder_button);
        loadingShimmer = root.findViewById(R.id.home_loading_shimmer);

        View homeRoot = root.findViewById(R.id.home_root);
        if (homeRoot != null && homeRoot.getBackground() instanceof AnimationDrawable) {
            animatedBackground = (AnimationDrawable) homeRoot.getBackground();
            animatedBackground.setEnterFadeDuration(1000);
            animatedBackground.setExitFadeDuration(2000);
            animatedBackground.start();
        }

        viewModel = new ViewModelProvider(this).get(HomeViewModel.class);
        viewModel.getState().observe(getViewLifecycleOwner(), this::renderState);
        viewModel.loadComponents();

        pcBuilderButton.setOnClickListener(v -> {
            if (cachedDatabase != null) {
                Bundle bundle = new Bundle();
                bundle.putString("buildType", "desktop");
                NavController navController = Navigation.findNavController(v);
                navController.navigate(R.id.nav_transform, bundle);
            } else {
                Toast.makeText(getContext(), "Still loading components. Please wait.",
                        Toast.LENGTH_SHORT).show();
            }
        });

        laptopFinderButton.setOnClickListener(v -> {
            NavController navController = Navigation.findNavController(v);
            navController.navigate(R.id.nav_slideshow);
        });

        return root;
    }

    private void renderState(UiState<ComponentDatabase> state) {
        if (state == null) {
            return;
        }

        switch (state.getStatus()) {
            case LOADING:
                statusText.setText("Syncing component data...");
                pcBuilderButton.setEnabled(false);
                laptopFinderButton.setEnabled(true);
                loadingShimmer.setVisibility(View.VISIBLE);
                loadingShimmer.startShimmer();
                break;

            case SUCCESS:
                loadingShimmer.stopShimmer();
                loadingShimmer.setVisibility(View.GONE);
                cachedDatabase = state.getData();
                int total = totalComponents(cachedDatabase);
                String sourceTag = state.isFromCache() ? " (cached)" : "";
                statusText.setText("Ready. " + total + " components loaded" + sourceTag + ".");
                pcBuilderButton.setEnabled(cachedDatabase != null);
                laptopFinderButton.setEnabled(true);
                break;

            case ERROR:
                loadingShimmer.stopShimmer();
                loadingShimmer.setVisibility(View.GONE);
                String error = state.getMessage() == null ? "Unknown connection issue." : state.getMessage();
                statusText.setText("Connection issue: " + error);
                pcBuilderButton.setEnabled(false);
                laptopFinderButton.setEnabled(true);
                break;

            case IDLE:
            default:
                break;
        }
    }

    private int totalComponents(ComponentDatabase db) {
        if (db == null) {
            return 0;
        }
        int total = 0;
        if (db.getLaptops() != null) total += db.getLaptops().size();
        if (db.getCpus() != null) total += db.getCpus().size();
        if (db.getGpus() != null) total += db.getGpus().size();
        if (db.getMobos() != null) total += db.getMobos().size();
        if (db.getRam() != null) total += db.getRam().size();
        if (db.getStorage() != null) total += db.getStorage().size();
        if (db.getPsu() != null) total += db.getPsu().size();
        if (db.getCases() != null) total += db.getCases().size();
        return total;
    }

    @Override
    public void onResume() {
        super.onResume();
        if (animatedBackground != null && !animatedBackground.isRunning()) {
            animatedBackground.start();
        }
    }

    @Override
    public void onPause() {
        if (animatedBackground != null && animatedBackground.isRunning()) {
            animatedBackground.stop();
        }
        super.onPause();
    }
}
