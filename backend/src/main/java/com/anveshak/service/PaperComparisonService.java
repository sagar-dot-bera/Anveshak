package com.anveshak.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.anveshak.DTOs.PaperComparisonRequest;
import com.anveshak.DTOs.PaperComparisonResponse;
import com.anveshak.client.EmbeddingServiceClient;
import com.anveshak.model.PaperSummary;
import com.anveshak.model.ResearchPaper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class PaperComparisonService {
    private final ResearchPaperService researchPaperService;
    private final GeminiService geminiService;

    private final PaperSummaryService paperSummaryService;

    public PaperComparisonService(ResearchPaperService researchPaperService,
            GeminiService geminiService,
            PaperSummaryService paperSummaryService) {
        this.researchPaperService = researchPaperService;
        this.geminiService = geminiService;

        this.paperSummaryService = paperSummaryService;
    }

    public PaperComparisonResponse comparePapers(PaperComparisonRequest paperComparisonRequest)
            throws JsonMappingException, JsonProcessingException {
        List<ResearchPaper> papers = researchPaperService.getPapers(paperComparisonRequest.paperIdStrings());

        List<PaperSummary> summaries = paperSummaryService.getAllPaperSummaries(papers);

        String prompt = geminiService.generateComparisonPrompt(summaries);

        String response = geminiService.generateAnswer(prompt);

        ObjectMapper objectMapper = new ObjectMapper();
        PaperComparisonResponse paperComparisonResponse = objectMapper.readValue(response,
                PaperComparisonResponse.class);

        return paperComparisonResponse;
    }
}
