package com.anveshak.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.anveshak.model.RoadmapStage;
import com.anveshak.model.RoadmapStagePaper;
import com.anveshak.model.RoadmapStagePaperId;

public interface RoadmapStagePaperRepository extends JpaRepository<RoadmapStagePaper, RoadmapStagePaperId> {

    RoadmapStagePaper findByStage(RoadmapStage stage);

    List<RoadmapStagePaper> findAllByStage(RoadmapStage stage);

    List<RoadmapStagePaper> findAllByStageOrderByRankAsc(RoadmapStage stage);

}
