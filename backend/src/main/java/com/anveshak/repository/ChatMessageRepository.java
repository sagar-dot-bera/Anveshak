package com.anveshak.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.anveshak.model.ChatMessage;
import com.anveshak.model.ChatSession;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {

    List<ChatMessage> findBySession(ChatSession session);

    List<ChatMessage> findBySessionOrderByCreatedAt(ChatSession session);

    List<ChatMessage> findBySessionOrderByCreatedAtDesc(ChatSession session);

}
