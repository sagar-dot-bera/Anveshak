package com.anveshak.Helper;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.FloatBuffer;
import java.util.Base64;

/**
 * Decodes the base64 little-endian float32 wire format used for embeddings
 * computed client-side (browser ONNX Runtime Web), shared by every DTO that
 * carries one - paper chunks, search queries, chat messages.
 */
public final class EmbeddingCodec {

    public static final int EXPECTED_DIMENSIONS = 384;

    private EmbeddingCodec() {
    }

    public static float[] decode(String base64Embedding, String label) {
        byte[] bytes;
        try {
            bytes = Base64.getDecoder().decode(base64Embedding);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(label + " embedding is not valid base64");
        }

        FloatBuffer floatBuffer = ByteBuffer.wrap(bytes).order(ByteOrder.LITTLE_ENDIAN).asFloatBuffer();
        if (floatBuffer.remaining() != EXPECTED_DIMENSIONS) {
            throw new IllegalArgumentException(
                    "Expected a " + EXPECTED_DIMENSIONS + "-dim embedding for " + label
                            + " but got " + floatBuffer.remaining());
        }

        float[] result = new float[floatBuffer.remaining()];
        floatBuffer.get(result);
        return result;
    }
}
