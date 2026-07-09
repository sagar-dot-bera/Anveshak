package com.anveshak.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.anveshak.model.Keyword;

@Repository
public interface KeywordRepository extends JpaRepository<Keyword, UUID> {

    Optional<Keyword> findByKeywordIgnoreCase(String keyword);

}