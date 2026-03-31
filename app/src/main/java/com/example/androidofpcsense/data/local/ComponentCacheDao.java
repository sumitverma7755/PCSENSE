package com.example.androidofpcsense.data.local;

import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.OnConflictStrategy;
import androidx.room.Query;

@Dao
public interface ComponentCacheDao {

    @Query("SELECT * FROM component_cache WHERE id = :id LIMIT 1")
    ComponentCacheEntity findById(String id);

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void upsert(ComponentCacheEntity entity);
}
