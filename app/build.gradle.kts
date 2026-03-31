plugins {
    alias(libs.plugins.android.application)
}

android {
    namespace = "com.example.androidofpcsense"
    compileSdk {
        version = release(36)
    }

    defaultConfig {
        applicationId = "com.example.androidofpcsense"
        minSdk = 24
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        debug {
            buildConfigField("String", "PCSENSEI_DATA_URL", "\"http://10.0.2.2:8000/data/components.json\"")
            buildConfigField("String", "PCSENSEI_API_URL", "\"http://10.0.2.2:3001/api/components\"")
            buildConfigField("String", "PCSENSEI_CHAT_URL", "\"http://10.0.2.2:3001\"")
            buildConfigField("String", "SENTRY_DSN", "\"\"")
        }
        release {
            isMinifyEnabled = true
            buildConfigField("String", "PCSENSEI_DATA_URL", "\"http://10.0.2.2:8000/data/components.json\"")
            buildConfigField("String", "PCSENSEI_API_URL", "\"http://10.0.2.2:3001/api/components\"")
            buildConfigField("String", "PCSENSEI_CHAT_URL", "\"http://10.0.2.2:3001\"")
            buildConfigField("String", "SENTRY_DSN", "\"${System.getenv("PCSENSEI_SENTRY_DSN") ?: ""}\"")
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            val releaseSigning = signingConfigs.findByName("release")
            if (releaseSigning?.storeFile != null) {
                signingConfig = releaseSigning
            } else {
                signingConfig = signingConfigs.getByName("debug")
            }
        }
    }
    signingConfigs {
        create("release") {
            val keystorePath = System.getenv("PCSENSEI_KEYSTORE_PATH")
            val keystorePassword = System.getenv("PCSENSEI_KEYSTORE_PASSWORD")
            val keyAlias = System.getenv("PCSENSEI_KEY_ALIAS")
            val keyPassword = System.getenv("PCSENSEI_KEY_PASSWORD")
            if (!keystorePath.isNullOrBlank()) {
                storeFile = file(keystorePath)
                storePassword = keystorePassword ?: ""
                this.keyAlias = keyAlias ?: ""
                this.keyPassword = keyPassword ?: ""
            }
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    buildFeatures {
        buildConfig = true
        viewBinding = true
    }
}

dependencies {
    implementation(libs.appcompat)
    implementation(libs.material)
    implementation(libs.recyclerview)
    implementation(libs.constraintlayout)
    implementation(libs.lifecycle.livedata.ktx)
    implementation(libs.lifecycle.viewmodel.ktx)
    implementation(libs.navigation.fragment)
    implementation(libs.navigation.ui)
    implementation(libs.retrofit)
    implementation(libs.retrofit.gson)
    implementation(libs.okhttp)
    implementation(libs.okhttp.logging)
    implementation(libs.room.runtime)
    implementation(libs.shimmer)
    implementation(libs.sentry)

    // PCSensei dependencies
    implementation("com.google.code.gson:gson:2.10.1")
    implementation("androidx.cardview:cardview:1.0.0")
    annotationProcessor(libs.room.compiler)

    testImplementation(libs.junit)
    testImplementation(libs.core.testing)
    testImplementation(libs.mockwebserver)
    androidTestImplementation(libs.ext.junit)
    androidTestImplementation(libs.espresso.core)
    androidTestImplementation(libs.androidx.test.core)
    androidTestImplementation(libs.androidx.test.rules)
}
