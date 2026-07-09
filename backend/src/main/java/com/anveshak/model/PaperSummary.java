package com.anveshak.model;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.annotation.Generated;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "paper_summaries")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PaperSummary {

    @Id
    @Column(name = "id", nullable = false)
    @GeneratedValue(strategy = GenerationType.UUID)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private java.util.UUID id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "paper_id", nullable = false)
    private ResearchPaper paper;

    @Column(name = "objective", columnDefinition = "TEXT")
    private String objective;

    @Column(name = "methodology", columnDefinition = "TEXT")
    private String methodology;

    @Column(name = "dataset", columnDefinition = "TEXT")
    private String dataset;

    @Column(name = "key_findings", columnDefinition = "TEXT")
    private String keyFindings;

    @Column(name = "limitations", columnDefinition = "TEXT")
    private String limitations;

    @Column(name = "future_work", columnDefinition = "TEXT")
    private String futureWork;
}