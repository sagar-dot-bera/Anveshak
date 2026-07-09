package com.anveshak.Exception;

public class ResearchSummaryNotFoundException extends RuntimeException {

    public ResearchSummaryNotFoundException(String msg) {
        super("Research Summary not found for the given paper ID: " + msg);
    }
}
