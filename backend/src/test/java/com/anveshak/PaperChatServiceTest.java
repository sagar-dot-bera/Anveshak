package com.anveshak;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.anveshak.DTOs.ChatMessageRequest;
import com.anveshak.DTOs.NewChatSessionRequest;
import com.anveshak.Exception.ChatSessionNotFoundException;
import com.anveshak.Exception.ResearchPaperNotFoundException;
import com.anveshak.model.User;
import com.anveshak.repository.ChatMessageRepository;
import com.anveshak.repository.ChatSessionRepository;
import com.anveshak.service.GeminiService;
import com.anveshak.service.PaperChatService;
import com.anveshak.service.PaperChunkService;
import com.anveshak.service.PromptService;
import com.anveshak.service.ResearchPaperService;

/** Chat sessions and messages are only reachable by the user who owns them. */
@ExtendWith(MockitoExtension.class)
public class PaperChatServiceTest {

    @Mock
    ChatSessionRepository chatSessionRepository;

    @Mock
    ChatMessageRepository chatMessageRepository;

    @Mock
    PaperChunkService paperChunkService;

    @Mock
    ResearchPaperService researchPaperService;

    @Mock
    GeminiService geminiService;

    @Mock
    PromptService promptService;

    @InjectMocks
    PaperChatService paperChatService;

    private final User otherUser = new User();
    private final UUID sessionId = UUID.randomUUID();

    @Test
    void shouldNotCreateSessionOnSomeoneElsesPaper() {
        UUID paperId = UUID.randomUUID();
        when(researchPaperService.findOwnedPaper(paperId, otherUser))
                .thenThrow(new ResearchPaperNotFoundException(paperId));

        assertThrows(ResearchPaperNotFoundException.class,
                () -> paperChatService.createChatSession(new NewChatSessionRequest(paperId.toString()), otherUser));
        verifyNoInteractions(chatSessionRepository);
    }

    @Test
    void shouldNotSendMessageToSomeoneElsesSession() {
        when(chatSessionRepository.findByIdAndUser(sessionId, otherUser)).thenReturn(Optional.empty());
        ChatMessageRequest request = new ChatMessageRequest("hi", sessionId.toString(), "user", "unused");

        assertThrows(ChatSessionNotFoundException.class, () -> paperChatService.sendMessage(request, otherUser));
        verifyNoInteractions(geminiService, paperChunkService, chatMessageRepository);
    }

    @Test
    void shouldNotListMessagesOfSomeoneElsesSession() {
        when(chatSessionRepository.findByIdAndUser(sessionId, otherUser)).thenReturn(Optional.empty());

        assertThrows(ChatSessionNotFoundException.class,
                () -> paperChatService.getMessagesBySessionId(sessionId, otherUser));
        verifyNoInteractions(chatMessageRepository);
    }

    @Test
    void shouldNotDeleteSomeoneElsesSession() {
        when(chatSessionRepository.findByIdAndUser(sessionId, otherUser)).thenReturn(Optional.empty());

        assertThrows(ChatSessionNotFoundException.class,
                () -> paperChatService.deleteChatSession(sessionId, otherUser));
        verify(chatSessionRepository).findByIdAndUser(sessionId, otherUser);
        org.mockito.Mockito.verifyNoMoreInteractions(chatSessionRepository);
    }
}
