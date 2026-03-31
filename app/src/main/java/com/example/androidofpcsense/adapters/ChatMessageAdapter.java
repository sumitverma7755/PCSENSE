package com.example.androidofpcsense.adapters;

import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.androidofpcsense.R;
import com.example.androidofpcsense.models.chat.ChatMessage;

import java.util.ArrayList;
import java.util.List;

public class ChatMessageAdapter extends RecyclerView.Adapter<ChatMessageAdapter.ChatMessageViewHolder> {

    private final List<ChatMessage> messages = new ArrayList<>();

    public void submitList(List<ChatMessage> next) {
        messages.clear();
        if (next != null) {
            messages.addAll(next);
        }
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ChatMessageViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_chat_message, parent, false);
        return new ChatMessageViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ChatMessageViewHolder holder, int position) {
        ChatMessage message = messages.get(position);
        boolean isUser = "user".equalsIgnoreCase(message.getRole());

        holder.messageText.setText(message.getContent());
        holder.messageContainer.setGravity(isUser ? Gravity.END : Gravity.START);
        holder.messageText.setBackgroundResource(isUser ? R.drawable.bg_chat_user : R.drawable.bg_chat_assistant);
        holder.messageText.setTextColor(holder.messageText.getContext().getColor(
                isUser ? android.R.color.white : R.color.text_on_dark
        ));

        LinearLayout.LayoutParams params = (LinearLayout.LayoutParams) holder.messageText.getLayoutParams();
        if (params != null) {
            params.gravity = isUser ? Gravity.END : Gravity.START;
            holder.messageText.setLayoutParams(params);
        }
    }

    @Override
    public int getItemCount() {
        return messages.size();
    }

    static class ChatMessageViewHolder extends RecyclerView.ViewHolder {

        private final LinearLayout messageContainer;
        private final TextView messageText;

        ChatMessageViewHolder(@NonNull View itemView) {
            super(itemView);
            messageContainer = itemView.findViewById(R.id.message_container);
            messageText = itemView.findViewById(R.id.message_text);
        }
    }
}
