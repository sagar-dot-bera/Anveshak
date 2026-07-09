package com.anveshak.Exception;

import java.util.UUID;

public class ResearchCollectionNotFoundException extends RuntimeException {

    public ResearchCollectionNotFoundException(UUID collectionId) {
        super("Research collection not found with id: " + collectionId);
    }
}