package com.anveshak.DTOs;

import java.time.Instant;

public record ChatSessionResponse(
        String sessionId,
        String paperId,
        Instant createdAt
) {

}
