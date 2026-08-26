package com.anveshak.DTOs;

import jakarta.validation.constraints.NotBlank;

public record RefreshTokenRequest(
        @NotBlank String token,
        String id) {
}