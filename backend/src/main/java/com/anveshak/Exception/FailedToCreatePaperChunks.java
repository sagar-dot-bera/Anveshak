package com.anveshak.Exception;

public class FailedToCreatePaperChunks extends RuntimeException {
    public FailedToCreatePaperChunks(String message) {
        super("Failed to create paper chunks: " + message);
    }

}
