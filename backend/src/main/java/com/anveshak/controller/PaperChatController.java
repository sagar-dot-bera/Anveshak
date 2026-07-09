package com.anveshak.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.anveshak.DTOs.ChatMessageRequest;
import com.anveshak.DTOs.ChatMessageResponse;
import com.anveshak.DTOs.ChatSessionResponse;
import com.anveshak.DTOs.NewChatSessionRequest;
import com.anveshak.model.User;
import com.anveshak.service.CurrentUserResolver;
import com.anveshak.service.PaperChatService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/chat-sessions")
@RequiredArgsConstructor
@Tag(name = "Paper Chat", description = "Endpoints for managing chat sessions and messages related to research papers")
public class PaperChatController {

    private final PaperChatService paperChatService;
    private final CurrentUserResolver currentUserResolver;

    @Tag(name = "Paper Chat", description = "Endpoints for managing chat sessions and messages related to research papers")
    @PostMapping
    public ResponseEntity<ChatSessionResponse> createChatSession(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestBody NewChatSessionRequest request) {
        User user = currentUserResolver.resolveUser(authorizationHeader);
        return ResponseEntity.status(201).body(paperChatService.createChatSession(request, user));
    }

    @Tag(name = "Paper Chat", description = "Endpoints for managing chat sessions and messages related to research papers")
    @GetMapping
    public ResponseEntity<List<ChatSessionResponse>> listChatSessions(
            @RequestHeader("Authorization") String authorizationHeader) {
        User user = currentUserResolver.resolveUser(authorizationHeader);
        return ResponseEntity.ok(paperChatService.getSessionsByUser(user));
    }

    @Tag(name = "Paper Chat", description = "Endpoints for managing chat sessions and messages related to research papers")
    @DeleteMapping("/{sessionId}")
    public ResponseEntity<Void> deleteChatSession(@RequestHeader("Authorization") String authorizationHeader,
            @PathVariable UUID sessionId) {
        currentUserResolver.resolveUser(authorizationHeader);
        paperChatService.deleteChatSession(sessionId);
        return ResponseEntity.noContent().build();
    }

    @Tag(name = "Paper Chat", description = "Endpoints for managing chat sessions and messages related to research papers")
    @GetMapping("/{sessionId}/messages")
    public ResponseEntity<List<ChatMessageResponse>> listChatMessages(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable UUID sessionId) {
        currentUserResolver.resolveUser(authorizationHeader);
        return ResponseEntity.ok(paperChatService.getMessagesBySessionId(sessionId.toString()));
    }

    @Tag(name = "Paper Chat", description = "Endpoints for managing chat sessions and messages related to research papers")
    @PostMapping("/{sessionId}/messages")
    public ResponseEntity<ChatMessageResponse> sendMessage(@RequestHeader("Authorization") String authorizationHeader,
            @PathVariable UUID sessionId,
            @RequestBody ChatMessageRequest request) {
        currentUserResolver.resolveUser(authorizationHeader);
        ChatMessageRequest sessionRequest = new ChatMessageRequest(request.message(), sessionId.toString(),
                request.role());
        return ResponseEntity.ok(paperChatService.sendMessage(sessionRequest));
    }
}