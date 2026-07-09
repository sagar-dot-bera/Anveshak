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
        builder.append("You are a helpful research assistant summarizing a single research paper. ")
                .append("Use only the provided paper context. Do not invent facts. ")
                .append("If a field is missing, write 'Not stated in the provided context'. ")
                .append("Return only valid JSON. Do not wrap the response in markdown, code fences, or extra text.");

        builder.append("\n\nReturn the summary in exactly this shape: ")
                .append("{\"objective\":\"...\",\"methodology\":\"...\",\"dataset\":\"...\",\"keyFindings\":\"...\",\"limitations\":\"...\",\"futureWork\":\"...\"}");

        builder.append("\n\nPaper: ").append(buildPaperLabel(paper));
        builder.append("\n\nPaper context:\n").append(buildContextPrompt(chunks));

        return builder.toString().trim();
    }

    public String buildComparisonPrompt(List<PaperSummary> paperSummaries) {
        StringBuilder builder = new StringBuilder();
        builder.append("You are a helpful research assistant comparing multiple research papers. ")
                .append("Use only the provided paper summaries. Do not invent details. ")
                .append("If a criterion is missing, write 'Not stated in the provided summary'. ")
                .append("Return only valid JSON. Do not wrap the response in markdown, code fences, or extra text.");

        if (paperSummaries == null || paperSummaries.isEmpty()) {
            return "{\"papers\": []}";
        }

        builder.append("\n\nProduce JSON in exactly this shape: ")
                .append("{\"papers\":[{\"title\":\"...\",\"objective\":\"...\",\"methodology\":\"...\",\"dataset\":\"...\",\"keyFindings\":\"...\",\"limitations\":\"...\",\"futureWork\":\"...\"}]}")
                .append("\nUse one object per paper in the same order as the provided summaries.")
                .append("\n\nPaper summaries:");

        int paperIndex = 1;
        for (PaperSummary summary : paperSummaries) {
            ResearchPaper paper = summary.getPaper();
            builder.append("\n\nPaper ")
                    .append(paperIndex++)
                    .append(": ")
                    .append(buildPaperLabel(paper))
                    .append("\n");
            builder.append(buildSummaryContextPrompt(summary));
        }

        builder.append("\n\nFor each paper, fill the fields from the provided context. ")
                .append("If the title is missing, use 'Untitled paper'.");

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
