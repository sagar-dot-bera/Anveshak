package com.anveshak.DTOs;

import java.time.Instant;
import java.util.UUID;

public record PaperChunkDTO(
                String content,
                Integer pageNumber,
                Integer chunkIndex) {

}