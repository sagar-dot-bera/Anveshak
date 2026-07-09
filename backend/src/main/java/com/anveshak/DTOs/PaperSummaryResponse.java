package com.anveshak.DTOs;

import java.util.List;

public record PaperSummaryResponse(
        List<InnerPaperSummaryDTO> summaries) {
}
