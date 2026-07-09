package com.anveshak.DTOs;

import java.time.Instant;
import java.util.UUID;

public record UserProfileResponse(
        UUID id,
        String firstName,
        String lastName,
        String username,
        String email,
        boolean emailVerified,
        Instant createdAt,
        Instant updatedAt) {
}
