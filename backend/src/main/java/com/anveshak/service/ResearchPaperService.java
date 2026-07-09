package com.anveshak.service;

import com.anveshak.AnveshakApplication;
import com.anveshak.DTOs.PaperSummaryResponse;
import com.anveshak.repository.RefreshTokenRepository;
import java.io.IOException;
import java.io.InputStream;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.anveshak.DTOs.InnerPaperSummaryDTO;
import com.anveshak.DTOs.NewPaperRequest;
import com.anveshak.DTOs.PaperComparisonResponse;
import com.anveshak.DTOs.PaperLookupRequest;
import com.anveshak.DTOs.PaperSearchRequest;
import com.anveshak.DTOs.ResearchPaperResponse;
import com.anveshak.DTOs.UpdatePaperRequest;
import com.anveshak.Exception.FailedToCreatePaperChunks;
import com.anveshak.Exception.FailedToCreatePaperSummary;
import com.anveshak.Exception.ResearchPaperNotFoundException;
import com.anveshak.client.EmbeddingServiceClient;
import com.anveshak.model.Author;
import com.anveshak.model.Keyword;
import com.anveshak.model.PaperChunk;
import com.anveshak.model.PaperSummary;
import com.anveshak.model.ResearchPaper;
import com.anveshak.model.User;
import com.anveshak.repository.AuthorRepository;
import com.anveshak.repository.KeywordRepository;
import com.anveshak.repository.ResearchPaperRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pgvector.PGvector;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ResearchPaperService {

    private final AnveshakApplication anveshakApplication;
    private final RefreshTokenRepository refreshTokenRepository;
    private final ResearchPaperRepository researchPaperRepository;
    private final AuthorRepository authorRepository;
    private final KeywordRepository keywordRepository;
    private final FileStorageService fileStorageService;
    private final EmbeddingServiceClient embeddingServiceClient;
    private final PaperChunkService paperChunkService;
    private final PdfService pdfService;
    private final PaperSummaryService paperSummaryService;
    private final GeminiService geminiService;
    private final PromptService promptService;
    private final int CHUNK_SIZE = 2000;

    public ResearchPaperService(ResearchPaperRepository researchPaperRepository, AuthorRepository authorRepository,
            KeywordRepository keywordRepository, FileStorageService fileStorageService,
            EmbeddingServiceClient embeddingServiceClient, PdfService pdfService, PaperChunkService paperChunkService,
            RefreshTokenRepository refreshTokenRepository, GeminiService geminiService,
            PaperSummaryService paperSummaryService, PromptService promptService,
            AnveshakApplication anveshakApplication) {
        this.researchPaperRepository = researchPaperRepository;
        this.authorRepository = authorRepository;
        this.keywordRepository = keywordRepository;
        this.fileStorageService = fileStorageService;
        this.embeddingServiceClient = embeddingServiceClient;
        this.paperChunkService = paperChunkService;
        this.pdfService = pdfService;
        this.refreshTokenRepository = refreshTokenRepository;

        this.geminiService = geminiService;
        this.promptService = promptService;
        this.paperSummaryService = paperSummaryService;
        this.anveshakApplication = anveshakApplication;
    }

    @Transactional
    public ResearchPaperResponse createPaper(User owner, NewPaperRequest request, MultipartFile pdfFile)
            throws IOException {
        validateOwner(owner);
        validateRequest(request);

        ResearchPaper paper = new ResearchPaper();
        paper.setOwner(owner);
        paper.setTitle(request.title().trim());
        paper.setAbstractText(request.abstractText().trim());
        paper.setPublicationYear(request.publicationYear());
        paper.setCreatedAt(Instant.now());
        paper.setUpdatedAt(Instant.now());
        paper.setAuthors(resolveAuthors(request.authors()));
        paper.setKeywords(resolveKeywords(request.keywords()));

        String fileText = pdfService.extractText(pdfFile);

        float[] embedding = embeddingServiceClient.getEmbedding(fileText);

        paper.setEmbedding(new PGvector(embedding));

        if (pdfFile != null && !pdfFile.isEmpty()) {
            paper.setPdfUrl(fileStorageService.upload(pdfFile));
        }

        List<PaperChunk> paperChunks = paperChunkService.storePaperChunks(pdfFile, paper, 2000);

        if (paperChunks == null || paperChunks.isEmpty()) {
            throw new FailedToCreatePaperChunks("Failed to create paper chunks for the uploaded PDF.");
        }

        String prompt = promptService.buildSummaryPrompt(paper, paperChunks);

        if (prompt == null || prompt.isBlank()) {
            throw new IllegalArgumentException("Prompt cannot be null or empty");
        }

        String summary = geminiService.generateAnswer(prompt);

        if (summary == null || summary.isBlank()) {
            throw new IllegalArgumentException("Summary cannot be null or empty");
        }

        ObjectMapper objectMapper = new ObjectMapper();
        InnerPaperSummaryDTO innerPaperSummaryDTO = objectMapper.readValue(summary, InnerPaperSummaryDTO.class);
        PaperSummary paperSummary = paperSummaryService.savePaperSummary(innerPaperSummaryDTO, paper);

        if (paperSummary == null) {
            throw new FailedToCreatePaperSummary("Failed to create paper summary.");
        }

        return toResponse(researchPaperRepository.save(paper));
    }

    @Transactional(readOnly = true)
    public List<ResearchPaperResponse> listPapers(User owner) {
        validateOwner(owner);
        return researchPaperRepository.findByOwnerOrderByCreatedAtDesc(owner).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ResearchPaperResponse getPaper(PaperLookupRequest request, User owner) {
        validateOwner(owner);
        return toResponse(loadOwnedPaper(request, owner));
    }

    @Transactional(readOnly = true)
    public InputStream downloadPaperPdf(PaperLookupRequest request, User owner) {
        ResearchPaper paper = loadOwnedPaper(request, owner);
        if (paper.getPdfUrl() == null || paper.getPdfUrl().isBlank()) {
            throw new IllegalArgumentException("Paper does not have a PDF attached");
        }

        return fileStorageService.download(paper.getPdfUrl());
    }

    @Transactional
    public ResearchPaperResponse updatePaper(PaperLookupRequest lookupRequest, UpdatePaperRequest request,
            MultipartFile pdfFile, User owner) throws IOException {
        validateOwner(owner);
        ResearchPaper paper = loadOwnedPaper(lookupRequest, owner);

        if (request.title() != null && !request.title().isBlank()) {
            paper.setTitle(request.title().trim());
        }

        if (request.abstractText() != null && !request.abstractText().isBlank()) {
            paper.setAbstractText(request.abstractText().trim());
        }

        if (request.publicationYear() != null) {
            paper.setPublicationYear(request.publicationYear());
        }

        if (request.authors() != null) {
            paper.setAuthors(resolveAuthors(request.authors()));
        }

        if (request.keywords() != null) {
            paper.setKeywords(resolveKeywords(request.keywords()));
        }

        if (pdfFile != null && !pdfFile.isEmpty()) {
            String previousStorageKey = paper.getPdfUrl();
            String newStorageKey = fileStorageService.upload(pdfFile);
            paper.setPdfUrl(newStorageKey);
            if (previousStorageKey != null && !previousStorageKey.isBlank()) {
                fileStorageService.delete(previousStorageKey);
            }
        }

        paper.setUpdatedAt(Instant.now());
        return toResponse(researchPaperRepository.save(paper));
    }

    @Transactional
    public void deletePaper(PaperLookupRequest request, User owner) {
        validateOwner(owner);

        ResearchPaper paper = loadOwnedPaper(request, owner);
        String storageKey = paper.getPdfUrl();
        researchPaperRepository.delete(paper);

        if (storageKey != null && !storageKey.isBlank()) {
            fileStorageService.delete(storageKey);
        }
    }

    @Transactional(readOnly = true)
    public List<ResearchPaperResponse> searchPapers(User owner, PaperSearchRequest request) {
        validateOwner(owner);

        List<ResearchPaper> ownedPapers = researchPaperRepository.findByOwnerOrderByCreatedAtDesc(owner);
        String query = request == null ? null : request.query();
        if (query == null || query.isBlank()) {
            return ownedPapers.stream().map(this::toResponse).toList();
        }

        String normalizedQuery = query.trim().toLowerCase(Locale.ROOT);
        List<ResearchPaperResponse> matches = new ArrayList<>();

        for (ResearchPaper paper : ownedPapers) {
            if (matchesQuery(paper, normalizedQuery)) {
                matches.add(toResponse(paper));
            }
        }

        return matches;
    }

    ResearchPaperResponse toResponse(ResearchPaper paper) {
        return new ResearchPaperResponse(
                paper.getId(),
                paper.getTitle(),
                paper.getAbstractText(),
                paper.getAuthors().stream().map(Author::getName).sorted().toList(),
                paper.getKeywords().stream().map(Keyword::getKeyword).sorted().toList(),
                paper.getPublicationYear(),
                paper.getPdfUrl(),
                paper.getCreatedAt(),
                paper.getUpdatedAt());
    }

    private ResearchPaper loadOwnedPaper(PaperLookupRequest request, User owner) {
        if (request == null || request.paperId() == null) {
            throw new IllegalArgumentException("Paper id cannot be null");
        }

        return researchPaperRepository.findByIdAndOwner(request.paperId(), owner)
                .orElseThrow(() -> new ResearchPaperNotFoundException(request.paperId()));
    }

    private void validateOwner(User owner) {
        if (owner == null) {
            throw new IllegalArgumentException("Owner cannot be null");
        }
    }

    private void validateRequest(NewPaperRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Paper request cannot be null");
        }

        if (request.title() == null || request.title().isBlank()) {
            throw new IllegalArgumentException("title cannot be null or empty");
        }

        if (request.abstractText() == null || request.abstractText().isBlank()) {
            throw new IllegalArgumentException("abstractText cannot be null or empty");
        }

        if (request.authors() == null || request.authors().length == 0) {
            throw new IllegalArgumentException("At least one author is required");
        }
    }

    private Set<Author> resolveAuthors(String[] authorNames) {
        Set<Author> authors = new HashSet<>();

        for (String rawAuthorName : authorNames) {
            if (rawAuthorName == null || rawAuthorName.isBlank()) {
                continue;
            }

            String authorName = rawAuthorName.trim();
            Author author = authorRepository.findByNameIgnoreCase(authorName)
                    .orElseGet(() -> {
                        Author newAuthor = new Author();
                        newAuthor.setName(authorName);
                        return authorRepository.save(newAuthor);
                    });
            authors.add(author);
        }

        if (authors.isEmpty()) {
            throw new IllegalArgumentException("At least one valid author is required");
        }

        return authors;
    }

    private Set<Keyword> resolveKeywords(String[] keywordNames) {
        Set<Keyword> keywords = new HashSet<>();

        if (keywordNames == null) {
            return keywords;
        }

        for (String rawKeywordName : keywordNames) {
            if (rawKeywordName == null || rawKeywordName.isBlank()) {
                continue;
            }

            String keywordName = rawKeywordName.trim();
            Keyword keyword = keywordRepository.findByKeywordIgnoreCase(keywordName)
                    .orElseGet(() -> {
                        Keyword newKeyword = new Keyword();
                        newKeyword.setKeyword(keywordName);
                        return keywordRepository.save(newKeyword);
                    });
            keywords.add(keyword);
        }

        return keywords;
    }

    private boolean matchesQuery(ResearchPaper paper, String normalizedQuery) {
        if (containsIgnoreCase(paper.getTitle(), normalizedQuery)
                || containsIgnoreCase(paper.getAbstractText(), normalizedQuery)
                || containsIgnoreCase(String.valueOf(paper.getPublicationYear()), normalizedQuery)) {
            return true;
        }

        for (Author author : paper.getAuthors()) {
            if (containsIgnoreCase(author.getName(), normalizedQuery)) {
                return true;
            }
        }

        for (Keyword keyword : paper.getKeywords()) {
            if (containsIgnoreCase(keyword.getKeyword(), normalizedQuery)) {
                return true;
            }
        }

        return false;
    }

    private boolean containsIgnoreCase(String value, String normalizedQuery) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(normalizedQuery);
    }

    public List<ResearchPaperResponse> semanticSearch(String query, User owner) {
        if (query == null) {
            log.warn("Query is null, returning empty list");
            throw new IllegalArgumentException("Query cannot be null");
        }

        float[] embedding = embeddingServiceClient.getEmbedding(query);

        List<ResearchPaper> papers = researchPaperRepository.semanticSearch(new PGvector(embedding), 10, owner.getId());

        List<ResearchPaperResponse> matches = new ArrayList<>();

        for (ResearchPaper paper : papers) {
            matches.add(toResponse(paper));
        }

        return matches;
    }

    public boolean doesPaperExist(UUID paperId) {
        if (paperId == null) {
            throw new IllegalArgumentException("Paper id cannot be null");
        }

        return researchPaperRepository.existsById(paperId);

    }

    public ResearchPaper findPaperById(UUID id) {
        if (!doesPaperExist(id)) {
            throw new ResearchPaperNotFoundException(id);
        }

        return researchPaperRepository.findById(id).get();
    }

    public List<ResearchPaper> getPapers(String[] paperIds) {
        List<ResearchPaper> papers = new ArrayList<>();
        for (String id : paperIds) {
            researchPaperRepository.findById(UUID.fromString(id)).ifPresent(papers::add);
        }

        return papers;
    }

    public List<ResearchPaper> getPapersByIds(String[] paperIdStrings) {
        List<ResearchPaper> papers = new ArrayList<>();

        for (String idString : paperIdStrings) {

            UUID paperId = UUID.fromString(idString);
            Optional<ResearchPaper> paper = researchPaperRepository.findById(paperId);

            if (paper.isPresent()) {
                papers.add(paper.get());
            } else {
                log.warn("Paper not found with id: {}", paperId);
            }

        }
        return papers;
    }

}