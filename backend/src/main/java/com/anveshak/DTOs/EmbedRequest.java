package com.anveshak.DTOs;

import jakarta.validation.constraints.NotBlank;

public record EmbedRequest(
        @NotBlank String text) {

}
