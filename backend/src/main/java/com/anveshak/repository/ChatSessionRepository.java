package com.anveshak.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.anveshak.model.ChatSession;
import com.anveshak.model.User;

public interface ChatSessionRepository extends JpaRepository<ChatSession, UUID> {

    List<ChatSession> findByUserOrderByCreatedAtDesc(User user);

    void deleteByPaper(com.anveshak.model.ResearchPaper paper);
}
