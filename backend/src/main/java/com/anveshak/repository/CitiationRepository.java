package com.anveshak.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.anveshak.model.PaperCitation;
import com.anveshak.model.User;

@Repository
public interface CitiationRepository extends JpaRepository<PaperCitation, UUID> {

    List<PaperCitation> findByCitingPaper_IdOrderByCreatedAtDesc(UUID citingPaperId);

    boolean existsByCitingPaper_IdAndCitedPaper_Id(UUID citingPaperId, UUID citedPaperId);

}
