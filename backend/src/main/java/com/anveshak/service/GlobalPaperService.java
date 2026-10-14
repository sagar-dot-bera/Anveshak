package com.anveshak.service;

import java.io.InputStream;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.anveshak.DTOs.GlobalPaperDTO;
import com.anveshak.DTOs.HarvestResult;
import com.anveshak.client.EmbeddingServiceClient;
import com.anveshak.model.GlobalPaper;
import com.anveshak.repository.GlobalPaperRepository;
import com.pgvector.PGvector;

import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class GlobalPaperService {
    private final XMLParser xmlParser;
    private final RestTemplate restTemplate;
    private final GlobalPaperRepository globalPaperRepository;
    private final EmbeddingServiceClient embeddingServiceClient;

    private static final String ARXIV_SOURCE = "Arxiv";
    private static final int SAVE_BATCH_SIZE = 100;
    private static final int MAX_HARVEST_PAGES = 30;

    private final AtomicBoolean harvestRunning = new AtomicBoolean(false);
    private final ExecutorService harvestExecutor = Executors.newSingleThreadExecutor();

    @Value("${arXiv.base-url}")
    String baseUrl;

    @Value("${arXiv.paper-base-url}")
    String paperBaseUrl;

    @Value("${arXiv.paper-pdf-base-url}")
    String pdfBaseUrl;

    public GlobalPaperService(XMLParser xmlParser, RestTemplate restTemplate,
            GlobalPaperRepository globalPaperRepository, EmbeddingServiceClient embeddingServiceClient) {
        this.xmlParser = xmlParser;
        this.restTemplate = restTemplate;
        this.globalPaperRepository = globalPaperRepository;
        this.embeddingServiceClient = embeddingServiceClient;
    }

    public HarvestResult processPapers(InputStream inputStream) throws XMLStreamException {
        XMLInputFactory factory = XMLInputFactory.newFactory();
        List<GlobalPaper> batch = new ArrayList<>(SAVE_BATCH_SIZE);
        Set<String> idsInBatch = new HashSet<>();
        XMLStreamReader reader = factory.createXMLStreamReader(inputStream);
        int newPapers = 0;
        int skippedPapers = 0;
        String resumptionToken = null;
        while (reader.hasNext()) {

            int event = reader.next();

            if (event == XMLStreamConstants.START_ELEMENT) {
                if (reader.getLocalName().equals("record")) {

                    GlobalPaperDTO paper = xmlParser.parseRecord(reader);
                    log.debug("Parsed paper: {}", paper);

                    // Re-harvests see papers already stored; skip them before paying for an
                    // embedding, and so saveAll doesn't hit uq_source_external.
                    if (paper.getPaperId() == null
                            || !idsInBatch.add(paper.getPaperId())
                            || globalPaperRepository.existsBySourceAndExternalId(ARXIV_SOURCE, paper.getPaperId())) {
                        skippedPapers++;
                        continue;
                    }

                    batch.add(fromArxivToGlobalPaper(paper));
                    newPapers++;
                    if (batch.size() == SAVE_BATCH_SIZE) {
                        globalPaperRepository.saveAll(batch);
                        batch.clear();
                        idsInBatch.clear();
                    }
                }

                if (reader.getLocalName().equals("resumptionToken")) {
                    resumptionToken = reader.getElementText();
                }
            }

        }

        if (!batch.isEmpty()) {
            globalPaperRepository.saveAll(batch);
        }

        log.info("Harvest page done: {} new papers, {} skipped", newPapers, skippedPapers);

        // The last page carries an empty <resumptionToken/>, which means "no more pages".
        if (resumptionToken != null && resumptionToken.isBlank()) {
            resumptionToken = null;
        }
        return new HarvestResult(resumptionToken);
    }

    GlobalPaper fromArxivToGlobalPaper(GlobalPaperDTO arxivPaper) {
        GlobalPaper newGlobalPaper = new GlobalPaper();
        String text = """
                Title:
                %s

                Abstract:
                %s
                """.formatted(
                arxivPaper.getTitle(),
                arxivPaper.getAbstractText());
        float[] embedding = embeddingServiceClient
                .getEmbedding(text);


        newGlobalPaper.setTitle(arxivPaper.getTitle());
        newGlobalPaper.setAbstractText(arxivPaper.getAbstractText());
        newGlobalPaper.setEmbedding(embedding);
        newGlobalPaper.setExternalId(arxivPaper.getPaperId());
        newGlobalPaper.setCategories(arxivPaper.getCategories());
        newGlobalPaper.setDoi(arxivPaper.getDoi());
        newGlobalPaper.setCreatedAt(Instant.now());
        newGlobalPaper.setIndexedAt(Instant.now());
        newGlobalPaper.setAuthors(arxivPaper.getAuthors());
        newGlobalPaper.setPublishedAt(arxivPaper.getCreated());
        newGlobalPaper.setUpdatedAt(arxivPaper.getUpdated());
        newGlobalPaper.setPaperUrl(paperBaseUrl + "/" + arxivPaper.getPaperId());
        newGlobalPaper.setPdfUrl(pdfBaseUrl + "/" + arxivPaper.getPaperId());
        newGlobalPaper.setSource(ARXIV_SOURCE);
        return newGlobalPaper;
    }

    /**
     * Starts an arXiv harvest in the background. Returns false without starting
     * anything if a harvest is already running.
     */
    public boolean startHarvest() {
        if (!harvestRunning.compareAndSet(false, true)) {
            return false;
        }

        harvestExecutor.submit(() -> {
            try {
                harvestPaper();
            } catch (Exception e) {
                log.error("arXiv harvest failed", e);
            } finally {
                harvestRunning.set(false);
            }
        });
        return true;
    }

    @PreDestroy
    void shutdownHarvestExecutor() {
        harvestExecutor.shutdownNow();
    }

    void harvestPaper() {

        String token = null;
        int batchCount = 0;
        do {
            String url;

            if (token == null) {
                url = baseUrl + "?verb=ListRecords&metadataPrefix=arXiv&set=cs";
            } else {
                url = baseUrl + "?verb=ListRecords&resumptionToken=" + token;
            }

            HarvestResult result = restTemplate.execute(
                    url,
                    HttpMethod.GET,
                    null,
                    response -> {
                        try {
                            return processPapers(response.getBody());
                        } catch (XMLStreamException e) {
                            log.error(e.getMessage());
                            return null;
                        }
                    });

            if (result == null) {
                log.error("Stopping arXiv harvest: could not parse page {}", batchCount + 1);
                return;
            }

            token = result.resumptionToken();
            batchCount++;
            log.info("Harvested page {}, next token: {}", batchCount, token);
        } while (token != null && batchCount < MAX_HARVEST_PAGES);

        log.info("arXiv harvest finished after {} pages", batchCount);

    }

    public List<GlobalPaperDTO> sematicSearchOnPaper(float[] queryEmbedding, int limit, double threshold) {

        PGvector queryVector = new PGvector(queryEmbedding);
        List<GlobalPaper> papers = globalPaperRepository.semanticSearch(queryVector.toString(), limit, threshold);

        List<GlobalPaperDTO> paperDTOs = new ArrayList<>();
        for (GlobalPaper paper : papers) {
            GlobalPaperDTO dto = new GlobalPaperDTO();
            dto.setTitle(paper.getTitle());
            dto.setAbstractText(paper.getAbstractText());
            dto.setAuthors(paper.getAuthors());
            dto.setCategories(paper.getCategories());
            dto.setCreated(paper.getPublishedAt());
            dto.setUpdated(paper.getUpdatedAt());
            dto.setPaperId(paper.getExternalId());
            dto.setDoi(paper.getDoi());
            dto.setPaperUrl(paper.getPaperUrl());
            dto.setPdfUrl(paper.getPdfUrl());
            paperDTOs.add(dto);
        }

        return paperDTOs;
    }

    public List<GlobalPaper> semanticSearchGlobalPapers(String query, int limit) {
        float[] queryEmbedding = embeddingServiceClient.getEmbedding(query);
        PGvector queryVector = new PGvector(queryEmbedding);
        // Use threshold 0.0 to return all results ordered by relevance
        List<GlobalPaper> papers = globalPaperRepository.semanticSearch(queryVector.toString(), limit, 0.0);

        return papers;
    }

    public GlobalPaperDTO toGlobalPaperDTO(GlobalPaper paper) {
        GlobalPaperDTO dto = new GlobalPaperDTO();
        dto.setTitle(paper.getTitle());
        dto.setAbstractText(paper.getAbstractText());
        dto.setAuthors(paper.getAuthors());
        dto.setCategories(paper.getCategories());
        dto.setCreated(paper.getPublishedAt());
        dto.setUpdated(paper.getUpdatedAt());
        dto.setPaperId(paper.getExternalId());
        dto.setDoi(paper.getDoi());
        dto.setPaperUrl(paper.getPaperUrl());
        dto.setPdfUrl(paper.getPdfUrl());

        return dto;
    }

}
