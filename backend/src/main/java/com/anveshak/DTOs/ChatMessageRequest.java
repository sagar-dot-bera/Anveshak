package com.anveshak.DTOs;

public record ChatMessageRequest(
        String message,
        String sessionId,
        String role) {

}
