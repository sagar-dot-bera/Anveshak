package com.anveshak.service;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.anveshak.DTOs.CitationResponse;
import com.anveshak.DTOs.NewCitationRequest;
import com.anveshak.Exception.CitationNotFoundException;
import com.anveshak.Exception.ResearchPaperNotFoundException;
import com.anveshak.model.PaperCitation;
import com.anveshak.model.ResearchPaper;
import com.anveshak.model.User;
import com.anveshak.repository.CitiationRepository;
import com.anveshak.repository.ResearchPaperRepository;

@Service
public class CitationService {

    private final CitiationRepository citationRepository;
    private final ResearchPaperRepository researchPaperRepository;

    public CitationService(CitiationRepository citationRepository, ResearchPaperRepository researchPaperRepository) {
        this.citationRepository = citationRepository;
        this.researchPaperRepository = researchPaperRepository;
    }

    @Transactional
    public CitationResponse createCitation(User owner, UUID citingPaperId, NewCitationRequest request) {
        validateOwner(owner);
        validatePaperId(citingPaperId, "citingPaperId");
        validateRequest(request);

        UUID citedPaperId = request.citedPaperId();
        if (citingPaperId.equals(citedPaperId)) {
            throw new IllegalArgumentException("A paper cannot cite itself");
        }

        ResearchPaper citingPaper = loadOwnedPaper(citingPaperId, owner);
        ResearchPaper citedPaper = loadOwnedPaper(citedPaperId, owner);

        boolean citationAlreadyExists = citationRepository.existsByCitingPaper_IdAndCitedPaper_Id(citingPaperId,
                citedPaperId);
        if (citationAlreadyExists) {
            throw new IllegalArgumentException("Citation already exists for the selected papers");
        }

        PaperCitation citation = new PaperCitation();
        citation.setCitingPaper(citingPaper);
        citation.setCitedPaper(citedPaper);
        citation.setCreatedAt(Instant.now());

        return toResponse(citationRepository.save(citation));
    }

    @Transactional(readOnly = true)
    public List<CitationResponse> listCitations(User owner, UUID citingPaperId) {
        validateOwner(owner);
        validatePaperId(citingPaperId, "citingPaperId");

        loadOwnedPaper(citingPaperId, owner);

        return citationRepository.findByCitingPaper_IdOrderByCreatedAtDesc(citingPaperId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void deleteCitation(User owner, UUID citingPaperId, UUID citationId) {
        validateOwner(owner);
        validatePaperId(citingPaperId, "citingPaperId");
        if (citationId == null) {
            throw new IllegalArgumentException("citationId cannot be null");
        }

        PaperCitation citation = citationRepository.findById(citationId)
                .orElseThrow(() -> new CitationNotFoundException(citationId));

        if (!Objects.equals(citation.getCitingPaper().getId(), citingPaperId)
                || !Objects.equals(citation.getCitingPaper().getOwner().getId(), owner.getId())) {
            throw new CitationNotFoundException(citationId);
        }

        citationRepository.delete(citation);
    }

    CitationResponse toResponse(PaperCitation citation) {
        return new CitationResponse(
                citation.getId(),
                citation.getCitingPaper().getId(),
                citation.getCitingPaper().getTitle(),
                citation.getCitedPaper().getId(),
                citation.getCitedPaper().getTitle(),
                citation.getCreatedAt());
    }

    private ResearchPaper loadOwnedPaper(UUID paperId, User owner) {
        return researchPaperRepository.findByIdAndOwner(paperId, owner)
                .orElseThrow(() -> new ResearchPaperNotFoundException(paperId));
    }

    private void validateOwner(User owner) {
        if (owner == null) {
            throw new IllegalArgumentException("Owner cannot be null");
        }
    }

    private void validatePaperId(UUID paperId, String fieldName) {
        if (paperId == null) {
            throw new IllegalArgumentException(fieldName + " cannot be null");
        }
    }

    private void validateRequest(NewCitationRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Citation request cannot be null");
        }
        if (request.citedPaperId() == null) {
            throw new IllegalArgumentException("citedPaperId cannot be null");
        }
    }
}