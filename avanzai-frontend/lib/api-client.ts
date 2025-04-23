import { env } from '@/env.mjs';
import type { DatabaseQueries } from './db/queries.interface';
import type { User, Message, Document, Suggestion } from './db/schema';
import { ArtifactKind } from '@/components/artifact';

class APIClient implements DatabaseQueries {
  private baseUrl: string;

  constructor() {
    this.baseUrl = env.NEXT_PUBLIC_FASTAPI_BASE_URL;
  }

  private async fetchApi(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getUser(email: string): Promise<Array<User>> {
    return this.fetchApi(`/api/users?email=${encodeURIComponent(email)}`);
  }

  async createUser(email: string, password: string | null, userId?: string): Promise<any> {
    return this.fetchApi('/api/users', {
      method: 'POST',
      body: JSON.stringify({ email, password, userId }),
    });
  }

  async saveChat(params: { id: string; userId: string; title: string }): Promise<any> {
    return this.fetchApi('/api/chats', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async deleteChatById(params: { id: string }): Promise<any> {
    return this.fetchApi(`/api/chats/${params.id}`, {
      method: 'DELETE',
    });
  }

  async getChatsByUserId(params: { id: string }): Promise<any> {
    return this.fetchApi(`/api/users/${params.id}/chats`);
  }

  async getChatById(params: { id: string }): Promise<any> {
    return this.fetchApi(`/api/chats/${params.id}`);
  }

  async saveMessages(params: { messages: Array<Message> }): Promise<any> {
    return this.fetchApi('/api/messages', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getMessagesByChatId(params: { id: string }): Promise<Array<Message>> {
    return this.fetchApi(`/api/chats/${params.id}/messages`);
  }

  async voteMessage(params: { chatId: string; messageId: string; type: 'up' | 'down' }): Promise<any> {
    return this.fetchApi(`/api/chats/${params.chatId}/messages/${params.messageId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ type: params.type }),
    });
  }

  async getVotesByChatId(params: { id: string }): Promise<any> {
    return this.fetchApi(`/api/chats/${params.id}/votes`);
  }

  async saveDocument(params: {
    chatId: string;
    title: string;
    content: string;
    kind: ArtifactKind;
    metadata?: Record<string, any>;
    userId: string;
  }): Promise<any> {
    return this.fetchApi('/api/documents', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getDocumentsById(params: { id: string }): Promise<Array<Document>> {
    return this.fetchApi(`/api/documents?id=${params.id}`);
  }

  async getDocumentById(params: { id: string }): Promise<Document | null> {
    return this.fetchApi(`/api/documents/${params.id}`);
  }

  async deleteDocumentsByIdAfterTimestamp(params: { id: string; timestamp: Date }): Promise<any> {
    return this.fetchApi(`/api/documents/${params.id}`, {
      method: 'DELETE',
      body: JSON.stringify({ timestamp: params.timestamp.toISOString() }),
    });
  }

  async saveSuggestions(params: { suggestions: Array<Suggestion> }): Promise<any> {
    return this.fetchApi('/api/suggestions', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getSuggestionsByDocumentId(params: { documentId: string }): Promise<Array<Suggestion>> {
    return this.fetchApi(`/api/documents/${params.documentId}/suggestions`);
  }

  async getMessageById(params: { id: string }): Promise<Array<Message>> {
    return this.fetchApi(`/api/messages/${params.id}`);
  }

  async deleteMessagesByChatIdAfterTimestamp(params: { chatId: string; timestamp: Date }): Promise<any> {
    return this.fetchApi(`/api/chats/${params.chatId}/messages`, {
      method: 'DELETE',
      body: JSON.stringify({ timestamp: params.timestamp.toISOString() }),
    });
  }

  async updateChatVisiblityById(params: { chatId: string; visibility: 'private' | 'public' }): Promise<any> {
    return this.fetchApi(`/api/chats/${params.chatId}/visibility`, {
      method: 'PATCH',
      body: JSON.stringify({ visibility: params.visibility }),
    });
  }

  async createChatWithTemplates(params: { id: string; userId: string; title: string; templates: Record<string, any> }): Promise<any> {
    return this.fetchApi('/api/chats/templates', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async updateChatTemplates(params: { id: string; templates: Record<string, any> }): Promise<any> {
    return this.fetchApi(`/api/chats/${params.id}/templates`, {
      method: 'PATCH',
      body: JSON.stringify({ templates: params.templates }),
    });
  }

  async getChatTemplates(params: { id: string }): Promise<Record<string, any> | null> {
    return this.fetchApi(`/api/chats/${params.id}/templates`);
  }

  async getDocumentsByChatId(params: { chatId: string; templateType?: string }): Promise<Array<Document>> {
    const url = new URL(`${this.baseUrl}/api/chats/${params.chatId}/documents`);
    if (params.templateType) {
      url.searchParams.append('templateType', params.templateType);
    }
    return this.fetchApi(url.toString());
  }
}

// Export a singleton instance
export const apiClient = new APIClient();

// Re-export the interface for type checking
export type { DatabaseQueries } from './db/queries.interface'; 