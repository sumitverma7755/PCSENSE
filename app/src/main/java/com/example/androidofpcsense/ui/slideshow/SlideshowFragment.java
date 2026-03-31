package com.example.androidofpcsense.ui.slideshow;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.navigation.NavController;
import androidx.navigation.Navigation;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.androidofpcsense.R;
import com.example.androidofpcsense.adapters.ChatMessageAdapter;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.transition.MaterialSharedAxis;

public class SlideshowFragment extends Fragment {

    private SlideshowViewModel viewModel;
    private ChatMessageAdapter chatAdapter;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setEnterTransition(new MaterialSharedAxis(MaterialSharedAxis.X, true));
        setReturnTransition(new MaterialSharedAxis(MaterialSharedAxis.X, false));
    }

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        View root = inflater.inflate(R.layout.fragment_slideshow, container, false);

        RecyclerView chatRecycler = root.findViewById(R.id.chat_recycler);
        TextInputEditText chatInput = root.findViewById(R.id.chat_input);
        MaterialButton sendButton = root.findViewById(R.id.chat_send_button);
        MaterialButton openSettingsButton = root.findViewById(R.id.open_settings_button);
        TextView statusText = root.findViewById(R.id.chat_status_text);

        chatAdapter = new ChatMessageAdapter();
        chatRecycler.setLayoutManager(new LinearLayoutManager(getContext()));
        chatRecycler.setAdapter(chatAdapter);

        viewModel = new ViewModelProvider(this).get(SlideshowViewModel.class);
        viewModel.getMessages().observe(getViewLifecycleOwner(), messages -> {
            chatAdapter.submitList(messages);
            if (messages != null && !messages.isEmpty()) {
                chatRecycler.smoothScrollToPosition(messages.size() - 1);
            }
        });
        viewModel.getStatus().observe(getViewLifecycleOwner(), statusText::setText);
        viewModel.getSending().observe(getViewLifecycleOwner(), sending -> {
            boolean isSending = Boolean.TRUE.equals(sending);
            sendButton.setEnabled(!isSending);
        });

        sendButton.setOnClickListener(v -> {
            String text = chatInput.getText() == null ? "" : chatInput.getText().toString();
            viewModel.send(text);
            chatInput.setText("");
        });

        openSettingsButton.setOnClickListener(v -> {
            NavController navController = Navigation.findNavController(v);
            navController.navigate(R.id.nav_settings);
        });

        return root;
    }
}
