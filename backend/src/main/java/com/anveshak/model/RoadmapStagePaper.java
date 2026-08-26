package com.anveshak.model;

import com.google.auto.value.AutoValue.Builder;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "roadmap_stage_papers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoadmapStagePaper {

    @EmbeddedId
    private RoadmapStagePaperId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("stageId")
    @JoinColumn(name = "stage_id")
    private RoadmapStage stage;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("paperId")
    @JoinColumn(name = "paper_id")
    private GlobalPaper paper;

    @Column(nullable = false)
    private Integer rank;

    @Column(name = "similarity_score")
    private Double similarityScore;
}