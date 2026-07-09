package com.anveshak.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.anveshak.model.ResearchCollection;
import com.anveshak.model.User;

@Repository
public interface ResearchCollectionRepository extends JpaRepository<ResearchCollection, UUID> {

    List<ResearchCollection> findByOwnerOrderByCreatedAtDesc(User owner);

    Optional<ResearchCollection> findByIdAndOwner(UUID id, User owner);

}