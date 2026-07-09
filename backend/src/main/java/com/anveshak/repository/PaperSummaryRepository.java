package com.anveshak.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.anveshak.model.PaperSummary;

public interface PaperSummaryRepository extends JpaRepository<PaperSummary, UUID> {

}
