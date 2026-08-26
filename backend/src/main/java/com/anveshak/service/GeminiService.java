package com.anveshak.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.anveshak.config.GeminiConfig;
import com.anveshak.model.PaperChunk;
import com.anveshak.model.PaperSummary;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Schema;
import com.google.genai.types.Type;

import jakarta.annotation.Nullable;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class GeminiService {

        private final Client geminiClient;
        private final PromptService promptService;

        public GeminiService(GeminiConfig geminiConfig, PromptService promptService) {
                this.geminiClient = geminiConfig.geminiClient();
                this.promptService = promptService;
        }

        public String generateResponse(String message, List<PaperChunk> chunks, String role) {
                String prompt = String.join("\n\n", promptService.buildPrompts(message, chunks, role));
                return generateAnswer(prompt, null);
        }

        public String generateAnswer(String prompt, @Nullable GenerateContentConfig config) {
                log.info("Generating answer for prompt: {}", prompt);
                GenerateContentResponse response = geminiClient.models.generateContent(
                                "gemini-3.5-flash",
                                prompt,
                                config);
                log.info("=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*");
                log.info("Generated answer: {}", response.text());
                log.info("=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*");
                return response.text();
        }

        public String generateComparisonPrompt(List<PaperSummary> paperSummaries) {
                String prompt = promptService.buildComparisonPrompt(paperSummaries);
                return generateAnswer(prompt, null);
        }

        public String generateAnwerInJSON(String prompt, Schema responseSchema) {
                log.info("Generating answer in JSON for prompt: {}", prompt);

                GenerateContentConfig summaryConfig = GenerateContentConfig.builder()
                                .responseMimeType("application/json")
                                .responseSchema(responseSchema)
                                .build();

                return generateAnswer(prompt, summaryConfig);

        }

        Schema buildSummarySchema() {
                Schema summarySchema = Schema.builder()
                                .type(Type.Known.OBJECT)
                                .properties(Map.of(
                                                "objective", Schema.builder().type(Type.Known.STRING).build(),
                                                "methodology", Schema.builder().type(Type.Known.STRING).build(),
                                                "dataset", Schema.builder().type(Type.Known.STRING).build(),
                                                "keyFindings", Schema.builder().type(Type.Known.STRING).build(),
                                                "limitations", Schema.builder().type(Type.Known.STRING).build(),
                                                "futureWork", Schema.builder().type(Type.Known.STRING).build()))
                                .required(List.of(
                                                "objective",
                                                "methodology",
                                                "dataset",
                                                "keyFindings",
                                                "limitations",
                                                "futureWork"))
                                .build();

                return summarySchema;
        }

        Schema buildComparisonSchema() {
                Schema comparisonSchema = Schema.builder()
                                .type(Type.Known.OBJECT)
                                .properties(Map.of(
                                                "papers",
                                                Schema.builder()
                                                                .type(Type.Known.ARRAY)
                                                                .items(
                                                                                Schema.builder()
                                                                                                .type(Type.Known.OBJECT)
                                                                                                .properties(Map.of(
                                                                                                                "title",
                                                                                                                Schema.builder().type(
                                                                                                                                Type.Known.STRING)
                                                                                                                                .build(),
                                                                                                                "objective",
                                                                                                                Schema.builder().type(
                                                                                                                                Type.Known.STRING)
                                                                                                                                .build(),
                                                                                                                "methodology",
                                                                                                                Schema.builder().type(
                                                                                                                                Type.Known.STRING)
                                                                                                                                .build(),
                                                                                                                "dataset",
                                                                                                                Schema.builder().type(
                                                                                                                                Type.Known.STRING)
                                                                                                                                .build(),
                                                                                                                "results",
                                                                                                                Schema.builder().type(
                                                                                                                                Type.Known.STRING)
                                                                                                                                .build(),
                                                                                                                "strengths",
                                                                                                                Schema.builder().type(
                                                                                                                                Type.Known.STRING)
                                                                                                                                .build(),
                                                                                                                "weaknesses",
                                                                                                                Schema.builder().type(
                                                                                                                                Type.Known.STRING)
                                                                                                                                .build(),
                                                                                                                "futureWork",
                                                                                                                Schema.builder().type(
                                                                                                                                Type.Known.STRING)
                                                                                                                                .build()))
                                                                                                .required(List.of(
                                                                                                                "title",
                                                                                                                "objective",
                                                                                                                "methodology",
                                                                                                                "dataset",
                                                                                                                "results",
                                                                                                                "strengths",
                                                                                                                "weaknesses",
                                                                                                                "futureWork"))
                                                                                                .build())
                                                                .build()))
                                .required(List.of("papers"))
                                .build();

                return comparisonSchema;
        }

        public Schema roadmapSchema() {

                Schema stageSchema = Schema.builder()
                                .type(Type.Known.OBJECT)
                                .properties(Map.of(
                                                "order", Schema.builder()
                                                                .type(Type.Known.INTEGER)
                                                                .build(),
                                                "title", Schema.builder()
                                                                .type(Type.Known.STRING)
                                                                .build(),
                                                "description", Schema.builder()
                                                                .type(Type.Known.STRING)
                                                                .build()))
                                .required(List.of(
                                                "order",
                                                "title",
                                                "description"))
                                .build();

                return Schema.builder()
                                .type(Type.Known.OBJECT)
                                .properties(Map.of(
                                                "title", Schema.builder()
                                                                .type(Type.Known.STRING)
                                                                .build(),
                                                "description", Schema.builder()
                                                                .type(Type.Known.STRING)
                                                                .build(),
                                                "topic", Schema.builder()
                                                                .type(Type.Known.STRING)
                                                                .build(),
                                                "stages", Schema.builder()
                                                                .type(Type.Known.ARRAY)
                                                                .items(stageSchema)
                                                                .build()))
                                .required(List.of(
                                                "title",
                                                "description",
                                                "topic",
                                                "stages"))
                                .build();
        }

}
