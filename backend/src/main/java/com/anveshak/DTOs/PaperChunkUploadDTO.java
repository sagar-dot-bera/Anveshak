package com.anveshak.DTOs;

import com.anveshak.Helper.EmbeddingCodec;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

/**
 * One PDF chunk produced client-side: text plus its 384-dim embedding,
 * transported as base64-encoded little-endian float32 bytes rather than a
 * JSON number array to keep batch payloads small.
 */
public record PaperChunkUploadDTO(
        @NotBlank String content,
        Integer pageNumber,
        @NotNull @PositiveOrZero Integer chunkIndex,
        @NotBlank String embedding) {

    public float[] embeddingFloatArray() {
        return EmbeddingCodec.decode(embedding, "chunkIndex " + chunkIndex);
    }
}
