package com.anveshak.Exception;

import java.util.UUID;

public class CitationNotFoundException extends RuntimeException {

    public CitationNotFoundException(UUID citationId) {
        super("Citation not found with id: " + citationId);
    }
}