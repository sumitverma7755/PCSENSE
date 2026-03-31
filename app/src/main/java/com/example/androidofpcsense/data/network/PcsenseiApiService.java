package com.example.androidofpcsense.data.network;

import com.example.androidofpcsense.models.ComponentDatabase;
import com.example.androidofpcsense.models.chat.ChatMessageRequest;
import com.example.androidofpcsense.models.chat.ChatMessageResponse;
import com.example.androidofpcsense.models.chat.ChatSessionRequest;
import com.example.androidofpcsense.models.chat.ChatSessionResponse;
import com.google.gson.JsonObject;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Url;

public interface PcsenseiApiService {

    @GET
    Call<ComponentDatabase> fetchComponents(@Url String endpoint);

    @GET
    Call<JsonObject> fetchHealth(@Url String endpoint);

    @POST
    Call<ChatSessionResponse> createSession(@Url String endpoint, @Body ChatSessionRequest body);

    @POST
    Call<ChatMessageResponse> sendMessage(@Url String endpoint, @Body ChatMessageRequest body);
}
