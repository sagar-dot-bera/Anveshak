package com.anveshak.DTOs;

import java.time.Instant;
import java.util.UUID;

public record CitationResponse(
        UUID id,
        UUID citingPaperId,
        String citingPaperTitle,
        UUID citedPaperId,
        String citedPaperTitle,
        Instant createdAt) {

}