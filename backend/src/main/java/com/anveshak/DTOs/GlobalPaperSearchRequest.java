package com.anveshak.DTOs;

import com.anveshak.Helper.EmbeddingCodec;

import jakarta.validation.constraints.NotBlank;

/** Semantic search over the global arXiv index, embedding computed client-side. */
public record GlobalPaperSearchRequest(@NotBlank String embedding, int limit, double threshold) {

    public float[] embeddingFloatArray() {
        return EmbeddingCodec.decode(embedding, "search query");
    }
}
