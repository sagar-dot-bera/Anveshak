package com.anveshak.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.anveshak.DTOs.CitationResponse;
import com.anveshak.DTOs.NewCitationRequest;
import com.anveshak.model.User;
import com.anveshak.service.CitationService;
import com.anveshak.service.CurrentUserResolver;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping
@RequiredArgsConstructor
@Tag(name = "Citation Management", description = "Endpoints for managing citations related to research papers")
public class CitationController {

    private final CurrentUserResolver currentUserResolver;
    private final CitationService citationService;

    @Operation(summary = "Create a new citation", description = "Creates a new citation for a research paper.")
    @PostMapping("/papers/{paperId}/citations")
    public ResponseEntity<CitationResponse> createCitation(@RequestHeader("Authorization") String authorizationHeader,
            @PathVariable UUID paperId, @RequestBody @Valid NewCitationRequest request) {
        User user = currentUserResolver.resolveUser(authorizationHeader);
        return ResponseEntity.status(201).body(citationService.createCitation(user, paperId, request));
    }

    @Operation(summary = "List citations", description = "Lists all citations for a specific research paper.")
    @GetMapping("/papers/{paperId}/citations")
    public ResponseEntity<List<CitationResponse>> listCitations(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable UUID paperId) {
        User user = currentUserResolver.resolveUser(authorizationHeader);
        return ResponseEntity.ok(citationService.listCitations(user, paperId));
    }

    @Operation(summary = "Delete a citation", description = "Deletes a specific citation for a research paper.")
    @DeleteMapping("/papers/{paperId}/citations/{citationId}")
    public ResponseEntity<Void> deleteCitation(@RequestHeader("Authorization") String authorizationHeader,
            @PathVariable UUID paperId, @PathVariable UUID citationId) {
        User user = currentUserResolver.resolveUser(authorizationHeader);
        citationService.deleteCitation(user, paperId, citationId);
        return ResponseEntity.noContent().build();
    }
}