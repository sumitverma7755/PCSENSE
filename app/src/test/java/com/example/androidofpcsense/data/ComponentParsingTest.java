package com.example.androidofpcsense.data;

import com.example.androidofpcsense.models.ComponentDatabase;
import com.google.gson.Gson;

import org.junit.Test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

public class ComponentParsingTest {

    @Test
    public void gson_shouldParseComponentDatabaseShape() {
        String json = "{\"laptops\":[],\"cpus\":[],\"gpus\":[],\"mobos\":[],\"ram\":[],\"storage\":[],\"psu\":[],\"cases\":[]}";

        ComponentDatabase database = new Gson().fromJson(json, ComponentDatabase.class);

        assertNotNull(database);
        assertNotNull(database.getLaptops());
        assertNotNull(database.getCpus());
        assertNotNull(database.getGpus());
        assertEquals(0, database.getLaptops().size());
    }
}
