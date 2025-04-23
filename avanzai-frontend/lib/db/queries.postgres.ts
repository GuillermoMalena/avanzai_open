import { genSaltSync, hashSync } from 'bcrypt-ts';
import { and, asc, desc, eq, gt, gte, inArray, sql as drizzleSql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
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
} from './schema';
import type { DatabaseQueries } from './queries.interface';
import { ArtifactKind } from '@/components/artifact';
import { randomUUID } from 'crypto';

type TemplateType = 'user_input' | 'development' | 'revenue' | 'returns' | 'cashflow';

interface DocumentMetadata {
  templateType: TemplateType;
  version: number;
  updatedAt: string;
  trigger: {
    messageId: string;
    content: string;
  };
}

export class PostgresQueries implements DatabaseQueries {
  private readonly db: PostgresJsDatabase;

  constructor(db: PostgresJsDatabase) {
    this.db = db;
  }

  async getUser(email: string): Promise<Array<User>> {
    try {
      console.log('Attempting to get user with email:', email);
      const result = await this.db.select().from(user).where(eq(user.email, email));
      console.log('User query result:', result);
      return result;
    } catch (error) {
      console.error('Failed to get user from database. Details:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        email,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async createUser(email: string, password: string | null, userId?: string) {
    try {
      console.log('Creating user with email:', email, 'and predefined userId:', userId || 'none');
      
      let passwordHash = null;
      if (password) {
        const salt = genSaltSync(10);
        passwordHash = hashSync(password, salt);
      }
      
      // Use provided userId or generate a new one
      const id = userId || randomUUID();
      
      await this.db.insert(user).values({
        id,
        email,
        password: passwordHash,
      });
      
      console.log('User created successfully with id:', id);
      return { id, email };
    } catch (error) {
      console.error('Failed to create user in database');
      throw error;
    }
  }

  async saveChat({ id, userId, title }: { id: string; userId: string; title: string }) {
    try {
      return await this.db.insert(chat).values({
        id,
        createdAt: new Date(),
        userId,
        title,
      });
    } catch (error) {
      console.error('Failed to save chat in database');
      throw error;
    }
  }

  async deleteChatById({ id }: { id: string }) {
    try {
      await this.db.delete(vote).where(eq(vote.chatId, id));
      await this.db.delete(message).where(eq(message.chatId, id));

      return await this.db.delete(chat).where(eq(chat.id, id));
    } catch (error) {
      console.error('Failed to delete chat by id from database');
      throw error;
    }
  }

  async getChatsByUserId({ id }: { id: string }) {
    try {
      return await this.db
        .select()
        .from(chat)
        .where(eq(chat.userId, id))
        .orderBy(desc(chat.createdAt));
    } catch (error) {
      console.error('Failed to get chats by user from database');
      throw error;
    }
  }

  async getChatById({ id }: { id: string }) {
    try {
      const [selectedChat] = await this.db.select().from(chat).where(eq(chat.id, id));
      return selectedChat;
    } catch (error) {
      console.error('Failed to get chat by id from database');
      throw error;
    }
  }

  async saveMessages({ messages }: { messages: Array<Message> }) {
    try {
      return await this.db.insert(message).values(messages);
    } catch (error) {
      console.error('Failed to save messages in database', error);
      throw error;
    }
  }

  async getMessagesByChatId({ id }: { id: string }) {
    try {
      return await this.db
        .select()
        .from(message)
        .where(eq(message.chatId, id))
        .orderBy(asc(message.createdAt));
    } catch (error) {
      console.error('Failed to get messages by chat id from database', error);
      throw error;
    }
  }

  async voteMessage({ chatId, messageId, type }: { chatId: string; messageId: string; type: 'up' | 'down' }) {
    try {
      const [existingVote] = await this.db
        .select()
        .from(vote)
        .where(and(eq(vote.messageId, messageId)));

      if (existingVote) {
        return await this.db
          .update(vote)
          .set({ isUpvoted: type === 'up' })
          .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
      }
      return await this.db.insert(vote).values({
        chatId,
        messageId,
        isUpvoted: type === 'up',
      });
    } catch (error) {
      console.error('Failed to upvote message in database', error);
      throw error;
    }
  }

  async getVotesByChatId({ id }: { id: string }) {
    try {
      return await this.db.select().from(vote).where(eq(vote.chatId, id));
    } catch (error) {
      console.error('Failed to get votes by chat id from database', error);
      throw error;
    }
  }

  async saveDocument({ chatId, title, content, kind, metadata, userId, id }: {
    chatId: string;
    title: string;
    content: string;
    kind: ArtifactKind;
    metadata?: Record<string, any>;
    userId: string;
    id?: string;
  }) {
    try {
      return await this.db.insert(document).values({
        id: id || undefined,
        chatId: drizzleSql`${chatId}::uuid`,
        title,
        content,
        kind,
        metadata,
        userId: drizzleSql`${userId}::uuid`,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Failed to save document in database:', error);
      throw error;
    }
  }

  async getDocumentsById({ id }: { id: string }): Promise<Array<Document>> {
    try {
      const documents = await this.db
        .select()
        .from(document)
        .where(eq(document.id, id))
        .orderBy(asc(document.createdAt));

      return documents;
    } catch (error) {
      console.error('Failed to get document by id from database');
      throw error;
    }
  }

  async getDocumentById({ id }: { id: string }): Promise<Document | null> {
    try {
      const [selectedDocument] = await this.db
        .select()
        .from(document)
        .where(eq(document.id, id))
        .orderBy(desc(document.createdAt));

      if (!selectedDocument) {
        console.log(`No document found with id: ${id}`);
        return null;
      }

      return selectedDocument;
    } catch (error) {
      console.error('Failed to get document by id from database:', error);
      throw error;
    }
  }

  async deleteDocumentsByIdAfterTimestamp({ id, timestamp }: { id: string; timestamp: Date }) {
    try {
      await this.db
        .delete(suggestion)
        .where(
          and(
            eq(suggestion.documentId, id),
            gt(suggestion.documentCreatedAt, timestamp),
          ),
        );

      return await this.db
        .delete(document)
        .where(and(eq(document.id, id), gt(document.createdAt, timestamp)));
    } catch (error) {
      console.error(
        'Failed to delete documents by id after timestamp from database',
      );
      throw error;
    }
  }

  async saveSuggestions({ suggestions }: { suggestions: Array<Suggestion> }) {
    try {
      return await this.db.insert(suggestion).values(suggestions);
    } catch (error) {
      console.error('Failed to save suggestions in database');
      throw error;
    }
  }

  async getSuggestionsByDocumentId({ documentId }: { documentId: string }): Promise<Array<Suggestion>> {
    try {
      return await this.db
        .select()
        .from(suggestion)
        .where(and(eq(suggestion.documentId, documentId)));
    } catch (error) {
      console.error(
        'Failed to get suggestions by document version from database',
      );
      throw error;
    }
  }

  async getMessageById({ id }: { id: string }): Promise<Array<Message>> {
    try {
      return await this.db.select().from(message).where(eq(message.id, id));
    } catch (error) {
      console.error('Failed to get message by id from database');
      throw error;
    }
  }

  async deleteMessagesByChatIdAfterTimestamp({ chatId, timestamp }: { chatId: string; timestamp: Date }) {
    try {
      const messagesToDelete = await this.db
        .select({ id: message.id })
        .from(message)
        .where(
          and(eq(message.chatId, chatId), gte(message.createdAt, timestamp)),
        );

      const messageIds = messagesToDelete.map((msg: { id: string }) => msg.id);

      if (messageIds.length > 0) {
        await this.db
          .delete(vote)
          .where(
            and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds)),
          );

        return await this.db
          .delete(message)
          .where(
            and(eq(message.chatId, chatId), inArray(message.id, messageIds)),
          );
      }
    } catch (error) {
      console.error(
        'Failed to delete messages by id after timestamp from database',
      );
      throw error;
    }
  }

  async updateChatVisiblityById({ chatId, visibility }: { chatId: string; visibility: 'private' | 'public' }) {
    try {
      return await this.db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
    } catch (error) {
      console.error('Failed to update chat visibility in database');
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
      return await this.db.insert(chat).values({
        id,
        createdAt: new Date(),
        userId,
        title,
        templates,
      });
    } catch (error) {
      console.error('Failed to save chat with templates in database');
      throw error;
    }
  }

  async updateChatTemplates({ id, templates }: { id: string; templates: Record<string, any> }) {
    try {
      return await this.db.update(chat)
        .set({ templates })
        .where(eq(chat.id, id));
    } catch (error) {
      console.error('Failed to update chat templates in database');
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
      const [result] = await this.db
        .select({ templates: chat.templates })
        .from(chat)
        .where(eq(chat.id, id));
      
      return result?.templates || null;
    } catch (error) {
      console.error('Error fetching templates:', error);
      return null;
    }
  }

  async getDocumentsByChatId({ chatId, templateType }: { chatId: string; templateType?: TemplateType }): Promise<Array<Document>> {
    try {
      const query = this.db
        .select()
        .from(document)
        .where(drizzleSql`${document.chatId} = ${chatId}`)
        .orderBy(desc(document.createdAt));

      const documents = await query;

      if (templateType) {
        return documents.filter((doc: Document) => 
          doc.metadata && (doc.metadata as DocumentMetadata).templateType === templateType
        );
      }

      return documents;
    } catch (error) {
      console.error('Failed to get documents by chat ID from database:', error);
      throw error;
    }
  }
} 