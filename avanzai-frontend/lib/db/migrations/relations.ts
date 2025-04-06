import { relations } from "drizzle-orm/relations";
import { user, suggestion, document, chat, message, vote } from "./schema";

export const suggestionRelations = relations(suggestion, ({one}) => ({
	user: one(user, {
		fields: [suggestion.userId],
		references: [user.id]
	}),
	document: one(document, {
		fields: [suggestion.documentId],
		references: [document.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	suggestions: many(suggestion),
	chats: many(chat),
	documents: many(document),
}));

export const documentRelations = relations(document, ({one, many}) => ({
	suggestions: many(suggestion),
	user: one(user, {
		fields: [document.userId],
		references: [user.id]
	}),
}));

export const messageRelations = relations(message, ({one, many}) => ({
	chat: one(chat, {
		fields: [message.chatId],
		references: [chat.id]
	}),
	votes: many(vote),
}));

export const chatRelations = relations(chat, ({one, many}) => ({
	messages: many(message),
	user: one(user, {
		fields: [chat.userId],
		references: [user.id]
	}),
	votes: many(vote),
}));

export const voteRelations = relations(vote, ({one}) => ({
	chat: one(chat, {
		fields: [vote.chatId],
		references: [chat.id]
	}),
	message: one(message, {
		fields: [vote.messageId],
		references: [message.id]
	}),
}));