package com.anveshak.Exception;

public class ChatSessionNotFoundException extends RuntimeException {
    public ChatSessionNotFoundException(String sessionId) {
        super("Chat session with ID " + sessionId + " not found.");
    }

}
