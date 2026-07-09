package com.anveshak.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.anveshak.DTOs.CollectionLookupRequest;
import com.anveshak.DTOs.CollectionPaperRequest;
import com.anveshak.DTOs.NewCollectionRequest;
import com.anveshak.DTOs.ResearchCollectionResponse;
import com.anveshak.DTOs.ResearchPaperResponse;
import com.anveshak.DTOs.UpdateCollectionRequest;
import com.anveshak.model.User;
import com.anveshak.service.CurrentUserResolver;
import com.anveshak.service.ResearchCollectionService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping
@RequiredArgsConstructor
@Tag(name = "Collection Management", description = "Endpoints for managing research paper collections")
public class CollectionsController {

    private final ResearchCollectionService collectionService;
    private final CurrentUserResolver currentUserResolver;

    @Operation(summary = "Create a new collection", description = "Creates a new research paper collection for the authenticated user.")
    @PostMapping("/collections")
    public ResponseEntity<ResearchCollectionResponse> createCollection(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestBody NewCollectionRequest request) {
        User user = currentUserResolver.resolveUser(authorizationHeader);
        return ResponseEntity.status(201).body(collectionService.createCollection(user, request));
    }

    @Operation(summary = "List collections", description = "Lists all research paper collections for the authenticated user.")
    @GetMapping("/collections")
    public ResponseEntity<List<ResearchCollectionResponse>> listCollections(
            @RequestHeader("Authorization") String authorizationHeader) {
        User user = currentUserResolver.resolveUser(authorizationHeader);
        return ResponseEntity.ok(collectionService.listCollections(user));
    }

    @Operation(summary = "Get collection details", description = "Retrieves the details of a specific research paper collection by its ID.")
    @GetMapping("/collections/{collectionId}")
    public ResponseEntity<ResearchCollectionResponse> getCollection(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable UUID collectionId) {
        User user = currentUserResolver.resolveUser(authorizationHeader);
        return ResponseEntity.ok(collectionService.getCollection(new CollectionLookupRequest(collectionId), user));
    }

    @Operation(summary = "Update a collection", description = "Updates the details of a specific research paper collection by its ID.")
    @PatchMapping("/collections/{collectionId}")
    public ResponseEntity<ResearchCollectionResponse> updateCollection(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable UUID collectionId,
            @RequestBody UpdateCollectionRequest request) {
        User user = currentUserResolver.resolveUser(authorizationHeader);
        return ResponseEntity.ok(
                collectionService.updateCollection(new CollectionLookupRequest(collectionId), request, user));
    }

    @Operation(summary = "Delete a collection", description = "Deletes a specific research paper collection by its ID.")
    @DeleteMapping("/collections/{collectionId}")
    public ResponseEntity<Void> deleteCollection(@RequestHeader("Authorization") String authorizationHeader,
            @PathVariable UUID collectionId) {
        User user = currentUserResolver.resolveUser(authorizationHeader);
        collectionService.deleteCollection(new CollectionLookupRequest(collectionId), user);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Add a paper to a collection", description = "Adds a specific research paper to a specific collection.")
    @PostMapping("/collections/{collectionId}/papers/{paperId}")
    public ResponseEntity<ResearchCollectionResponse> addPaperToCollection(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable UUID collectionId,
            @PathVariable UUID paperId) {
        User user = currentUserResolver.resolveUser(authorizationHeader);
        return ResponseEntity.ok(
                collectionService.addPaperToCollection(user, new CollectionPaperRequest(collectionId, paperId)));
    }

    @Operation(summary = "Remove a paper from a collection", description = "Removes a specific research paper from a specific collection.")
    @DeleteMapping("/collections/{collectionId}/papers/{paperId}")
    public ResponseEntity<ResearchCollectionResponse> removePaperFromCollection(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable UUID collectionId,
            @PathVariable UUID paperId) {
        User user = currentUserResolver.resolveUser(authorizationHeader);
        return ResponseEntity.ok(
                collectionService.removePaperFromCollection(user, new CollectionPaperRequest(collectionId, paperId)));
    }

    @Operation(summary = "List papers in a collection", description = "Lists all research papers in a specific collection.")
    @GetMapping("/collections/{collectionId}/papers")
    public ResponseEntity<List<ResearchPaperResponse>> listCollectionPapers(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable UUID collectionId) {
        User user = currentUserResolver.resolveUser(authorizationHeader);
        return ResponseEntity.ok(collectionService.listPapers(new CollectionLookupRequest(collectionId), user));
    }
}