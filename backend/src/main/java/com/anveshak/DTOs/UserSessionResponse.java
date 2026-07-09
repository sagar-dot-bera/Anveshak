package com.anveshak.DTOs;

import java.time.Instant;
import java.util.UUID;

public record UserSessionResponse(
        UUID id,
        String deviceName,
        String ipAddress,
        Instant createdAt,
        Instant expiresAt,
        boolean revoked) {
}
