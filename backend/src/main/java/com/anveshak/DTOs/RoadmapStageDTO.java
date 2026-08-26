package com.anveshak.DTOs;

import java.util.List;

import lombok.Data;

@Data
public class RoadmapStageDTO {
    String title;
    String description;
    int order;
    List<GlobalPaperDTO> papers;
}
