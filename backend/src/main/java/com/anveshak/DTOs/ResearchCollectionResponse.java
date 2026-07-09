package com.anveshak.DTOs;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ResearchCollectionResponse(
        UUID id,
        String name,
        Instant createdAt,
        List<ResearchPaperResponse> papers) {

}