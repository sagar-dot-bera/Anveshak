package com.anveshak.DTOs;

public record AuthResponse(
        String accessToken,
        String refreshToken) {

}
