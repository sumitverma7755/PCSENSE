package com.example.androidofpcsense.data.local;

import android.content.Context;

import androidx.room.Database;
import androidx.room.Room;
import androidx.room.RoomDatabase;

@Database(entities = {ComponentCacheEntity.class}, version = 1, exportSchema = false)
public abstract class PCSenseiDatabase extends RoomDatabase {

    private static volatile PCSenseiDatabase instance;

    public abstract ComponentCacheDao componentCacheDao();

    public static PCSenseiDatabase getInstance(Context context) {
        if (instance == null) {
            synchronized (PCSenseiDatabase.class) {
                if (instance == null) {
                    instance = Room.databaseBuilder(
                                    context.getApplicationContext(),
                                    PCSenseiDatabase.class,
                                    "pcsensei.db"
                            )
                            .fallbackToDestructiveMigration()
                            .build();
                }
            }
        }
        return instance;
    }
}
