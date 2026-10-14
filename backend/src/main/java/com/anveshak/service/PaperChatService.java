package com.anveshak.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.anveshak.DTOs.ChatMessageRequest;
import com.anveshak.DTOs.ChatMessageResponse;
import com.anveshak.DTOs.ChatSessionResponse;
import com.anveshak.DTOs.NewChatSessionRequest;
import com.anveshak.Exception.ChatSessionNotFoundException;
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
    private final PromptService promptService;

    public PaperChatService(ChatSessionRepository chatSessionRepository, ChatMessageRepository chatMessageRepository,
            PaperChunkService paperChunkService, ResearchPaperService researchPaperService,
            GeminiService geminiService, PromptService promptService) {
        this.chatSessionRepository = chatSessionRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.paperChunkService = paperChunkService;
        this.researchPaperService = researchPaperService;
        this.geminiService = geminiService;
        this.promptService = promptService;
    }

    public ChatSessionResponse createChatSession(NewChatSessionRequest request, User user) {
        ResearchPaper paper = researchPaperService.findOwnedPaper(UUID.fromString(request.paperId()), user);

        ChatSession newSession = new ChatSession();

        newSession.setPaper(paper);
        newSession.setUser(user);
        newSession.setCreatedAt(java.time.Instant.now());
        newSession = chatSessionRepository.save(newSession);

        return new ChatSessionResponse(newSession.getId().toString(), paper.getId().toString(), newSession.getCreatedAt());
    }

    /**
     * The session with this id, if it belongs to {@code user}. Someone else's
     * session is reported as not found, so session ids can't be probed.
     */
    public ChatSession getOwnedChatSession(UUID sessionId, User user) {
        return chatSessionRepository.findByIdAndUser(sessionId, user)
                .orElseThrow(() -> new ChatSessionNotFoundException(sessionId.toString()));
    }

    public void deleteChatSession(UUID sessionId, User user) {
        ChatSession session = getOwnedChatSession(sessionId, user);
        chatSessionRepository.delete(session);
    }

    public ChatMessageResponse sendMessage(ChatMessageRequest request, User user) {
        ChatSession session = getOwnedChatSession(UUID.fromString(request.sessionId()), user);
        ResearchPaper paper = session.getPaper();
        log.info("Sending message for paper: {}", paper.getId());
        PGvector pgVectorEmbedding = new PGvector(request.embeddingFloatArray());
        List<PaperChunk> chunks = paperChunkService.semanticSearch(pgVectorEmbedding.toString(), 5, paper.getId());

        log.info("Chunks retrieved for semantic search: {}", chunks.size());
        String prompt = promptService.buildPrompts(request.message(), chunks, request.role()).stream()
                .reduce((a, b) -> a + "\n\n" + b)
                .orElse("");
        String message = geminiService.generateAnswer(prompt, null);

        // Store user question under "user" role
        storeMessage(request.message(), session, "user");
        // Store assistant answer under "assistant" role
        storeMessage(message, session, "assistant");

        return new ChatMessageResponse(message, session.getId().toString(), "assistant");
    }

    private ChatMessage storeMessage(String msg, ChatSession session, String role) {
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setContent(msg);
        chatMessage.setSession(session);
        chatMessage.setRole(role);
        chatMessage.setCreatedAt(java.time.Instant.now());
        return chatMessageRepository.save(chatMessage);
    }

    public List<ChatMessageResponse> getMessagesBySessionId(UUID sessionId, User user) {
        ChatSession session = getOwnedChatSession(sessionId, user);
        List<ChatMessage> messages = chatMessageRepository.findBySessionOrderByCreatedAtDesc(session);
        return messages.stream()
                .map(msg -> new ChatMessageResponse(msg.getContent(), session.getId().toString(), msg.getRole()))
                .toList();
    }

    public List<ChatSessionResponse> getSessionsByUser(User user) {
        List<ChatSession> sessions = chatSessionRepository.findByUserOrderByCreatedAtDesc(user);
        return sessions.stream()
                .map(session -> new ChatSessionResponse(session.getId().toString(), session.getPaper().getId().toString(), session.getCreatedAt()))
                .toList();
    }

}