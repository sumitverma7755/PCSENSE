package com.example.androidofpcsense.adapters;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.androidofpcsense.R;
import com.example.androidofpcsense.models.Component;
import com.example.androidofpcsense.models.DesktopBuild;
import com.example.androidofpcsense.models.Laptop;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class ComponentAdapter extends RecyclerView.Adapter<ComponentAdapter.ViewHolder> {

    private Context context;
    private List<Component> components;
    private int totalPrice;
    private boolean isLaptopList;

    // Constructor for laptop list
    public ComponentAdapter(Context context, List<? extends Component> components, int totalPrice, boolean isLaptopList) {
        this.context = context;
        this.components = new ArrayList<>(components);
        this.totalPrice = totalPrice;
        this.isLaptopList = isLaptopList;
    }

    // Constructor for desktop build
    public ComponentAdapter(Context context, DesktopBuild build, int budget, boolean isLaptopList) {
        this.context = context;
        this.components = new ArrayList<>();
        this.isLaptopList = isLaptopList;

        if (build.getCpu() != null) components.add(build.getCpu());
        if (build.getGpu() != null) components.add(build.getGpu());
        if (build.getMotherboard() != null) components.add(build.getMotherboard());
        if (build.getRam() != null) components.add(build.getRam());
        if (build.getStorage() != null) components.add(build.getStorage());
        if (build.getPsu() != null) components.add(build.getPsu());
        if (build.getCaseComponent() != null) components.add(build.getCaseComponent());

        this.totalPrice = build.getTotalPrice();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
            .inflate(R.layout.item_component, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Component component = components.get(position);

        // Set category
        if (isLaptopList) {
            Laptop laptop = (Laptop) component;
            holder.categoryText.setText("Laptop #" + (position + 1) + " - Score: " + laptop.getAiScore());
        } else {
            holder.categoryText.setText(component.getCategory());
        }

        // Set name and price
        holder.nameText.setText(component.getName());
        holder.priceText.setText(formatINR(component.getPrice()));

        // Set spec
        if (component.getSpec() != null && !component.getSpec().isEmpty()) {
            holder.specText.setText(component.getSpec());
            holder.specText.setVisibility(View.VISIBLE);
        } else {
            holder.specText.setVisibility(View.GONE);
        }

        // Shop links button
        holder.shopButton.setOnClickListener(v -> {
            if (component.getShopLinks() != null && !component.getShopLinks().isEmpty()) {
                showFirstShopLink(component.getShopLinks());
            }
        });
    }

    @Override
    public int getItemCount() {
        return components.size();
    }

    private String formatINR(int price) {
        return "₹" + String.format("%,d", price);
    }

    private void showFirstShopLink(Map<String, String> shopLinks) {
        // Open first available shop link
        for (Map.Entry<String, String> entry : shopLinks.entrySet()) {
            if (entry.getValue() != null && !entry.getValue().isEmpty()) {
                Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(entry.getValue()));
                context.startActivity(browserIntent);
                break;
            }
        }
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView categoryText, nameText, priceText, specText;
        Button shopButton;

        ViewHolder(View view) {
            super(view);
            categoryText = view.findViewById(R.id.category_text);
            nameText = view.findViewById(R.id.component_name);
            priceText = view.findViewById(R.id.component_price);
            specText = view.findViewById(R.id.component_spec);
            shopButton = view.findViewById(R.id.shop_button);
        }
    }
}

