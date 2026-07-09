package com.anveshak.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.anveshak.config.GeminiConfig;
import com.anveshak.model.PaperChunk;
import com.anveshak.model.PaperSummary;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;

@Service
public class GeminiService {

    private final Client geminiClient;
    private final PromptService promptService;

    public GeminiService(GeminiConfig geminiConfig, PromptService promptService) {
        this.geminiClient = geminiConfig.geminiClient();
        this.promptService = promptService;
    }

    public String generateResponse(String message, List<PaperChunk> chunks, String role) {
        String prompt = String.join("\n\n", promptService.buildPrompts(message, chunks, role));
        return generateAnswer(prompt);
    }

    public String generateAnswer(String prompt) {

        GenerateContentResponse response = geminiClient.models.generateContent(
                "gemini-2.5-flash",
                prompt,
                null);

        return response.text();
    }

    public String generateComparisonPrompt(List<PaperSummary> paperSummaries) {
        String prompt = promptService.buildComparisonPrompt(paperSummaries);
        return generateAnswer(prompt);
    }

}
