import api from './api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface SendMessageResponse {
  reply: string;
  tokensUsed: number;
}

export async function sendMessage(message: string): Promise<SendMessageResponse> {
  const res = await api.post('/api/v1/chat/messages', { message });
  return res.data;
}

export async function getChatHistory(): Promise<ChatMessage[]> {
  const res = await api.get('/api/v1/chat/history');
  return Array.isArray(res.data) ? res.data : res.data?.messages ?? [];
}
