package com.anveshak.DTOs;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ResearchPaperResponse(
        UUID id,
        String title,
        String abstractText,
        List<String> authors,
        List<String> keywords,
        Integer publicationYear,
        String pdfUrl,
        Instant createdAt,
        Instant updatedAt) {

}