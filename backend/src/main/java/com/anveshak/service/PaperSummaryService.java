package com.anveshak.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.anveshak.Exception.ResearchSummaryNotFoundException;
import com.anveshak.model.PaperChunk;
import com.anveshak.model.PaperSummary;
import com.anveshak.model.ResearchPaper;
import com.anveshak.repository.PaperSummaryRepository;
import com.anveshak.repository.ResearchPaperRepository;
import com.anveshak.repository.PaperChunkRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

import com.anveshak.DTOs.InnerPaperSummaryDTO;
import com.anveshak.DTOs.LiteratureReviewRequest;
import com.anveshak.DTOs.LiteratureReviewResponse;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class PaperSummaryService {
    private final PaperSummaryRepository paperSummaryRepository;

    private final ResearchPaperRepository researchPaperRepository;

    private final GeminiService geminiService;

    private final PromptService promptService;

    private final PaperChunkRepository paperChunkRepository;

    PaperSummaryService(PaperSummaryRepository paperSummaryRepository,
            ResearchPaperRepository researchPaperRepository, GeminiService geminiService, PromptService promptService,
            PaperChunkRepository paperChunkRepository) {
        this.paperSummaryRepository = paperSummaryRepository;
        this.researchPaperRepository = researchPaperRepository;
        this.geminiService = geminiService;
        this.promptService = promptService;
        this.paperChunkRepository = paperChunkRepository;
    }

    PaperSummary getPaperSummary(String paperId) {
        if (paperId == null || paperId.isEmpty()) {
            throw new IllegalArgumentException("Paper ID cannot be null or empty");
        }

        return paperSummaryRepository.findById(UUID.fromString(paperId))
                .orElseThrow(() -> new ResearchSummaryNotFoundException(paperId));
    }

    public PaperSummary savePaperSummary(List<PaperChunk> chunks, ResearchPaper paper) {
        try {
            String prompt = promptService.buildSummaryPrompt(paper, chunks);

            if (prompt != null && !prompt.isBlank()) {
                log.info("Generated prompt for summary for paper ID: {}", paper.getId());
                String summary = geminiService.generateAnwerInJSON(prompt, geminiService.buildSummarySchema());

                ObjectMapper objectMapper = new ObjectMapper();
                InnerPaperSummaryDTO paperSummary = objectMapper.readValue(summary, InnerPaperSummaryDTO.class);

                log.info("Successfully generated AI paper summary for paper ID: {}", paper.getId());
                PaperSummary newSummary = new PaperSummary();
                newSummary.setPaper(paper);
                newSummary.setObjective(paperSummary.objective());
                newSummary.setMethodology(paperSummary.methodology());
                newSummary.setDataset(paperSummary.dataset());
                newSummary.setKeyFindings(paperSummary.keyFindings());
                newSummary.setLimitations(paperSummary.limitations());
                newSummary.setFutureWork(paperSummary.futureWork());

                return paperSummaryRepository.save(newSummary);
            }
        } catch (Exception e) {
            log.warn("Failed to generate AI paper summary via Gemini for paper {}: {}. Creating fallback summary.", paper.getId(), e.getMessage());
        }

        // Fallback paper summary generation so PaperSummary record is guaranteed to exist
        PaperSummary fallbackSummary = new PaperSummary();
        fallbackSummary.setPaper(paper);
        fallbackSummary.setObjective(paper.getAbstractText() != null && !paper.getAbstractText().isBlank()
                ? paper.getAbstractText()
                : "Research paper: " + paper.getTitle());
        fallbackSummary.setMethodology("Not stated in the provided context");
        fallbackSummary.setDataset("Not stated in the provided context");
        fallbackSummary.setKeyFindings("Not stated in the provided context");
        fallbackSummary.setLimitations("Not stated in the provided context");
        fallbackSummary.setFutureWork("Not stated in the provided context");

        return paperSummaryRepository.save(fallbackSummary);
    }

    PaperSummary updatePaperSummary(String paperId, InnerPaperSummaryDTO updatedSummary) {
        if (paperId == null || paperId.isEmpty()) {
            throw new IllegalArgumentException("Paper ID cannot be null or empty");
        }

        PaperSummary existingSummary = paperSummaryRepository.findById(UUID.fromString(paperId))
                .orElseThrow(() -> new ResearchSummaryNotFoundException(paperId));

        existingSummary.setMethodology(updatedSummary.methodology());
        existingSummary.setDataset(updatedSummary.dataset());
        existingSummary.setKeyFindings(updatedSummary.keyFindings());
        existingSummary.setLimitations(updatedSummary.limitations());
        existingSummary.setFutureWork(updatedSummary.futureWork());
        existingSummary.setObjective(updatedSummary.objective());

        return paperSummaryRepository.save(existingSummary);
    }

    public List<PaperSummary> getAllPaperSummaries(List<ResearchPaper> papers) {
        if (papers == null || papers.isEmpty()) {
            throw new IllegalArgumentException("Paper list cannot be null or empty");
        }

        List<PaperSummary> summaries = new ArrayList<>();

        for (ResearchPaper paper : papers) {
            if (paper == null || paper.getId() == null) {
                throw new IllegalArgumentException("Paper or Paper ID cannot be null");
            }

            Optional<PaperSummary> paperSummary = paperSummaryRepository.findById(paper.getId());

            if (paperSummary.isPresent()) {
                summaries.add(paperSummary.get());
            } else {
                log.info("No PaperSummary found for paper ID: {}, generating on the fly...", paper.getId());
                List<PaperChunk> chunks = paperChunkRepository.findByPaperOrderByChunkIndexAsc(paper);
                if (chunks == null || chunks.isEmpty()) {
                    PaperChunk chunk = new PaperChunk();
                    chunk.setPaper(paper);
                    chunk.setContent("Title: " + paper.getTitle() + "\n\nAbstract:\n" + paper.getAbstractText());
                    chunk.setPageNumber(1);
                    chunk.setChunkIndex(0);
                    chunk.setEmbeddings(paper.getEmbedding());
                    chunk.setCreatedAt(java.time.Instant.now());
                    chunks = List.of(paperChunkRepository.save(chunk));
                }
                PaperSummary generated = savePaperSummary(chunks, paper);
                summaries.add(generated);
            }

        }
        return summaries;

    }

    public LiteratureReviewResponse getPaperReviewResponse(LiteratureReviewRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Summaries list cannot be null or empty");
        }

        List<UUID> ids = Arrays.stream(request.paperIdStrings())
                .map(UUID::fromString)
                .toList();
        List<ResearchPaper> papers = researchPaperRepository.findAllById(ids);
        List<PaperSummary> summaries = getAllPaperSummaries(papers);

        List<InnerPaperSummaryDTO> summaryDTOs = summaries.stream()
                .map(summary -> new InnerPaperSummaryDTO(
                        summary.getObjective(),
                        summary.getMethodology(),
                        summary.getDataset(),
                        summary.getKeyFindings(),
                        summary.getLimitations(),
                        summary.getFutureWork()))
                .toList();

        return new LiteratureReviewResponse(summaryDTOs);
    }

}