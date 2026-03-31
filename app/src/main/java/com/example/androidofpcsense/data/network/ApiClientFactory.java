package com.example.androidofpcsense.data.network;

import com.example.androidofpcsense.BuildConfig;

import java.util.concurrent.TimeUnit;

import okhttp3.OkHttpClient;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public final class ApiClientFactory {

    private static volatile PcsenseiApiService apiService;

    private ApiClientFactory() {
    }

    public static PcsenseiApiService getApiService() {
        if (apiService == null) {
            synchronized (ApiClientFactory.class) {
                if (apiService == null) {
                    apiService = createApiService();
                }
            }
        }
        return apiService;
    }

    private static PcsenseiApiService createApiService() {
        HttpLoggingInterceptor loggingInterceptor = new HttpLoggingInterceptor();
        loggingInterceptor.setLevel(BuildConfig.DEBUG
                ? HttpLoggingInterceptor.Level.BASIC
                : HttpLoggingInterceptor.Level.NONE);

        OkHttpClient httpClient = new OkHttpClient.Builder()
                .connectTimeout(8, TimeUnit.SECONDS)
                .readTimeout(12, TimeUnit.SECONDS)
                .writeTimeout(12, TimeUnit.SECONDS)
                .retryOnConnectionFailure(true)
                .addInterceptor(new RetryInterceptor(2, 150))
                .addInterceptor(loggingInterceptor)
                .build();

        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl("http://localhost/")
                .client(httpClient)
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        return retrofit.create(PcsenseiApiService.class);
    }
}
