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
                        FROM paper_chunks
                        WHERE paper_id = :paperId
                        AND embeddings IS NOT NULL
                        ORDER BY embeddings <=> CAST(:queryEmbedding AS text)::vector
                        LIMIT :limit
                        """, nativeQuery = true)
        List<PaperChunk> semanticSearch(
                        @Param("queryEmbedding") String embedding,
                        @Param("limit") int limit,
                        @Param("paperId") UUID paperId);

        void deleteByPaper(ResearchPaper paper);

        List<PaperChunk> findByPaperOrderByChunkIndexAsc(ResearchPaper paper);

        List<PaperChunk> findByPaper(ResearchPaper paper);
}
