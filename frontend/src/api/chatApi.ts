import apiClient from '@/lib/apiClient';
import type {
  ChatSessionResponse,
  NewChatSessionRequest,
  ChatMessageResponse,
  ChatMessageRequest,
} from '@/lib/types';

/** Create a new chat session for a paper. */
export async function createChatSession(
  paperId: string,
): Promise<ChatSessionResponse> {
  const request: NewChatSessionRequest = { paperId };
  const { data } = await apiClient.post<ChatSessionResponse>(
    '/chat-sessions',
    request,
  );
  return data;
}

/** List all chat sessions for the current user. */
export async function listChatSessions(): Promise<ChatSessionResponse[]> {
  const { data } = await apiClient.get<ChatSessionResponse[]>('/chat-sessions');
  return data;
}

/** Delete a chat session. */
export async function deleteChatSession(sessionId: string): Promise<void> {
  await apiClient.delete(`/chat-sessions/${sessionId}`);
}

/** List all messages in a chat session. */
export async function listChatMessages(
  sessionId: string,
): Promise<ChatMessageResponse[]> {
  const { data } = await apiClient.get<ChatMessageResponse[]>(
    `/chat-sessions/${sessionId}/messages`,
  );
  return data;
}

/** Send a message in a chat session. */
export async function sendMessage(
  sessionId: string,
  message: string,
  role: string = 'user',
): Promise<ChatMessageResponse> {
  const request: ChatMessageRequest = {
    message,
    sessionId,
    role,
  };
  const { data } = await apiClient.post<ChatMessageResponse>(
    `/chat-sessions/${sessionId}/messages`,
    request,
  );
  return data;
}
