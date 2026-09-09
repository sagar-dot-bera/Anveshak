package com.anveshak.DTOs;

import com.anveshak.Helper.EmbeddingCodec;

import jakarta.validation.constraints.NotBlank;

public record ChatMessageRequest(
        String message,
        String sessionId,
        String role,
        @NotBlank String embedding) {

    public float[] embeddingFloatArray() {
        return EmbeddingCodec.decode(embedding, "chat message");
    }
}
