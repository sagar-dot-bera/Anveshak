package com.anveshak.controller;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.UUID;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.anveshak.DTOs.CollectionLookupRequest;
import com.anveshak.DTOs.CollectionPaperRequest;
import com.anveshak.DTOs.NewCollectionRequest;
import com.anveshak.DTOs.NewPaperRequest;
import com.anveshak.DTOs.LiteratureReviewRequest;
import com.anveshak.DTOs.LiteratureReviewResponse;
import com.anveshak.DTOs.PaperComparisonRequest;
import com.anveshak.DTOs.PaperComparisonResponse;
import com.anveshak.DTOs.PaperLookupRequest;
import com.anveshak.DTOs.PaperSearchRequest;
import com.anveshak.DTOs.ResearchCollectionResponse;
import com.anveshak.DTOs.ResearchPaperResponse;
import com.anveshak.DTOs.UpdateCollectionRequest;
import com.anveshak.DTOs.UpdatePaperRequest;
import com.anveshak.model.User;
import com.anveshak.service.CurrentUserResolver;
import com.anveshak.service.PaperComparisonService;
import com.anveshak.service.PaperSummaryService;
import com.anveshak.service.ResearchCollectionService;
import com.anveshak.service.ResearchPaperService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping
@RequiredArgsConstructor
@Tag(name = "Research Paper Management", description = "Endpoints for managing research papers and their related functionalities")
public class PepersController {

    private final CurrentUserResolver currentUserResolver;
    private final ResearchPaperService researchPaperService;
    private final ResearchCollectionService researchCollectionService;
    private final PaperComparisonService paperComparisonService;
    private final PaperSummaryService paperSummaryService;

    @Operation(summary = "Generate a literature review synthesis report", description = "Generates a literature review synthesis report for the selected research papers.")
    @PostMapping("/papers/literature-review")
    public ResponseEntity<LiteratureReviewResponse> generateLiteratureReview(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestBody @Valid LiteratureReviewRequest request) {
        currentUserResolver.resolveUser(authorizationHeader);
        return ResponseEntity.ok(paperSummaryService.getPaperReviewResponse(request));
    }

    @Operation(summary = "Create a new research paper", description = "Creates a new research paper for the authenticated user.")
    @PostMapping(value = "/papers", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResearchPaperResponse> createPaper(@RequestHeader("Authorization") String authorizationHeader,
            @RequestPart("paper") @Valid NewPaperRequest request,
            @RequestPart("pdfFile") MultipartFile pdfFile) throws IOException {
        User user = currentUserResolver.resolveUser(authorizationHeader);
        return ResponseEntity.status(201).body(researchPaperService.createPaper(user, request, pdfFile));
    }

    @GetMapping("/papers")
    @Operation(summary = "List research papers", description = "Lists all research papers for the authenticated user.")
    public ResponseEntity<List<ResearchPaperResponse>> listPapers(
            @RequestHeader("Authorization") String authorizationHeader) {
        User user = currentUserResolver.resolveUser(authorizationHeader);
        return ResponseEntity.ok(researchPaperService.listPapers(user));
    }

    @GetMapping("/papers/{paperId}")
    @Operation
    public ResponseEntity<ResearchPaperResponse> getPaper(@RequestHeader("Authorization") String authorizationHeader,
            @PathVariable UUID paperId) {
        User user = currentUserResolver.resolveUser(authorizationHeader);
        return ResponseEntity.ok(researchPaperService.getPaper(new PaperLookupRequest(paperId), user));
    }

    @Operation(summary = "Download research paper PDF", description = "Downloads the PDF file of a specific research paper for the authenticated user.")
    @GetMapping("/papers/{paperId}/pdf")
    public ResponseEntity<InputStreamResource> downloadPaperPdf(
            @RequestHeader("Authorization") String authorizationHeader, @PathVariable UUID paperId) {
        User user = currentUserResolver.resolveUser(authorizationHeader);
        InputStream pdfStream = researchPaperService.downloadPaperPdf(new PaperLookupRequest(paperId), user);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(paperId + ".pdf").build().toString())
                .body(new InputStreamResource(pdfStream));
    }

    @Operation(summary = "Update a research paper", description = "Updates the details of a specific research paper for the authenticated user.")
    @PatchMapping(value = "/papers/{paperId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResearchPaperResponse> updatePaper(
            @RequestHeader("Authorization") String authorizationHeader, @PathVariable UUID paperId,
            @RequestPart("paper") UpdatePaperRequest request,
            @RequestPart(value = "pdfFile", required = false) MultipartFile pdfFile) throws IOException {
        User user = currentUserResolver.resolveUser(authorizationHeader);
        return ResponseEntity.ok(
                researchPaperService.updatePaper(new PaperLookupRequest(paperId), request, pdfFile, user));
    }

    @Operation(summary = "Delete a research paper", description = "Deletes a specific research paper for the authenticated user.")
    @DeleteMapping("/papers/{paperId}")
    public ResponseEntity<Void> deletePaper(@RequestHeader("Authorization") String authorizationHeader,
            @PathVariable UUID paperId) {
        User user = currentUserResolver.resolveUser(authorizationHeader);
        researchPaperService.deletePaper(new PaperLookupRequest(paperId), user);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Search research papers", description = "Searches for research papers based on the provided query for the authenticated user.")
    @GetMapping("/papers/search")
    public ResponseEntity<List<ResearchPaperResponse>> searchPapers(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam(required = false) String query) {
        User user = currentUserResolver.resolveUser(authorizationHeader);
        return ResponseEntity.ok(researchPaperService.semanticSearch(query, user));
    }

    @Operation(summary = "List collections", description = "Lists all research paper collections for the authenticated user.")
    @PostMapping("/papers/compare")
    public ResponseEntity<PaperComparisonResponse> comparePapers(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestBody PaperComparisonRequest request) throws JsonMappingException, JsonProcessingException {
        currentUserResolver.resolveUser(authorizationHeader);
        PaperComparisonResponse entity = paperComparisonService.comparePapers(request);

        return ResponseEntity.ok(entity);
    }

}