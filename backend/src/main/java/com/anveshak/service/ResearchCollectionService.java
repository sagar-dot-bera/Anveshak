package com.anveshak.service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.anveshak.DTOs.CollectionLookupRequest;
import com.anveshak.DTOs.CollectionPaperRequest;
import com.anveshak.DTOs.NewCollectionRequest;
import com.anveshak.DTOs.ResearchCollectionResponse;
import com.anveshak.DTOs.ResearchPaperResponse;
import com.anveshak.DTOs.UpdateCollectionRequest;
import com.anveshak.Exception.ResearchCollectionNotFoundException;
import com.anveshak.Exception.ResearchPaperNotFoundException;
import com.anveshak.model.ResearchCollection;
import com.anveshak.model.ResearchPaper;
import com.anveshak.model.User;
import com.anveshak.repository.ResearchCollectionRepository;
import com.anveshak.repository.ResearchPaperRepository;

@Service
public class ResearchCollectionService {

    private final ResearchCollectionRepository researchCollectionRepository;
    private final ResearchPaperRepository researchPaperRepository;
    private final ResearchPaperService researchPaperService;

    public ResearchCollectionService(ResearchCollectionRepository researchCollectionRepository,
            ResearchPaperRepository researchPaperRepository, ResearchPaperService researchPaperService) {
        this.researchCollectionRepository = researchCollectionRepository;
        this.researchPaperRepository = researchPaperRepository;
        this.researchPaperService = researchPaperService;
    }

    @Transactional
    public ResearchCollectionResponse createCollection(User owner, NewCollectionRequest request) {
        validateOwner(owner);
        validateName(request == null ? null : request.name());

        ResearchCollection collection = new ResearchCollection();
        collection.setOwner(owner);
        collection.setName(request.name().trim());
        collection.setCreatedAt(Instant.now());

        return toResponse(researchCollectionRepository.save(collection));
    }

    @Transactional(readOnly = true)
    public List<ResearchCollectionResponse> listCollections(User owner) {
        validateOwner(owner);
        return researchCollectionRepository.findByOwnerOrderByCreatedAtDesc(owner).stream().map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ResearchCollectionResponse getCollection(CollectionLookupRequest request, User owner) {
        validateOwner(owner);
        return toResponse(loadOwnedCollection(request, owner));
    }

    @Transactional
    public ResearchCollectionResponse updateCollection(CollectionLookupRequest lookupRequest,
            UpdateCollectionRequest request, User owner) {
        validateOwner(owner);

        ResearchCollection collection = loadOwnedCollection(lookupRequest, owner);
        if (request != null && request.name() != null && !request.name().isBlank()) {
            collection.setName(request.name().trim());
        }

        return toResponse(researchCollectionRepository.save(collection));
    }

    @Transactional
    public void deleteCollection(CollectionLookupRequest request, User owner) {
        validateOwner(owner);
        ResearchCollection collection = loadOwnedCollection(request, owner);
        researchCollectionRepository.delete(collection);
    }

    @Transactional
    public ResearchCollectionResponse addPaperToCollection(User owner, CollectionPaperRequest request) {
        validateOwner(owner);

        ResearchCollection collection = loadOwnedCollection(new CollectionLookupRequest(request.collectionId()), owner);
        ResearchPaper paper = loadOwnedPaper(request.paperId(), owner);

        collection.getPapers().add(paper);
        paper.getCollections().add(collection);

        researchCollectionRepository.save(collection);
        return toResponse(collection);
    }

    @Transactional
    public ResearchCollectionResponse removePaperFromCollection(User owner, CollectionPaperRequest request) {
        validateOwner(owner);

        ResearchCollection collection = loadOwnedCollection(new CollectionLookupRequest(request.collectionId()), owner);
        ResearchPaper paper = loadOwnedPaper(request.paperId(), owner);

        collection.getPapers().remove(paper);
        paper.getCollections().remove(collection);

        researchCollectionRepository.save(collection);
        return toResponse(collection);
    }

    @Transactional(readOnly = true)
    public List<ResearchPaperResponse> listPapers(CollectionLookupRequest request, User owner) {
        validateOwner(owner);
        return loadOwnedCollection(request, owner).getPapers().stream().map(researchPaperService::toResponse).toList();
    }

    ResearchCollectionResponse toResponse(ResearchCollection collection) {
        return new ResearchCollectionResponse(
                collection.getId(),
                collection.getName(),
                collection.getCreatedAt(),
                collection.getPapers().stream().map(researchPaperService::toResponse).toList());
    }

    private ResearchCollection loadOwnedCollection(CollectionLookupRequest request, User owner) {
        if (request == null || request.collectionId() == null) {
            throw new IllegalArgumentException("Collection id cannot be null");
        }

        return researchCollectionRepository.findByIdAndOwner(request.collectionId(), owner)
                .orElseThrow(() -> new ResearchCollectionNotFoundException(request.collectionId()));
    }

    private ResearchPaper loadOwnedPaper(UUID paperId, User owner) {
        if (paperId == null) {
            throw new IllegalArgumentException("Paper id cannot be null");
        }

        return researchPaperRepository.findByIdAndOwner(paperId, owner)
                .orElseThrow(() -> new ResearchPaperNotFoundException(paperId));
    }

    private void validateOwner(User owner) {
        if (owner == null) {
            throw new IllegalArgumentException("Owner cannot be null");
        }
    }

    private void validateName(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Collection name cannot be null or empty");
        }
    }
}