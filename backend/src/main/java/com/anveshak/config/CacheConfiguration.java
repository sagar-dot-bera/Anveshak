package com.anveshak.config;

import java.time.Duration;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.github.benmanes.caffeine.cache.Caffeine;

/**
 * In-process Caffeine caches. Single backend instance, so no Redis needed;
 * revisit if the API is ever scaled horizontally.
 */
@Configuration
@EnableCaching
public class CacheConfiguration {

    public static final String PAPER_COMPARISONS = "paperComparisons";
    public static final String QUERY_EMBEDDINGS = "queryEmbeddings";

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        // Keyed by paper ids + summary content, so edits naturally miss; the
        // TTL only bounds memory for comparisons nobody re-runs.
        cacheManager.registerCustomCache(PAPER_COMPARISONS, Caffeine.newBuilder()
                .maximumSize(500)
                .expireAfterWrite(Duration.ofHours(24))
                .build());
        // Same text always embeds to the same vector, so this never goes stale.
        cacheManager.registerCustomCache(QUERY_EMBEDDINGS, Caffeine.newBuilder()
                .maximumSize(2_000)
                .expireAfterAccess(Duration.ofHours(6))
                .build());
        return cacheManager;
    }
}
