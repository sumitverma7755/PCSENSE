package com.example.androidofpcsense;

import android.app.Application;

import io.sentry.Sentry;
import io.sentry.android.core.SentryAndroid;
import io.sentry.android.core.SentryAndroidOptions;

public class PCSenseiApplication extends Application {

    @Override
    public void onCreate() {
        super.onCreate();

        if (BuildConfig.SENTRY_DSN != null && !BuildConfig.SENTRY_DSN.trim().isEmpty()) {
            SentryAndroid.init(this, options -> {
                options.setDsn(BuildConfig.SENTRY_DSN);
                options.setTracesSampleRate(0.2);
                options.setEnableAutoSessionTracking(true);
            });
        } else {
            Sentry.init(options -> options.setEnabled(false));
        }
    }
}
