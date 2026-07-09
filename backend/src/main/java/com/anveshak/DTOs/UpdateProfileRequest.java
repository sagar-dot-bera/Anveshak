package com.anveshak.DTOs;

public record UpdateProfileRequest(
        String firstName,
        String lastName,
        String username) {
}
