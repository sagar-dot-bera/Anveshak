package com.anveshak.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.anveshak.model.Roadmap;

public interface RoadmapRepository extends JpaRepository<Roadmap, UUID> {

}
