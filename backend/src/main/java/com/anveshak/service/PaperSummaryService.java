package com.anveshak.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.anveshak.Exception.ResearchSummaryNotFoundException;
import com.anveshak.model.PaperSummary;
import com.anveshak.model.ResearchPaper;
import com.anveshak.repository.PaperSummaryRepository;
import com.anveshak.DTOs.InnerPaperSummaryDTO;
import com.anveshak.DTOs.LiteratureReviewRequest;
import com.anveshak.DTOs.LiteratureReviewResponse;

class PaperSummaryService {
    private final PaperSummaryRepository paperSummaryRepository;
    private final ResearchPaperService researchPaperService;

    PaperSummaryService(PaperSummaryRepository paperSummaryRepository, ResearchPaperService researchPaperService) {
        this.paperSummaryRepository = paperSummaryRepository;
        this.researchPaperService = researchPaperService;
    }

    PaperSummary getPaperSummary(String paperId) {
        if (paperId == null || paperId.isEmpty()) {
            throw new IllegalArgumentException("Paper ID cannot be null or empty");
        }

        return paperSummaryRepository.findById(UUID.fromString(paperId))
                .orElseThrow(() -> new ResearchSummaryNotFoundException(paperId));
    }

    PaperSummary savePaperSummary(InnerPaperSummaryDTO paperSummary, ResearchPaper paper) {
        if (paperSummary == null) {
            throw new IllegalArgumentException("Paper summary cannot be null");
        }

        PaperSummary newSummary = new PaperSummary();
        newSummary.setMethodology(paperSummary.methodology());
        newSummary.setDataset(paperSummary.dataset());
        newSummary.setKeyFindings(paperSummary.keyFindings());
        newSummary.setLimitations(paperSummary.limitations());
        newSummary.setFutureWork(paperSummary.futureWork());
        newSummary.setPaper(paper);
        newSummary.setObjective(paperSummary.objective());

        newSummary.setId(paper.getId()); // Set the ID of PaperSummary to match the ResearchPaper ID

        return paperSummaryRepository.save(newSummary);
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

    List<PaperSummary> getAllPaperSummaries(List<ResearchPaper> papers) {
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
                throw new ResearchSummaryNotFoundException(paper.getId().toString());
            }

        }
        return summaries;

    }

    public LiteratureReviewResponse getPaperReviewResponse(LiteratureReviewRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Summaries list cannot be null or empty");
        }

        List<ResearchPaper> papers = researchPaperService.getPapersByIds(request.paperIdStrings());
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