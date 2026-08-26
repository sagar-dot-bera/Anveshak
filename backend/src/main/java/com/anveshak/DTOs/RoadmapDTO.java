package com.anveshak.DTOs;

import java.time.Instant;
import java.util.List;

import lombok.Data;

@Data
public class RoadmapDTO {
    String topic;
    String description;
    String title;
    Instant createdAt;
    List<RoadmapStageDTO> stages;
}
