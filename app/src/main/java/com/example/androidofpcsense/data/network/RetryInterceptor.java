package com.example.androidofpcsense.data.network;

import java.io.IOException;

import okhttp3.Interceptor;
import okhttp3.Response;

public class RetryInterceptor implements Interceptor {

    private final int maxRetries;
    private final long baseBackoffMs;

    public RetryInterceptor(int maxRetries, long baseBackoffMs) {
        this.maxRetries = maxRetries;
        this.baseBackoffMs = baseBackoffMs;
    }

    @Override
    public Response intercept(Chain chain) throws IOException {
        IOException lastException = null;

        for (int attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                Response response = chain.proceed(chain.request());
                if (!shouldRetry(response.code()) || attempt == maxRetries) {
                    return response;
                }
                response.close();
            } catch (IOException ioException) {
                lastException = ioException;
                if (attempt == maxRetries) {
                    throw ioException;
                }
            }

            try {
                Thread.sleep(backoffForAttempt(attempt));
            } catch (InterruptedException interruptedException) {
                Thread.currentThread().interrupt();
                throw new IOException("Retry interrupted", interruptedException);
            }
        }

        throw lastException != null ? lastException : new IOException("Request failed after retries");
    }

    private boolean shouldRetry(int httpCode) {
        return httpCode == 408 || httpCode == 429 || (httpCode >= 500 && httpCode <= 599);
    }

    private long backoffForAttempt(int attempt) {
        return baseBackoffMs * (1L << attempt);
    }
}
