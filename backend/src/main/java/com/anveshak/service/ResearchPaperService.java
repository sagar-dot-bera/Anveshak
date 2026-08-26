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
import com.anveshak.Exception.EmailNotVerifiedException;
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

import com.pgvector.PGvector;

import java.io.ByteArrayInputStream;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import com.anveshak.DTOs.ImportPaperRequest;
import com.anveshak.model.GlobalPaper;
import com.anveshak.repository.GlobalPaperRepository;
import com.anveshak.repository.PaperSummaryRepository;
import com.anveshak.repository.ChatSessionRepository;
import com.anveshak.repository.PaperChunkRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ResearchPaperService {

    private final ResearchPaperRepository researchPaperRepository;
    private final AuthorRepository authorRepository;
    private final KeywordRepository keywordRepository;
    private final FileStorageService fileStorageService;
    private final EmbeddingServiceClient embeddingServiceClient;
    private final PaperChunkService paperChunkService;
    private final PdfService pdfService;
    private final PaperSummaryService paperSummaryService;
    private final GlobalPaperRepository globalPaperRepository;
    private final PaperChunkRepository paperChunkRepository;
    private final PaperSummaryRepository paperSummaryRepository;
    private final ChatSessionRepository chatSessionRepository;
    private final RestTemplate restTemplate;

    public ResearchPaperService(ResearchPaperRepository researchPaperRepository, AuthorRepository authorRepository,
            KeywordRepository keywordRepository, FileStorageService fileStorageService,
            EmbeddingServiceClient embeddingServiceClient, PdfService pdfService, PaperChunkService paperChunkService,
            GeminiService geminiService,
            PaperSummaryService paperSummaryService, PromptService promptService,
            GlobalPaperRepository globalPaperRepository, PaperChunkRepository paperChunkRepository,
            PaperSummaryRepository paperSummaryRepository, ChatSessionRepository chatSessionRepository,
            RestTemplate restTemplate) {
        this.researchPaperRepository = researchPaperRepository;
        this.authorRepository = authorRepository;
        this.keywordRepository = keywordRepository;
        this.fileStorageService = fileStorageService;
        this.embeddingServiceClient = embeddingServiceClient;
        this.paperChunkService = paperChunkService;
        this.pdfService = pdfService;
        this.paperSummaryService = paperSummaryService;
        this.globalPaperRepository = globalPaperRepository;
        this.paperChunkRepository = paperChunkRepository;
        this.paperSummaryRepository = paperSummaryRepository;
        this.chatSessionRepository = chatSessionRepository;
        this.restTemplate = restTemplate;
    }

    @Transactional
    public ResearchPaperResponse createPaper(User owner, NewPaperRequest request, MultipartFile pdfFile)
            throws IOException {
        validateOwner(owner);
        validateRequest(request);
        if (pdfFile == null || pdfFile.isEmpty()) {
            throw new IllegalArgumentException("PDF file is required for creating a paper.");
        }
        return saveAndProcessPaper(owner, request.title(), request.abstractText(), request.publicationYear(), request.authors(), request.keywords(), pdfFile);
    }

    private ResearchPaperResponse saveAndProcessPaper(User owner, String title, String abstractText, Integer publicationYear, String[] authors, String[] keywords, MultipartFile pdfFile) throws IOException {
        ResearchPaper paper = new ResearchPaper();
        paper.setOwner(owner);
        paper.setTitle(title.trim());
        paper.setAbstractText(abstractText != null && !abstractText.isBlank() ? abstractText.trim() : "Title: " + title.trim());
        paper.setPublicationYear(publicationYear != null ? publicationYear : Instant.now().atZone(java.time.ZoneId.systemDefault()).getYear());
        paper.setCreatedAt(Instant.now());
        paper.setUpdatedAt(Instant.now());
        paper.setAuthors(resolveAuthors(authors));
        paper.setKeywords(resolveKeywords(keywords));

        String fileText = pdfService.extractText(pdfFile);
        if (fileText == null || fileText.isBlank()) {
            fileText = "Title: " + paper.getTitle() + "\nAbstract: " + paper.getAbstractText();
        }
        log.info("Extracted text from PDF: {}", fileText.substring(0, Math.min(fileText.length(), 20)) + "...");
        float[] embedding = embeddingServiceClient.getEmbedding(fileText);

        log.info("Generated embeddings from file: {}", embedding.length);

        paper.setEmbedding(embedding);

        if (pdfFile != null && !pdfFile.isEmpty()) {
            paper.setPdfUrl(fileStorageService.upload(pdfFile));
        }
        paper = researchPaperRepository.save(paper);
        log.info("Storing paper chunks for PDF: {}", pdfFile.getOriginalFilename());
        List<PaperChunk> paperChunks = paperChunkService.storePaperChunks(pdfFile, paper, 2000);

        if (paperChunks == null || paperChunks.isEmpty()) {
            PaperChunk fallbackChunk = new PaperChunk();
            fallbackChunk.setPaper(paper);
            fallbackChunk.setContent("Title: " + paper.getTitle() + "\n\nAbstract:\n" + paper.getAbstractText());
            fallbackChunk.setPageNumber(1);
            fallbackChunk.setChunkIndex(0);
            fallbackChunk.setEmbeddings(embedding);
            fallbackChunk.setCreatedAt(Instant.now());
            paperChunks = List.of(paperChunkRepository.save(fallbackChunk));
        }

        log.info("Stored {} paper chunks for paper ID: {}", paperChunks.size(), paper.getId());

        PaperSummary paperSummary = paperSummaryService.savePaperSummary(paperChunks, paper);
        log.info("Saved paper summary for paper ID: {}", paper.getId());

        return toResponse(paper);
    }

    @Transactional
    public ResearchPaperResponse importPaper(User owner, ImportPaperRequest request) {
        validateOwner(owner);
        if (request == null || request.title() == null || request.title().isBlank()) {
            throw new IllegalArgumentException("Paper title cannot be empty for import");
        }

        String paperTitle = request.title().trim();

        // 1. Check if paper already exists for this user
        Optional<ResearchPaper> existingPaper = researchPaperRepository.findByOwnerAndTitle(owner, paperTitle);
        if (existingPaper.isPresent()) {
            ResearchPaper p = existingPaper.get();
            log.info("Paper '{}' already exists in library for user {}", paperTitle, owner.getId());
            if (paperSummaryRepository.findById(p.getId()).isEmpty()) {
                List<PaperChunk> chunks = paperChunkRepository.findByPaperOrderByChunkIndexAsc(p);
                paperSummaryService.savePaperSummary(chunks, p);
            }
            return toResponse(p);
        }

        // 2. Resolve external PDF download URL
        String pdfLink = request.pdfUrl();
        if (pdfLink == null || pdfLink.isBlank()) {
            if (request.paperId() != null && !request.paperId().isBlank()) {
                String rawId = request.paperId().trim();
                if (rawId.startsWith("http://") || rawId.startsWith("https://")) {
                    pdfLink = rawId;
                } else {
                    pdfLink = "https://arxiv.org/pdf/" + rawId + ".pdf";
                }
            }
        }

        // 3. Download the actual PDF bytes from the URL
        byte[] pdfBytes = null;
        if (pdfLink != null && !pdfLink.isBlank()) {
            pdfBytes = fetchPdfBytes(pdfLink);
        }

        // 4. Require valid PDF bytes from source; throw exception if missing or invalid
        if (pdfBytes == null || pdfBytes.length == 0 || !isValidPdfBytes(pdfBytes)) {
            log.warn("Failed to download valid PDF from source for paper import: title='{}', pdfLink='{}'", paperTitle, pdfLink);
            throw new IllegalArgumentException("We can't find PDF from source");
        }

        // 5. Wrap PDF bytes as ByteArrayMultipartFile and execute unified paper processing pipeline
        try {
            String safeFileName = paperTitle.replaceAll("[^a-zA-Z0-9._-]", "_") + ".pdf";
            com.anveshak.Helper.ByteArrayMultipartFile multipartFile = new com.anveshak.Helper.ByteArrayMultipartFile(
                    pdfBytes, "pdfFile", safeFileName, "application/pdf");

            String[] authorArray = request.authors() != null && !request.authors().isBlank()
                    ? request.authors().split(",")
                    : new String[] { "Unknown Author" };

            String[] keywordArray = request.categories() != null && !request.categories().isBlank()
                    ? request.categories().split("[\\s,]+")
                    : new String[] { "Research" };

            Integer year = request.publicationYear() != null ? request.publicationYear()
                    : Instant.now().atZone(java.time.ZoneId.systemDefault()).getYear();

            String abstractText = request.abstractText() != null && !request.abstractText().isBlank()
                    ? request.abstractText().trim()
                    : "Imported paper: " + paperTitle;

            ResearchPaperResponse response = saveAndProcessPaper(owner, paperTitle, abstractText, year, authorArray, keywordArray, multipartFile);
            log.info("Successfully uploaded PDF to Supabase and processed imported paper '{}' for user {}", paperTitle, owner.getId());
            return response;

        } catch (Exception e) {
            log.error("Error processing imported paper '{}': {}", paperTitle, e.getMessage(), e);
            throw new IllegalArgumentException("We can't find PDF from source");
        }
    }

    private byte[] fetchPdfBytes(String url) {
        if (url == null || url.isBlank()) return null;
        String rawUrl = url.trim();

        // Generate candidate URLs for arXiv or generic URLs
        List<String> candidates = new ArrayList<>();
        if (rawUrl.contains("arxiv.org/abs/")) {
            String pdfBase = rawUrl.replace("arxiv.org/abs/", "arxiv.org/pdf/");
            candidates.add(pdfBase);
            if (!pdfBase.endsWith(".pdf")) {
                candidates.add(pdfBase + ".pdf");
            }
        } else if (rawUrl.contains("arxiv.org/pdf/")) {
            candidates.add(rawUrl);
            if (!rawUrl.endsWith(".pdf")) {
                candidates.add(rawUrl + ".pdf");
            } else {
                candidates.add(rawUrl.substring(0, rawUrl.length() - 4));
            }
        } else {
            candidates.add(rawUrl);
        }

        for (String candidateUrl : candidates) {
            try {
                log.info("Attempting external PDF download from candidate URL: {}", candidateUrl);
                HttpHeaders headers = new HttpHeaders();
                headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
                headers.set("Accept", "application/pdf,application/octet-stream,*/*");
                HttpEntity<Void> entity = new HttpEntity<>(headers);
                ResponseEntity<byte[]> response = restTemplate.exchange(candidateUrl, HttpMethod.GET, entity, byte[].class);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null && response.getBody().length > 0) {
                    byte[] bytes = response.getBody();
                    if (isValidPdfBytes(bytes)) {
                        log.info("Successfully fetched valid PDF ({} bytes) from candidate URL: {}", bytes.length, candidateUrl);
                        return bytes;
                    } else {
                        log.warn("Candidate URL {} returned {} bytes but missing %PDF- magic header", candidateUrl, bytes.length);
                    }
                }
            } catch (Exception e) {
                log.warn("Failed candidate download from {}: {}", candidateUrl, e.getMessage());
            }
        }
        return null;
    }

    private boolean isValidPdfBytes(byte[] bytes) {
        if (bytes == null || bytes.length < 100) return false;
        return bytes[0] == '%' && bytes[1] == 'P' && bytes[2] == 'D' && bytes[3] == 'F';
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

    @Transactional
    public void deletePaper(PaperLookupRequest lookupRequest, User owner) {
        validateOwner(owner);
        ResearchPaper paper = loadOwnedPaper(lookupRequest, owner);
        log.info("Deleting research paper '{}' (ID: {}) for user {}", paper.getTitle(), paper.getId(), owner.getId());

        // 1. Delete associated paper chunks
        try {
            paperChunkRepository.deleteByPaper(paper);
        } catch (Exception e) {
            log.warn("Error deleting paper chunks: {}", e.getMessage());
        }

        // 2. Delete associated summary
        try {
            paperSummaryRepository.deleteByPaper(paper);
        } catch (Exception e) {
            log.warn("Error deleting paper summary: {}", e.getMessage());
        }

        // 3. Delete associated chat sessions
        try {
            chatSessionRepository.deleteByPaper(paper);
        } catch (Exception e) {
            log.warn("Error deleting chat sessions: {}", e.getMessage());
        }

        // 4. Delete storage file if in Supabase
        if (paper.getPdfUrl() != null && !paper.getPdfUrl().isBlank()
                && !paper.getPdfUrl().startsWith("http://") && !paper.getPdfUrl().startsWith("https://")) {
            try {
                fileStorageService.delete(paper.getPdfUrl());
            } catch (Exception e) {
                log.warn("Error deleting file from Supabase storage: {}", e.getMessage());
            }
        }

        // 5. Delete paper entity
        researchPaperRepository.delete(paper);
        log.info("Paper '{}' deleted successfully.", paper.getId());
    }

    @Transactional(readOnly = true)
    public InputStream downloadPaperPdf(PaperLookupRequest request, User owner) {
        ResearchPaper paper = loadOwnedPaper(request, owner);
        if (paper.getPdfUrl() == null || paper.getPdfUrl().isBlank()) {
            throw new IllegalArgumentException("Paper does not have a PDF attached");
        }

        String pdfUrl = paper.getPdfUrl().trim();
        if (pdfUrl.startsWith("http://") || pdfUrl.startsWith("https://")) {
            return downloadExternalPdf(pdfUrl);
        }

        return fileStorageService.download(pdfUrl);
    }

    private InputStream downloadExternalPdf(String url) {
        byte[] bytes = fetchPdfBytes(url);
        if (bytes != null && bytes.length > 0) {
            return new ByteArrayInputStream(bytes);
        }
        log.error("Failed to download valid PDF from external URL: {}", url);
        throw new IllegalArgumentException("Could not fetch valid PDF file from " + url);
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

    public List<ResearchPaperResponse> semanticSearch(String query, User owner, double threshold) {
        if (query == null) {
            log.warn("Query is null, returning empty list");
            throw new IllegalArgumentException("Query cannot be null");
        }

        float[] embedding = embeddingServiceClient.getEmbedding(query);

        List<ResearchPaper> papers = researchPaperRepository.semanticSearch(new PGvector(embedding).toString(), 10, owner.getId(), threshold);

        List<ResearchPaperResponse> matches = new ArrayList<>();

        for (ResearchPaper paper : papers) {
            matches.add(toResponse(paper));
        }

        return matches;
    }

    public List<ResearchPaperResponse> semanticSearch(String query, User owner) {
        return semanticSearch(query, owner, 0.0);
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