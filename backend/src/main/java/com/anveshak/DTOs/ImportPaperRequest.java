package com.anveshak.DTOs;

public record ImportPaperRequest(
        String paperId,
        String title,
        String abstractText,
        String authors,
        String categories,
        String pdfUrl,
        String paperUrl,
        Integer publicationYear
) {
}
