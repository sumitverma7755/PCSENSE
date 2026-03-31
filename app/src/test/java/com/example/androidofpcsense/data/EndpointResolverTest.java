package com.example.androidofpcsense.data;

import org.junit.Test;

import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class EndpointResolverTest {

    @Test
    public void componentCandidates_shouldPrioritizeConfiguredUrls() {
        List<String> urls = EndpointResolver.componentCandidates(
                "http://example.com/api/components",
                "http://example.com/data/components.json"
        );

        assertFalse(urls.isEmpty());
        assertEquals("http://example.com/api/components", urls.get(0));
        assertEquals("http://example.com/data/components.json", urls.get(1));
        assertTrue(urls.contains("http://10.0.2.2:3001/api/components"));
        assertTrue(urls.contains("http://10.0.2.2:8000/data/components.json"));
    }

    @Test
    public void normalizeBaseUrl_shouldTrimTrailingSlashes() {
        String normalized = EndpointResolver.normalizeBaseUrl("http://10.0.2.2:3001///");
        assertEquals("http://10.0.2.2:3001", normalized);
    }
}
