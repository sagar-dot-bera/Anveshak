package com.anveshak.Exception;

public class FailedToCreatePaperSummary extends RuntimeException {
    public FailedToCreatePaperSummary(String message) {
        super("Failed to create paper summary: " + message);
    }

}
