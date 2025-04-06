import type { InferSelectModel } from 'drizzle-orm';
import {
  sqliteTable,
  text,
  integer,
  primaryKey
} from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('User', {
  id: text('id').primaryKey().notNull(),
  email: text('email').notNull(),
  password: text('password'),
});

export type User = InferSelectModel<typeof user>;

export const chat = sqliteTable('Chat', {
  id: text('id').primaryKey().notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  title: text('title').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id),
  visibility: text('visibility', { enum: ['public', 'private'] })
    .notNull()
    .default('private'),
  templates: text('templates', { mode: 'json' }).$type<Record<string, any>>(),
});

export type Chat = InferSelectModel<typeof chat>;

export const message = sqliteTable('Message', {
  id: text('id').primaryKey().notNull(),
  chatId: text('chatId')
    .notNull()
    .references(() => chat.id),
  role: text('role').notNull(),
  content: text('content').notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
});

export type Message = InferSelectModel<typeof message>;

export const vote = sqliteTable('Vote', {
  chatId: text('chatId')
    .notNull()
    .references(() => chat.id),
  messageId: text('messageId')
    .notNull()
    .references(() => message.id),
  isUpvoted: integer('isUpvoted', { mode: 'boolean' }).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.chatId, table.messageId] }),
}));

export type Vote = InferSelectModel<typeof vote>;

export const document = sqliteTable('Document', {
  id: text('id').primaryKey().notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  kind: text('kind', { enum: ['text', 'code', 'image', 'sheet'] })
    .notNull()
    .default('text'),
  userId: text('userId')
    .notNull()
    .references(() => user.id),
  chatId: text('chatId')
    .notNull()
    .references(() => chat.id),
  metadata: text('metadata', { mode: 'json' }).$type<Record<string, any>>(),
});

export type Document = InferSelectModel<typeof document>;

export const suggestion = sqliteTable('Suggestion', {
  id: text('id').primaryKey().notNull(),
  documentId: text('documentId')
    .notNull()
    .references(() => document.id),
  documentCreatedAt: integer('documentCreatedAt', { mode: 'timestamp' }).notNull(),
  originalText: text('originalText').notNull(),
  suggestedText: text('suggestedText').notNull(),
  description: text('description'),
  isResolved: integer('isResolved', { mode: 'boolean' }).notNull().default(false),
  userId: text('userId')
    .notNull()
    .references(() => user.id),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
});

export type Suggestion = InferSelectModel<typeof suggestion>; 