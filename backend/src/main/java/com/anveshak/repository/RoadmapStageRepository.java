package com.anveshak.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.anveshak.model.Roadmap;
import com.anveshak.model.RoadmapStage;

public interface RoadmapStageRepository extends JpaRepository<RoadmapStage, UUID> {

    List<RoadmapStage> findAllByRoadmapOrderByStageOrderAsc(Roadmap roadmap);

}
