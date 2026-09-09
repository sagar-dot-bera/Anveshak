package com.anveshak.DTOs;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

public record PaperChunkBatchUploadRequest(
        @NotEmpty List<@Valid PaperChunkUploadDTO> chunks) {

}
