package com.anveshak.DTOs;

import com.anveshak.Helper.EmbeddingCodec;

import jakarta.validation.constraints.NotBlank;

/** Semantic search over the user's own library, embedding computed client-side. */
public record LocalPaperSearchRequest(@NotBlank String embedding, double threshold) {

    public float[] embeddingFloatArray() {
        return EmbeddingCodec.decode(embedding, "search query");
    }
}
