package com.example.androidofpcsense.data.local;

import androidx.annotation.NonNull;
import androidx.room.ColumnInfo;
import androidx.room.Entity;
import androidx.room.PrimaryKey;

@Entity(tableName = "component_cache")
public class ComponentCacheEntity {

    @PrimaryKey
    @NonNull
    public String id;

    @ColumnInfo(name = "payload_json")
    public String payloadJson;

    @ColumnInfo(name = "updated_at")
    public long updatedAt;

    public ComponentCacheEntity(@NonNull String id, String payloadJson, long updatedAt) {
        this.id = id;
        this.payloadJson = payloadJson;
        this.updatedAt = updatedAt;
    }
}
