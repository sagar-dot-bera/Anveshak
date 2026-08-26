package com.anveshak.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.anveshak.DTOs.ChatMessageRequest;
import com.anveshak.DTOs.ChatMessageResponse;
import com.anveshak.DTOs.ChatSessionResponse;
import com.anveshak.DTOs.NewChatSessionRequest;
import com.anveshak.Exception.ChatSessionNotFoundException;
import com.anveshak.client.EmbeddingServiceClient;
import com.anveshak.model.ChatMessage;
import com.anveshak.model.ChatSession;
import com.anveshak.model.PaperChunk;
import com.anveshak.model.ResearchPaper;
import com.anveshak.model.User;
import com.anveshak.repository.ChatMessageRepository;
import com.anveshak.repository.ChatSessionRepository;
import com.pgvector.PGvector;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PaperChatService {
    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final PaperChunkService paperChunkService;
    private final ResearchPaperService researchPaperService;
    private final GeminiService geminiService;
    private final EmbeddingServiceClient embeddingService;
    private final PromptService promptService;

    public PaperChatService(ChatSessionRepository chatSessionRepository, ChatMessageRepository chatMessageRepository,
            PaperChunkService paperChunkService, ResearchPaperService researchPaperService,
            GeminiService geminiService, EmbeddingServiceClient embeddingService, PromptService promptService) {
        this.chatSessionRepository = chatSessionRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.paperChunkService = paperChunkService;
        this.researchPaperService = researchPaperService;
        this.geminiService = geminiService;
        this.embeddingService = embeddingService;
        this.promptService = promptService;
    }

    public ChatSessionResponse createChatSession(NewChatSessionRequest request, User user) {
        ResearchPaper paper = researchPaperService.findPaperById(UUID.fromString(request.paperId()));

        ChatSession newSession = new ChatSession();

        newSession.setPaper(paper);
        newSession.setUser(user);
        newSession.setCreatedAt(java.time.Instant.now());
        newSession = chatSessionRepository.save(newSession);

        return new ChatSessionResponse(newSession.getId().toString(), paper.getId().toString());
    }

    public ChatSession getChatSessionById(UUID sessionId) {
        return chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ChatSessionNotFoundException(sessionId.toString()));

    }

    public void deleteChatSession(UUID sessionId) {
        ChatSession session = getChatSessionById(sessionId);
        chatSessionRepository.delete(session);
    }

    public ChatMessageResponse sendMessage(ChatMessageRequest request) {
        ChatSession session = getChatSessionById(UUID.fromString(request.sessionId()));
        ResearchPaper paper = session.getPaper();
        log.info("Sending message for paper: {}", paper.getId());
        float[] embedding = embeddingService.getEmbedding(request.message());
        PGvector pgVectorEmbedding = new PGvector(embedding);

        log.info("Embedding: {}", pgVectorEmbedding.toString());
        log.info("Type: {}", pgVectorEmbedding.getClass());
        log.info("Vector: {}", pgVectorEmbedding.toString());
        log.info("Embedding retrieved for message: {}", embedding.length);
        List<PaperChunk> chunks = paperChunkService.semanticSearch(pgVectorEmbedding.toString(), 5, paper.getId());

        log.info("Chunks retrieved for semantic search: {}", chunks.size());
        String prompt = promptService.buildPrompts(request.message(), chunks, request.role()).stream()
                .reduce((a, b) -> a + "\n\n" + b)
                .orElse("");
        String message = geminiService.generateAnswer(prompt, null);

        log.info("Generated answer: {}", message);
        // Store user question under "user" role
        storeMessage(request.message(), request.sessionId(), "user");
        // Store assistant answer under "assistant" role
        storeMessage(message, request.sessionId(), "assistant");

        return new ChatMessageResponse(message, session.getId().toString(), "assistant");
    }

    public ChatMessage storeMessage(String msg, String sessionId, String role) {
        ChatSession session = getChatSessionById(UUID.fromString(sessionId));
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setContent(msg);
        chatMessage.setSession(session);
        chatMessage.setRole(role);
        chatMessage.setCreatedAt(java.time.Instant.now());
        return chatMessageRepository.save(chatMessage);
    }

    public List<ChatMessageResponse> getMessagesBySessionId(String sessionId) {
        ChatSession session = getChatSessionById(UUID.fromString(sessionId));
        List<ChatMessage> messages = chatMessageRepository.findBySessionOrderByCreatedAtDesc(session);
        return messages.stream()
                .map(msg -> new ChatMessageResponse(msg.getContent(), session.getId().toString(), msg.getRole()))
                .toList();
    }

    public List<ChatSessionResponse> getSessionsByUser(User user) {
        List<ChatSession> sessions = chatSessionRepository.findByUserOrderByCreatedAtDesc(user);
        return sessions.stream()
                .map(session -> new ChatSessionResponse(session.getId().toString(), session.getPaper().getId().toString()))
                .toList();
    }

}