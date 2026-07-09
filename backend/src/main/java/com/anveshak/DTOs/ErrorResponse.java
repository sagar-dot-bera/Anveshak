package com.anveshak.DTOs;

import java.time.Instant;

public record ErrorResponse(
        int status,
        String error,
        String msg,
        Instant timestamp) {

}
