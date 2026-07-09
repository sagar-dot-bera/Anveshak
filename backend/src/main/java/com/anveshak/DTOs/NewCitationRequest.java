package com.anveshak.DTOs;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record NewCitationRequest(
        @NotNull UUID citedPaperId) {

}