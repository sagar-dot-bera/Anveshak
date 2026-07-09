package com.anveshak.Exception;

import java.util.UUID;

public class ResearchPaperNotFoundException extends RuntimeException {

    public ResearchPaperNotFoundException(UUID paperId) {
        super("Research paper not found with id: " + paperId);
    }
}