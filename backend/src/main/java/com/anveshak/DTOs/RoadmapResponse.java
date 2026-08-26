package com.anveshak.DTOs;

import java.util.List;

public record RoadmapResponse(
                String title,
                String description,
                String topic,
                List<RoadmapStageResponse> stages

) {
}
