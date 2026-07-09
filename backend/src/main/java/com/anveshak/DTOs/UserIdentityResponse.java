package com.anveshak.DTOs;

import java.time.Instant;
import java.util.UUID;

public record UserIdentityResponse(
        UUID id,
        String provider,
        String providerUserId,
        Instant createdAt) {
}
