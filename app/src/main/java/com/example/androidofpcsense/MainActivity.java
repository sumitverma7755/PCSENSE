package com.example.androidofpcsense;

import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;

import androidx.appcompat.app.AppCompatActivity;
import androidx.navigation.NavController;
import androidx.navigation.fragment.NavHostFragment;
import androidx.navigation.ui.NavigationUI;

import com.google.android.material.bottomnavigation.BottomNavigationView;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        NavHostFragment navHostFragment = (NavHostFragment) getSupportFragmentManager()
                .findFragmentById(R.id.nav_host_fragment_content_main);
        if (navHostFragment == null) {
            return;
        }
        NavController navController = navHostFragment.getNavController();

        BottomNavigationView bottomNavigationView = findViewById(R.id.bottom_nav_view);
        if (bottomNavigationView != null) {
            NavigationUI.setupWithNavController(bottomNavigationView, navController);
            navController.addOnDestinationChangedListener((controller, destination, arguments) ->
                    animateBottomNavSelection(bottomNavigationView));
            animateBottomNavSelection(bottomNavigationView);
        }
    }

    private void animateBottomNavSelection(BottomNavigationView bottomNavigationView) {
        if (bottomNavigationView.getChildCount() == 0 || !(bottomNavigationView.getChildAt(0) instanceof ViewGroup)) {
            return;
        }

        ViewGroup menuView = (ViewGroup) bottomNavigationView.getChildAt(0);
        int itemCount = bottomNavigationView.getMenu().size();
        for (int i = 0; i < itemCount; i++) {
            if (i >= menuView.getChildCount()) {
                break;
            }
            View itemView = menuView.getChildAt(i);
            boolean checked = bottomNavigationView.getMenu().getItem(i).isChecked();
            float targetScale = checked ? 1.06f : 1.0f;
            itemView.animate()
                    .scaleX(targetScale)
                    .scaleY(targetScale)
                    .setDuration(180L)
                    .start();
        }
    }
}
