package com.anveshak.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.anveshak.DTOs.GlobalPaperDTO;
import com.anveshak.DTOs.PaperComparisonResponse;
import com.anveshak.DTOs.RoadmapDTO;
import com.anveshak.DTOs.RoadmapRequest;
import com.anveshak.DTOs.RoadmapResponse;
import com.anveshak.DTOs.RoadmapShort;
import com.anveshak.DTOs.RoadmapStageDTO;
import com.anveshak.client.EmbeddingServiceClient;
import com.anveshak.model.GlobalPaper;
import com.anveshak.model.Roadmap;
import com.anveshak.model.RoadmapStage;
import com.anveshak.model.RoadmapStagePaper;
import com.anveshak.model.RoadmapStagePaperId;
import com.anveshak.model.User;
import com.anveshak.repository.RoadmapRepository;
import com.anveshak.repository.RoadmapStagePaperRepository;
import com.anveshak.repository.RoadmapStageRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pgvector.PGvector;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ResearchRoadmapService {
    private final RoadmapRepository roadmapRepository;
    private final RoadmapStageRepository roadmapStageRepository;
    private final RoadmapStagePaperRepository roadmapStagePaperRepository;
    private final GeminiService geminiService;
    private final PromptService promptService;

    private final GlobalPaperService globalPaperService;

    ResearchRoadmapService(RoadmapRepository roadmapRepository, RoadmapStageRepository roadmapStageRepository,
            RoadmapStagePaperRepository roadmapStagePaperRepository, GeminiService geminiService,
            PromptService promptService, GlobalPaperService globalPaperService) {
        this.roadmapRepository = roadmapRepository;
        this.roadmapStageRepository = roadmapStageRepository;
        this.roadmapStagePaperRepository = roadmapStagePaperRepository;
        this.geminiService = geminiService;
        this.promptService = promptService;

        this.globalPaperService = globalPaperService;
    }

    public List<RoadmapShort> getAllRoadmaps() {
        List<Roadmap> roadmaps = roadmapRepository.findAll();
        List<RoadmapShort> roadmapShorts = new ArrayList<>();

        for (Roadmap roadmap : roadmaps) {
            RoadmapShort roadmapShort = new RoadmapShort();
            roadmapShort.setId(roadmap.getId().toString());
            roadmapShort.setTitle(roadmap.getTitle());
            roadmapShort.setTopic(roadmap.getTopic());
            roadmapShort.setDescription(roadmap.getDescription());
            roadmapShorts.add(roadmapShort);
        }

        log.info("Retrieved {} roadmaps from the database.", roadmapShorts.size());

        return roadmapShorts;
    }

    public RoadmapDTO getRoadmapById(String roadmapId) {
        Roadmap roadmap = roadmapRepository.findById(UUID.fromString(roadmapId)).orElse(null);
        if (roadmap == null) {
            return null;
        }

        List<RoadmapStage> stages = getRoadmapStages(roadmap);

        List<RoadmapStageDTO> stageDTOs = getRoadmapStageDTOs(stages);

        RoadmapDTO roadmapDTO = new RoadmapDTO();
        roadmapDTO.setTitle(roadmap.getTitle());
        roadmapDTO.setDescription(roadmap.getDescription());
        roadmapDTO.setTopic(roadmap.getTopic());
        roadmapDTO.setCreatedAt(roadmap.getCreatedAt());
        roadmapDTO.setStages(stageDTOs);

        log.info("Retrieved roadmap: {} with {} stages.", roadmap.getTitle(), stageDTOs.size());

        return roadmapDTO;
    }

    public RoadmapDTO createNewRoadmap(RoadmapRequest roadmapRequest)
            throws JsonMappingException, JsonProcessingException {
        String userTopic = roadmapRequest.request().trim();
        RoadmapResponse roadmapResponse = generateRoadmap(userTopic);

        log.info("Generated roadmap response with title: {} and AI-topic: {}", roadmapResponse.title(),
                roadmapResponse.topic());

        // Override AI-generated topic with the exact topic the user entered
        RoadmapResponse correctedResponse = new RoadmapResponse(
                roadmapResponse.title(),
                roadmapResponse.description(),
                userTopic,
                roadmapResponse.stages());

        Roadmap roadmap = saveRoadmap(correctedResponse);

        List<RoadmapStage> savedStages = saveRoadmapStages(roadmap, correctedResponse);

        List<RoadmapStageDTO> stageDTOs = saveAndgetRoadmapStageDTO(savedStages);

        RoadmapDTO roadmapDTO = new RoadmapDTO();
        roadmapDTO.setTitle(roadmap.getTitle());
        roadmapDTO.setDescription(roadmap.getDescription());
        roadmapDTO.setTopic(roadmap.getTopic());
        roadmapDTO.setCreatedAt(roadmap.getCreatedAt());
        roadmapDTO.setStages(stageDTOs);

        return roadmapDTO;
    }

    public List<RoadmapStage> getRoadmapStages(Roadmap roadmap) {
        return roadmapStageRepository.findAllByRoadmapOrderByStageOrderAsc(roadmap);
    }

    public List<RoadmapStageDTO> getRoadmapStageDTOs(List<RoadmapStage> stages) {
        List<RoadmapStageDTO> stageDTOs = new ArrayList<>();
        for (RoadmapStage stage : stages) {

            List<RoadmapStagePaper> roadmapStagePaper = roadmapStagePaperRepository.findAllByStageOrderByRankAsc(stage);

            List<GlobalPaperDTO> paperDTOs = new ArrayList<>();

            for (RoadmapStagePaper stagePaper : roadmapStagePaper) {
                GlobalPaper paper = stagePaper.getPaper();
                paperDTOs.add(globalPaperService.toGlobalPaperDTO(paper));
            }

            RoadmapStageDTO stageDTO = new RoadmapStageDTO();
            stageDTO.setTitle(stage.getTitle());
            stageDTO.setDescription(stage.getDescription());
            stageDTO.setOrder(stage.getStageOrder());
            stageDTOs.add(stageDTO);
            stageDTO.setPapers(paperDTOs);
        }
        return stageDTOs;
    }

    public List<RoadmapStageDTO> saveAndgetRoadmapStageDTO(List<RoadmapStage> stages) {
        List<RoadmapStageDTO> stageDTOs = new ArrayList<>();

        for (RoadmapStage stage : stages) {

            List<GlobalPaper> papers = globalPaperService
                    .semanticSearchGlobalPapers(stage.getDescription() + stage.getTitle(), 2);
            List<GlobalPaperDTO> paperDTOs = new ArrayList<>();
            int rank = 1;
            for (GlobalPaper paper : papers) {
                log.info("Paper: {} with title: {}", paper.getId());
                saveRoadmapStagePaper(stage, paper, rank++);
                paperDTOs.add(globalPaperService.toGlobalPaperDTO(paper));
            }

            RoadmapStageDTO stageDTO = new RoadmapStageDTO();
            stageDTO.setTitle(stage.getTitle());
            stageDTO.setDescription(stage.getDescription());
            stageDTO.setOrder(stage.getStageOrder());
            stageDTO.setPapers(paperDTOs);
            stageDTOs.add(stageDTO);
            log.info("Stage: {} with title: {} has {} papers", stage.getId(), stage.getTitle(), paperDTOs.size());
        }

        return stageDTOs;

    }

    public RoadmapStagePaper saveRoadmapStagePaper(RoadmapStage roadmapStage, GlobalPaper globalPaper, int rank) {
        RoadmapStagePaperId id = new RoadmapStagePaperId(roadmapStage.getId(), globalPaper.getId());
        RoadmapStagePaper roadmapStagePaper = new RoadmapStagePaper();
        roadmapStagePaper.setId(id);
        roadmapStagePaper.setStage(roadmapStage);
        roadmapStagePaper.setPaper(globalPaper);
        roadmapStagePaper.setRank(rank);

        return roadmapStagePaperRepository.save(roadmapStagePaper);
    }

    public List<RoadmapStage> saveRoadmapStages(Roadmap roadmap, RoadmapResponse roadmapResponse) {
        List<RoadmapStage> savedStages = new ArrayList<>();

        for (int i = 0; i < roadmapResponse.stages().size(); i++) {
            var stageResponse = roadmapResponse.stages().get(i);
            RoadmapStage stage = new RoadmapStage();
            stage.setRoadmap(roadmap);
            stage.setStageOrder(i + 1);
            stage.setTitle(stageResponse.title());
            stage.setDescription(stageResponse.description());

            RoadmapStage savedStage = roadmapStageRepository.save(stage);
            savedStages.add(savedStage);

            log.info("Saved stage: {} for roadmap: {}", savedStage.getId(), roadmap.getId());

        }

        return savedStages;
    }

    public Roadmap saveRoadmap(RoadmapResponse roadResponse) {
        if (roadResponse == null) {
            log.error("Roadmap response is null, cannot save roadmap.");
            return null;
        }

        Roadmap roadmap = new Roadmap();
        roadmap.setTitle(roadResponse.title());
        roadmap.setDescription(roadResponse.description());
        roadmap.setTopic(roadResponse.topic());
        roadmap.setCreatedAt(Instant.now());
        roadmap.setUpdatedAt(Instant.now());
        log.info("Saving roadmap: {} with topic: {}", roadmap.getTitle(), roadmap.getTopic());
        return roadmapRepository.save(roadmap);
    }

    public RoadmapResponse generateRoadmap(String requestString) throws JsonMappingException, JsonProcessingException {
        String prompt = promptService.buildRoadmapPrompt(requestString);
        log.info("roadmap prompt: {}", prompt.length());

        String response = geminiService.generateAnwerInJSON(prompt, geminiService.roadmapSchema());

        log.info("roadmap response: {}", response);

        ObjectMapper objectMapper = new ObjectMapper();
        RoadmapResponse roadmapResponse = objectMapper.readValue(response,
                RoadmapResponse.class);

        return roadmapResponse;
    }

}