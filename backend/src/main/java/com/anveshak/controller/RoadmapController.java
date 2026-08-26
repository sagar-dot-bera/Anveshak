package com.anveshak.controller;

import java.util.List;

import org.checkerframework.checker.units.qual.Current;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.anveshak.DTOs.RoadmapDTO;
import com.anveshak.DTOs.RoadmapRequest;
import com.anveshak.DTOs.RoadmapShort;
import com.anveshak.service.CurrentUserResolver;
import com.anveshak.service.ResearchRoadmapService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;

import org.springframework.web.bind.annotation.RequestBody;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/roadmaps")
@RequiredArgsConstructor
public class RoadmapController {

    private final ResearchRoadmapService roadmapService;
    private final CurrentUserResolver currentUserResolver;

    @PostMapping("/generate")
    public ResponseEntity<RoadmapDTO> generateRoadmap(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestBody @Valid RoadmapRequest roadmapRequest) throws JsonMappingException, JsonProcessingException {
        currentUserResolver.resolveUser(authorizationHeader);
        RoadmapDTO roadmapDTO = roadmapService.createNewRoadmap(roadmapRequest);
        return ResponseEntity.ok(roadmapDTO);
    }

    @GetMapping("/roadmaps")
    public ResponseEntity<List<RoadmapShort>> getAllRoadmaps(
            @RequestHeader("Authorization") String authorizationHeader) {
        currentUserResolver.resolveUser(authorizationHeader);
        return ResponseEntity.ok(roadmapService.getAllRoadmaps());
    }

    @GetMapping("/{roadmapId}")
    public ResponseEntity<RoadmapDTO> getRoadmapById(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable String roadmapId) {
        currentUserResolver.resolveUser(authorizationHeader);
        RoadmapDTO roadmapDTO = roadmapService.getRoadmapById(roadmapId);
        return ResponseEntity.ok(roadmapDTO);
    }

}
