package com.anveshak.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.anveshak.model.GlobalPaper;
import com.anveshak.model.PaperChunk;

public interface GlobalPaperRepository extends JpaRepository<GlobalPaper, UUID> {
    @Query(value = """
            SELECT *
            FROM global_papers
            WHERE embedding IS NOT NULL
            AND (1 - (embedding <=> CAST(:queryEmbedding AS text)::vector)) >= :threshold
            ORDER BY embedding <=> CAST(:queryEmbedding AS text)::vector
            LIMIT :limit
            """, nativeQuery = true)
    List<GlobalPaper> semanticSearch(
            @Param("queryEmbedding") String embedding,
            @Param("limit") int limit,
            @Param("threshold") double threshold);

    java.util.Optional<GlobalPaper> findByExternalId(String externalId);
}
