package com.anveshak.service;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.anveshak.DTOs.PaperChunkDTO;
import com.anveshak.Exception.ResearchPaperNotFoundException;
import com.anveshak.model.PaperChunk;
import com.anveshak.model.ResearchPaper;
import com.anveshak.repository.PaperChunkRepository;
import com.pgvector.PGvector;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PaperChunkService {
    private final PaperChunkDTO paperChunkDTO;
    final private PdfService pdfService;
    final private PaperChunkRepository paperChunkRepository;
    final private ResearchPaperService researchPaperService;

    public PaperChunkService(PdfService pdfService, PaperChunkRepository paperChunkRepository,
            PaperChunkDTO paperChunkDTO, ResearchPaperService researchPaperService) {
        this.pdfService = pdfService;
        this.paperChunkRepository = paperChunkRepository;
        this.paperChunkDTO = paperChunkDTO;
        this.researchPaperService = researchPaperService;
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

    public List<PaperChunk> semanticSearch(PGvector embedding, int limit, UUID paperId) {

        if (embedding == null) {
            throw new IllegalArgumentException("Embedding cannot be null");
        }

        if (limit <= 0) {
            throw new IllegalArgumentException("Limit must be greater than 0");
        }

        if (paperId == null) {
            throw new IllegalArgumentException("Paper ID cannot be null");
        }

        if (!researchPaperService.doesPaperExist(paperId)) {
            log.warn("Paper with ID {} does not exist", paperId);
            throw new ResearchPaperNotFoundException(paperId);
        }
        return paperChunkRepository.semanticSearch(embedding, limit, paperId);
    }

}
