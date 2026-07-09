package com.anveshak.DTOs;

public record ChatMessageResponse(
        String message,
        String sessionId,
        String role) {

}
