package com.anveshak.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.anveshak.model.PaperChunk;
import com.anveshak.model.ResearchPaper;
import com.pgvector.PGvector;

public interface PaperChunkRepository extends JpaRepository<PaperChunk, UUID> {
        @Query(value = """
                        SELECT *
                        FROM research_papers
                        WHERE paper_id = :paperId
                        AND embedding IS NOT NULL
                        ORDER BY embedding <=> :queryEmbedding
                        LIMIT :limit
                        """, nativeQuery = true)
        List<PaperChunk> semanticSearch(
                        @Param("queryEmbedding") PGvector embedding,
                        @Param("limit") int limit,
                        @Param("paperId") UUID paperId);

}
