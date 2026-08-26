package com.anveshak.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.anveshak.model.ResearchPaper;
import com.anveshak.model.User;
import com.pgvector.PGvector;

@Repository
public interface ResearchPaperRepository extends JpaRepository<ResearchPaper, UUID> {

    List<ResearchPaper> findByOwnerOrderByCreatedAtDesc(User owner);

    Optional<ResearchPaper> findByIdAndOwner(UUID id, User owner);

    Optional<ResearchPaper> findByOwnerAndTitle(User owner, String title);

    @Query(value = """
            SELECT *
            FROM research_papers
            WHERE owner_id = :ownerId
            AND embedding IS NOT NULL
            AND (1 - (embedding <=> CAST(:queryEmbedding AS text)::vector)) >= :threshold
            ORDER BY embedding <=> CAST(:queryEmbedding AS text)::vector
            LIMIT :limit
            """, nativeQuery = true)
    List<ResearchPaper> semanticSearch(
            @Param("queryEmbedding") String embedding,
            @Param("limit") int limit,
            @Param("ownerId") UUID ownerId,
            @Param("threshold") double threshold);

}
