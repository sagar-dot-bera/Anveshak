package com.anveshak.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.anveshak.model.PaperChunk;
import com.anveshak.model.PaperSummary;
import com.anveshak.model.ResearchPaper;

@Service
public class PromptService {

    private static final String SYSTEM_PROMPT = "You are a helpful research assistant. Answer only from the provided paper context when possible. "
            + "If the context is insufficient, say so clearly and avoid making up facts.";

    public List<String> buildPrompts(String message) {
        return List.of(SYSTEM_PROMPT, buildUserPrompt(message));
    }

    public List<String> buildPrompts(String message, List<PaperChunk> chunks, String role) {
        return List.of(
                SYSTEM_PROMPT,
                buildContextPrompt(chunks),
                buildRolePrompt(role),
                buildUserPrompt(message));
    }

    public String buildSummaryPrompt(ResearchPaper paper, List<PaperChunk> chunks) {
        StringBuilder builder = new StringBuilder();

        builder.append("""
                You are an expert research assistant.

                Your task is to extract key information from the research paper using ONLY the provided context.

                Instructions:
                - Use only the provided context.
                - Do not invent, infer, or assume information that is not explicitly stated.
                - If information for any field is missing or cannot be determined, use exactly:
                  "Not stated in the provided context"
                - Keep each response concise, factual, and self-contained.
                - Summarize the authors' work faithfully without adding your own interpretation.
                - Do not quote long passages from the paper.
                """);

        builder.append("\n\nPaper Metadata:\n");
        builder.append(buildPaperLabel(paper));

        builder.append("\n\nPaper Context:\n");
        builder.append("<context>\n");
        builder.append(buildContextPrompt(chunks));
        builder.append("\n</context>");

        return builder.toString();
    }

    public String buildRoadmapPrompt(String topic) {
        return """
                # Task

                Create a structured learning roadmap for the following research topic.

                Topic:
                %s

                # Rules

                - Create a logical progression from beginner concepts to advanced research.
                - Each stage should build upon the previous stage.
                - Focus on research knowledge rather than implementation tutorials.
                - The roadmap should contain between 5 and 8 stages.
                - Each stage must have a concise title and a brief description.
                - The description should explain what the learner should understand before moving to the next stage.
                - Do not recommend or mention specific research papers.
                - Do not mention books, courses, videos, or websites.
                - The roadmap should be generic enough that relevant papers can later be attached using semantic search.
                """.formatted(topic);
    }

    public String buildComparisonPrompt(List<PaperSummary> paperSummaries) {

        if (paperSummaries == null || paperSummaries.isEmpty()) {
            return "No paper summaries were provided.";
        }

        StringBuilder builder = new StringBuilder();

        builder.append("""
                You are an expert research assistant.

                Your task is to compare the provided research papers using ONLY the supplied summaries.

                Instructions:
                - Use only the provided summaries.
                - Do not invent, infer, or assume information.
                - Preserve the same order as the provided summaries.
                - Generate one comparison object for each paper.
                - The response should contain a "papers" collection with one object per paper.
                - If information for any field is missing, use exactly:
                  "Not stated in the provided summary"
                - If a paper title is unavailable, use exactly:
                  "Untitled paper"
                - Keep every field concise, factual, and self-contained.
                - Do not repeat identical information unnecessarily.
                """);

        builder.append("\n\nPaper Summaries:\n");

        int index = 1;
        for (PaperSummary summary : paperSummaries) {
            builder.append("\n----------------------------------------\n");
            builder.append("Paper ").append(index++).append("\n");
            builder.append("----------------------------------------\n");

            builder.append(buildPaperLabel(summary.getPaper())).append("\n\n");

            builder.append("<summary>\n");
            builder.append(buildSummaryContextPrompt(summary));
            builder.append("\n</summary>\n");
        }

        return builder.toString().trim();
    }

    private String buildSummaryContextPrompt(PaperSummary summary) {
        if (summary == null) {
            return "Relevant paper summary: none found.";
        }

        StringBuilder builder = new StringBuilder("Relevant paper summary:\n");
        builder.append("Objective: ").append(nullToFallback(summary.getObjective())).append("\n")
                .append("Methodology: ").append(nullToFallback(summary.getMethodology())).append("\n")
                .append("Dataset: ").append(nullToFallback(summary.getDataset())).append("\n")
                .append("Key findings: ").append(nullToFallback(summary.getKeyFindings())).append("\n")
                .append("Limitations: ").append(nullToFallback(summary.getLimitations())).append("\n")
                .append("Future work: ").append(nullToFallback(summary.getFutureWork()));

        return builder.toString().trim();
    }

    private String buildContextPrompt(List<PaperChunk> chunks) {
        if (chunks == null || chunks.isEmpty()) {
            return "Relevant paper context: none found.";
        }

        StringBuilder builder = new StringBuilder("Relevant paper context:\n");
        for (int index = 0; index < chunks.size(); index++) {
            PaperChunk chunk = chunks.get(index);
            builder.append("Chunk ")
                    .append(index + 1)
                    .append(" (page ")
                    .append(chunk.getPageNumber() == null ? "unknown" : chunk.getPageNumber())
                    .append(", index ")
                    .append(chunk.getChunkIndex())
                    .append("):\n")
                    .append(chunk.getContent())
                    .append("\n\n");
        }
        return builder.toString().trim();
    }

    private String buildRolePrompt(String role) {
        if (role == null || role.isBlank()) {
            return "Conversation role: user.";
        }
        return "Conversation role: " + role.trim() + ".";
    }

    private String buildUserPrompt(String message) {
        return "User message: " + (message == null ? "" : message.trim());
    }

    private String buildPaperLabel(ResearchPaper paper) {
        if (paper == null) {
            return "Unknown paper";
        }

        StringBuilder label = new StringBuilder();
        if (paper.getTitle() != null && !paper.getTitle().isBlank()) {
            label.append(paper.getTitle().trim());
        } else {
            label.append("Untitled paper");
        }

        if (paper.getPublicationYear() != null) {
            label.append(" (").append(paper.getPublicationYear()).append(")");
        }

        return label.toString();
    }

    private String nullToFallback(String value) {
        return value == null || value.isBlank() ? "Not stated in the provided summary" : value.trim();
    }
}
