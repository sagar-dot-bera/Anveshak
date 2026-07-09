package com.anveshak.DTOs;

import java.util.List;

public record LiteratureReviewResponse(
        List<InnerPaperSummaryDTO> literatureReviews) {

}
