import { ArtifactKind } from '@/components/artifact';
import { User, Message, Document, Suggestion } from './schema';

export interface DatabaseQueries {
  getUser(email: string): Promise<Array<User>>;
  createUser(email: string, password: string): Promise<any>;
  saveChat(params: { id: string; userId: string; title: string }): Promise<any>;
  deleteChatById(params: { id: string }): Promise<any>;
  getChatsByUserId(params: { id: string }): Promise<any>;
  getChatById(params: { id: string }): Promise<any>;
  saveMessages(params: { messages: Array<Message> }): Promise<any>;
  getMessagesByChatId(params: { id: string }): Promise<Array<Message>>;
  voteMessage(params: { chatId: string; messageId: string; type: 'up' | 'down' }): Promise<any>;
  getVotesByChatId(params: { id: string }): Promise<any>;
  saveDocument(params: {
    chatId: string;
    title: string;
    content: string;
    kind: ArtifactKind;
    metadata?: Record<string, any>;
    userId: string;
    id?: string;
  }): Promise<any>;
  getDocumentsById(params: { id: string }): Promise<Array<Document>>;
  getDocumentById(params: { id: string }): Promise<Document | null>;
  deleteDocumentsByIdAfterTimestamp(params: { id: string; timestamp: Date }): Promise<any>;
  saveSuggestions(params: { suggestions: Array<Suggestion> }): Promise<any>;
  getSuggestionsByDocumentId(params: { documentId: string }): Promise<Array<Suggestion>>;
  getMessageById(params: { id: string }): Promise<Array<Message>>;
  deleteMessagesByChatIdAfterTimestamp(params: { chatId: string; timestamp: Date }): Promise<any>;
  updateChatVisiblityById(params: { chatId: string; visibility: 'private' | 'public' }): Promise<any>;
  createChatWithTemplates(params: { id: string; userId: string; title: string; templates: Record<string, any> }): Promise<any>;
  updateChatTemplates(params: { id: string; templates: Record<string, any> }): Promise<any>;
  getChatTemplates(params: { id: string }): Promise<Record<string, any> | null>;
  getDocumentsByChatId(params: { chatId: string; templateType?: string }): Promise<Array<Document>>;
} 