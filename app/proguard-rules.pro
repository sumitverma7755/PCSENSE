# PCSensei release rules

# Keep Retrofit interfaces and HTTP annotations
-keepattributes Signature,RuntimeVisibleAnnotations,AnnotationDefault
-keep class retrofit2.** { *; }
-keep interface retrofit2.** { *; }
-dontwarn retrofit2.**

# Keep model classes used by Gson reflection
-keep class com.example.androidofpcsense.models.** { *; }
-keep class com.example.androidofpcsense.models.chat.** { *; }
-keep class com.google.gson.** { *; }

# Room generated classes
-keep class androidx.room.** { *; }
-dontwarn androidx.room.**

# OkHttp internals warnings
-dontwarn okhttp3.**
-dontwarn okio.**

# Sentry runtime
-keep class io.sentry.** { *; }
-dontwarn io.sentry.**
