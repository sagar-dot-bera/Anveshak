package com.anveshak.model;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.Array;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "global_papers", uniqueConstraints = @UniqueConstraint(columnNames = { "source", "external_id" }))
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class GlobalPaper {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "source", nullable = false)
    private String source;

    @Column(name = "external_id", nullable = false)
    private String externalId;

    @Column(name = "title", columnDefinition = "TEXT")
    private String title;

    @Column(name = "abstract", columnDefinition = "TEXT")
    private String abstractText;

    @Column(name = "authors", columnDefinition = "TEXT")
    private String authors;

    @Column(name = "categories", columnDefinition = "TEXT")
    private String categories;

    @Column(name = "published_at", nullable = false)
    private LocalDate publishedAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDate updatedAt;

    @Column(name = "doi", columnDefinition = "TEXT")
    private String doi;

    @Column(name = "paper_url", columnDefinition = "TEXT")
    private String paperUrl;

    @Column(name = "pdf_url", columnDefinition = "TEXT")
    private String pdfUrl;

    @Column(name = "embedding", nullable = false, columnDefinition = "vector(384)")
    @JdbcTypeCode(SqlTypes.VECTOR)
    @Array(length = 384)
    private float[] embedding;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "indexed_at", nullable = false)
    private Instant indexedAt;
}