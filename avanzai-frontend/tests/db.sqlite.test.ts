import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { SQLiteQueries } from '../lib/db/queries.sqlite';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { sql } from 'drizzle-orm';

describe('SQLite Database Tests', () => {
  let db: ReturnType<typeof drizzle>;
  let queries: SQLiteQueries;
  let sqlite: InstanceType<typeof Database>;

  beforeAll(() => {
    // Create a new SQLite database for testing
    sqlite = new Database('test.db');
    db = drizzle(sqlite);
    queries = new SQLiteQueries(db);

    // Run migrations
    migrate(db, { migrationsFolder: './lib/db/sqlite/migrations' });
  });

  afterAll(async () => {
    // Clean up test database
    sqlite.close();
    // Delete the test database file
    const fs = require('fs');
    if (fs.existsSync('test.db')) {
      fs.unlinkSync('test.db');
    }
  });

  it('should create and retrieve a user', async () => {
    const testEmail = 'test@example.com';
    const testPassword = 'password123';

    // Create user
    await queries.createUser(testEmail, testPassword);

    // Retrieve user
    const users = await queries.getUser(testEmail);
    expect(users).toHaveLength(1);
    expect(users[0].email).toBe(testEmail);
  });

  it('should create and retrieve a chat', async () => {
    const testUserId = 'test-user-id';
    const testTitle = 'Test Chat';
    const chatId = 'test-chat-id';

    // Create chat
    await queries.saveChat({ id: chatId, userId: testUserId, title: testTitle });

    // Retrieve chat
    const chat = await queries.getChatById({ id: chatId });
    expect(chat).toBeDefined();
    expect(chat?.title).toBe(testTitle);
    expect(chat?.userId).toBe(testUserId);
  });

  it('should create and retrieve messages', async () => {
    const testChatId = 'test-chat-id';
    const testMessage = {
      id: 'test-message-id',
      chatId: testChatId,
      role: 'user',
      content: 'Hello, world!',
      createdAt: new Date()
    };

    // Create message
    await queries.saveMessages({ messages: [testMessage] });

    // Retrieve messages
    const messages = await queries.getMessagesByChatId({ id: testChatId });
    expect(messages).toHaveLength(1);
    expect(messages[0].content).toBe(testMessage.content);
  });
}); 