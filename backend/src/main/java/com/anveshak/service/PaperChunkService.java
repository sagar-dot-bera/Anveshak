package com.anveshak.service;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.anveshak.DTOs.PaperChunkDTO;
import com.anveshak.client.EmbeddingServiceClient;
import com.anveshak.model.PaperChunk;
import com.anveshak.model.ResearchPaper;
import com.anveshak.repository.PaperChunkRepository;
import com.pgvector.PGvector;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PaperChunkService {
    final private PdfService pdfService;
    final private PaperChunkRepository paperChunkRepository;
    final private EmbeddingServiceClient embeddingService;
    // final private ResearchPaperService researchPaperService;

    public PaperChunkService(PdfService pdfService, PaperChunkRepository paperChunkRepository,
            EmbeddingServiceClient embeddingService) {
        this.pdfService = pdfService;
        this.paperChunkRepository = paperChunkRepository;
        // this.researchPaperService = researchPaperService;
        this.embeddingService = embeddingService;
    }

    public List<PaperChunk> storePaperChunks(MultipartFile pdfFile, ResearchPaper researchPaper, int chunkSize)
            throws IOException {

        List<PaperChunkDTO> chunks = pdfService.extractChucks(pdfFile, chunkSize);
        List<PaperChunk> newPaperChunks = new ArrayList<>();
        for (PaperChunkDTO chunk : chunks) {
            PaperChunk paperChunk = new PaperChunk();
            paperChunk.setContent(chunk.content());
            paperChunk.setPageNumber(chunk.pageNumber());
            paperChunk.setChunkIndex(chunk.chunkIndex());
            paperChunk.setPaper(researchPaper);
            paperChunk.setCreatedAt(Instant.now());
            paperChunk.setEmbeddings(embeddingService.getEmbedding(chunk.content()));
            paperChunkRepository.save(paperChunk);
            newPaperChunks.add(paperChunk);
        }

        return newPaperChunks;
    }

    public List<PaperChunk> getChunksByPaperId(UUID paperId) {
        return paperChunkRepository.findAll().stream()
                .filter(chunk -> chunk.getPaper().getId().equals(paperId))
                .toList();
    }

    public List<PaperChunk> semanticSearch(String embedding, int limit, UUID paperId) {

        if (embedding == null) {
            log.warn("Embedding is null for semantic search");
            throw new IllegalArgumentException("Embedding cannot be null");
        }

        if (limit <= 0) {
            log.warn("Limit is less than or equal to 0 for semantic search");
            throw new IllegalArgumentException("Limit must be greater than 0");
        }

        if (paperId == null) {
            throw new IllegalArgumentException("Paper ID cannot be null");
        }
        log.info("Performing semantic search for paper ID: {}, limit: {}", paperId, limit);

        // if (!researchPaperService.doesPaperExist(paperId)) {
        // log.warn("Paper with ID {} does not exist", paperId);
        // throw new ResearchPaperNotFoundException(paperId);
        // }
        List<PaperChunk> result = paperChunkRepository.semanticSearch(embedding, limit, paperId);
        log.info("Semantic search returned {} chunks for paper ID {}", result.size(), paperId);
        return result;
    }

}
