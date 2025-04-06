import { genSaltSync, hashSync } from 'bcrypt-ts';
import { and, asc, desc, eq, gt, gte, inArray, sql as drizzleSql } from 'drizzle-orm';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import {
  user,
  chat,
  document,
  suggestion,
  message,
  vote,
  type User,
  type Message,
  type Document,
  type Suggestion,
} from './schema.sqlite';
import type { DatabaseQueries } from './queries.interface';
import { ArtifactKind } from '@/components/artifact';
import { randomUUID } from 'crypto';

export class SQLiteQueries implements DatabaseQueries {
  private readonly db: BetterSQLite3Database;

  constructor(db: BetterSQLite3Database) {
    this.db = db;
  }

  async getUser(email: string): Promise<Array<User>> {
    try {
      console.log('Attempting to get user with email:', email);
      const result = this.db.select().from(user).where(eq(user.email, email)).all();
      console.log('User query result:', result);
      return Promise.resolve(result);
    } catch (error) {
      console.error('Failed to get user from database:', error);
      return Promise.reject(error);
    }
  }

  async createUser(email: string, password: string) {
    try {
      const salt = genSaltSync(10);
      const hash = hashSync(password, salt);
      const id = randomUUID();
      this.db.insert(user).values({
        email,
        password: hash,
        id
      }).run();
      return Promise.resolve({ id, email });
    } catch (error) {
      console.error('Failed to create user in database:', error);
      return Promise.reject(error);
    }
  }

  async saveChat({ id, userId, title }: { id: string; userId: string; title: string }) {
    try {
      const now = new Date();
      const chatId = id || randomUUID();
      this.db.insert(chat).values({
        title,
        userId,
        createdAt: now,
        id: chatId,
        templates: drizzleSql`json('{}')`,
        visibility: 'private' as const
      }).run();
      return { id: chatId };
    } catch (error) {
      console.error('Failed to save chat in database:', error);
      throw error;
    }
  }

  async deleteChatById({ id }: { id: string }) {
    try {
      // SQLite doesn't support multiple statements, so we need to run them sequentially
      this.db.delete(vote).where(eq(vote.chatId, id)).run();
      this.db.delete(message).where(eq(message.chatId, id)).run();
      this.db.delete(chat).where(eq(chat.id, id)).run();
      return { success: true };
    } catch (error) {
      console.error('Failed to delete chat by id from database:', error);
      throw error;
    }
  }

  async getChatsByUserId({ id }: { id: string }) {
    try {
      return this.db
        .select()
        .from(chat)
        .where(eq(chat.userId, id))
        .orderBy(desc(chat.createdAt))
        .all();
    } catch (error) {
      console.error('Failed to get chats by user from database:', error);
      throw error;
    }
  }

  async getChatById({ id }: { id: string }) {
    try {
      const result = this.db.select().from(chat).where(eq(chat.id, id)).get();
      return result || null;
    } catch (error) {
      console.error('Failed to get chat by id from database:', error);
      throw error;
    }
  }

  async saveMessages({ messages }: { messages: Array<Message> }) {
    try {
      const formattedMessages = messages.map(msg => ({
        chatId: msg.chatId,
        role: msg.role,
        content: msg.content,
        createdAt: new Date(msg.createdAt),
        id: msg.id || randomUUID()
      }));
      
      for (const msg of formattedMessages) {
        this.db.insert(message).values(msg).run();
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to save messages in database:', error);
      throw error;
    }
  }

  async getMessagesByChatId({ id }: { id: string }): Promise<Array<Message>> {
    try {
      return this.db
        .select()
        .from(message)
        .where(eq(message.chatId, id))
        .orderBy(asc(message.createdAt))
        .all();
    } catch (error) {
      console.error('Failed to get messages by chat id from database:', error);
      throw error;
    }
  }

  async voteMessage({ chatId, messageId, type }: { chatId: string; messageId: string; type: 'up' | 'down' }) {
    try {
      const existingVote = this.db
        .select()
        .from(vote)
        .where(and(eq(vote.messageId, messageId)))
        .get();

      if (existingVote) {
        this.db
          .update(vote)
          .set({ isUpvoted: type === 'up' })
          .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)))
          .run();
      } else {
        this.db.insert(vote).values({
          chatId,
          messageId,
          isUpvoted: type === 'up'
        }).run();
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to vote message in database:', error);
      throw error;
    }
  }

  async getVotesByChatId({ id }: { id: string }) {
    try {
      return this.db.select().from(vote).where(eq(vote.chatId, id)).all();
    } catch (error) {
      console.error('Failed to get votes by chat id from database:', error);
      throw error;
    }
  }

  async saveDocument({ chatId, title, content, kind, metadata, userId }: {
    chatId: string;
    title: string;
    content: string;
    kind: ArtifactKind;
    metadata?: Record<string, any>;
    userId: string;
  }) {
    try {
      const now = new Date();
      const documentId = randomUUID();
      this.db.insert(document).values({
        userId,
        chatId,
        title,
        content,
        kind,
        metadata: metadata ? drizzleSql`json(${JSON.stringify(metadata)})` : null,
        createdAt: now,
        id: documentId
      }).run();
      return { id: documentId };
    } catch (error) {
      console.error('Failed to save document in database:', error);
      throw error;
    }
  }

  async getDocumentsById({ id }: { id: string }): Promise<Array<Document>> {
    try {
      const documents = this.db
        .select()
        .from(document)
        .where(eq(document.id, id))
        .orderBy(asc(document.createdAt))
        .all();

      return documents.map(doc => ({
        ...doc,
        metadata: doc.metadata ? JSON.parse(doc.metadata as unknown as string) : null
      }));
    } catch (error) {
      console.error('Failed to get documents by id from database:', error);
      throw error;
    }
  }

  async getDocumentById({ id }: { id: string }): Promise<Document | null> {
    try {
      const selectedDocument = this.db
        .select()
        .from(document)
        .where(eq(document.id, id))
        .orderBy(desc(document.createdAt))
        .get();

      if (!selectedDocument) return null;

      return {
        ...selectedDocument,
        metadata: selectedDocument.metadata ? JSON.parse(selectedDocument.metadata as unknown as string) : null
      };
    } catch (error) {
      console.error('Failed to get document by id from database:', error);
      throw error;
    }
  }

  async deleteDocumentsByIdAfterTimestamp({ id, timestamp }: { id: string; timestamp: Date }) {
    try {
      this.db
        .delete(suggestion)
        .where(
          and(
            eq(suggestion.documentId, id),
            gt(suggestion.documentCreatedAt, timestamp)
          ),
        ).run();

      this.db
        .delete(document)
        .where(and(eq(document.id, id), gt(document.createdAt, timestamp)))
        .run();

      return { success: true };
    } catch (error) {
      console.error('Failed to delete documents by id after timestamp from database:', error);
      throw error;
    }
  }

  async saveSuggestions({ suggestions }: { suggestions: Array<Suggestion> }) {
    try {
      const formattedSuggestions = suggestions.map(sugg => ({
        userId: sugg.userId,
        documentId: sugg.documentId,
        originalText: sugg.originalText,
        suggestedText: sugg.suggestedText,
        description: sugg.description,
        isResolved: sugg.isResolved,
        createdAt: new Date(sugg.createdAt),
        documentCreatedAt: new Date(sugg.documentCreatedAt),
        id: sugg.id || randomUUID()
      }));

      for (const sugg of formattedSuggestions) {
        this.db.insert(suggestion).values(sugg).run();
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to save suggestions in database:', error);
      throw error;
    }
  }

  async getSuggestionsByDocumentId({ documentId }: { documentId: string }): Promise<Array<Suggestion>> {
    try {
      return this.db
        .select()
        .from(suggestion)
        .where(eq(suggestion.documentId, documentId))
        .all();
    } catch (error) {
      console.error('Failed to get suggestions by document id from database:', error);
      throw error;
    }
  }

  async getMessageById({ id }: { id: string }): Promise<Array<Message>> {
    try {
      return this.db.select().from(message).where(eq(message.id, id)).all();
    } catch (error) {
      console.error('Failed to get message by id from database:', error);
      throw error;
    }
  }

  async deleteMessagesByChatIdAfterTimestamp({ chatId, timestamp }: { chatId: string; timestamp: Date }) {
    try {
      const messagesToDelete = this.db
        .select()
        .from(message)
        .where(
          and(eq(message.chatId, chatId), gte(message.createdAt, timestamp))
        )
        .all();

      const messageIds = messagesToDelete.map(msg => msg.id);

      if (messageIds.length > 0) {
        this.db
          .delete(vote)
          .where(
            and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds)),
          )
          .run();

        this.db
          .delete(message)
          .where(
            and(eq(message.chatId, chatId), inArray(message.id, messageIds)),
          )
          .run();
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to delete messages by chat id after timestamp from database:', error);
      throw error;
    }
  }

  async updateChatVisiblityById({ chatId, visibility }: { chatId: string; visibility: 'private' | 'public' }) {
    try {
      this.db.update(chat).set({ visibility }).where(eq(chat.id, chatId)).run();
      return { success: true };
    } catch (error) {
      console.error('Failed to update chat visibility in database:', error);
      throw error;
    }
  }

  async createChatWithTemplates({ id, userId, title, templates }: {
    id: string;
    userId: string;
    title: string;
    templates: Record<string, any>;
  }) {
    try {
      const now = new Date();
      const chatId = id || randomUUID();
      this.db.insert(chat).values({
        userId,
        title,
        createdAt: now,
        id: chatId,
        templates: drizzleSql`json(${JSON.stringify(templates)})`,
        visibility: 'private' as const
      }).run();
      return { id: chatId };
    } catch (error) {
      console.error('Failed to create chat with templates in database:', error);
      throw error;
    }
  }

  async updateChatTemplates({ id, templates }: { id: string; templates: Record<string, any> }) {
    try {
      this.db.update(chat)
        .set({ 
          templates: drizzleSql`json(${JSON.stringify(templates)})` 
        })
        .where(eq(chat.id, id))
        .run();
      return { success: true };
    } catch (error) {
      console.error('Failed to update chat templates in database:', error);
      throw error;
    }
  }

  async getChatTemplates({ id }: { id: string }): Promise<Record<string, any> | null> {
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!id || !UUID_REGEX.test(id)) {
      console.error('Invalid chat ID for template fetch:', id);
      return null;
    }

    try {
      const result = this.db
        .select()
        .from(chat)
        .where(eq(chat.id, id))
        .get();
      
      return result?.templates ? JSON.parse(result.templates as unknown as string) : null;
    } catch (error) {
      console.error('Error fetching templates:', error);
      return null;
    }
  }

  async getDocumentsByChatId({ chatId, templateType }: { chatId: string; templateType?: string }): Promise<Array<Document>> {
    try {
      const documents = this.db
        .select()
        .from(document)
        .where(eq(document.chatId, chatId))
        .orderBy(desc(document.createdAt))
        .all();

      const parsedDocuments = documents.map(doc => ({
        ...doc,
        metadata: doc.metadata ? JSON.parse(doc.metadata as unknown as string) : null
      }));

      if (templateType) {
        return parsedDocuments.filter((doc: Document) => 
          doc.metadata && doc.metadata.templateType === templateType
        );
      }

      return parsedDocuments;
    } catch (error) {
      console.error('Failed to get documents by chat id from database:', error);
      throw error;
    }
  }
} 