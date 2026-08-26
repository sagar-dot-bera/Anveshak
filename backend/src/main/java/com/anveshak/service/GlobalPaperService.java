package com.anveshak.service;

import java.io.InputStream;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

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

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class GlobalPaperService {
    private final XMLParser xmlParser;
    private final RestTemplate restTemplate;
    private final GlobalPaperRepository globalPaperRepository;
    private final EmbeddingServiceClient embeddingServiceClient;

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
        List<GlobalPaper> batch = new ArrayList<>(100);
        XMLStreamReader reader = factory.createXMLStreamReader(inputStream);
        int paperCount = 0;
        String resumptionToken = null;
        while (reader.hasNext()) {

            int event = reader.next();

            if (event == XMLStreamConstants.START_ELEMENT) {
                if (reader.getLocalName().equals("record")) {

                    GlobalPaperDTO paper = xmlParser.parseRecord(reader);
                    log.info("Parsed paper: {}", paper);
                    batch.add(fromArxivToGlobalPaper(paper));
                    if (batch.size() == 100) {
                        globalPaperRepository.saveAll(batch);
                        batch.clear();
                    }
                    paperCount++;
                    log.info("=*=*=*=*=*=*=*=> Paper {}", paperCount);
                }

                if (event == XMLStreamConstants.START_ELEMENT
                        && reader.getLocalName().equals("resumptionToken")) {
                    resumptionToken = reader.getElementText();
                    log.info("Resumption token: {}", resumptionToken);
                }
            }

        }

        return new HarvestResult(resumptionToken);
    }

    GlobalPaper fromArxivToGlobalPaper(GlobalPaperDTO arxivPaper) {
        GlobalPaper newGlobalPaper = new GlobalPaper();
        log.info("Processing arxiv paper");
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

        log.info("arxiv paper embedding:" + embedding.toString());

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
        newGlobalPaper.setSource("Arxiv");

        log.info("Paper processing complete");
        log.info("Paper to add" + newGlobalPaper.toString());
        return newGlobalPaper;
    }

    public void harvestPaper() {

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

            token = result.resumptionToken();
            batchCount++;
            log.info("Next token: {}", token);
        } while (token != null || batchCount != 30);

    }

    public List<GlobalPaperDTO> sematicSearchOnPaper(String query, int limit, double threshold) {

        float[] queryEmbedding = embeddingServiceClient.getEmbedding(query);
        PGvector queryVector = new PGvector(queryEmbedding);
        log.info("query embeddings" + queryVector.toString());
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
        log.info("query embeddings" + queryVector.toString());
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
