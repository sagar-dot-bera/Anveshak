package com.anveshak.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.HttpOptions;

@Configuration
public class GeminiConfig {

    @Value("${google-gemini.api-key}")
    private String apiKey;

    // Without this, the SDK's HTTP client has no timeout and a slow/stalled
    // Gemini response hangs the request thread indefinitely instead of
    // failing into PaperSummaryService's fallback summary path.
    private static final int REQUEST_TIMEOUT_MILLIS = 60_000;

    @Bean
    public Client geminiClient() {
        return Client.builder()
                .apiKey(apiKey)
                .httpOptions(HttpOptions.builder()
                        .timeout(REQUEST_TIMEOUT_MILLIS)
                        .build())
                .build();
    }

}