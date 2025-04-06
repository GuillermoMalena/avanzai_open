import 'server-only';
import { getDatabase } from './index';
import type { DatabaseQueries } from './queries.interface';

// Get the database instance
const db = getDatabase();

// Export bound functions to maintain the correct 'this' context
export const getUser = (email: string) => db.getUser(email);
export const createUser = (email: string, password: string) => db.createUser(email, password);
export const saveChat = (params: Parameters<DatabaseQueries['saveChat']>[0]) => db.saveChat(params);
export const deleteChatById = (params: Parameters<DatabaseQueries['deleteChatById']>[0]) => db.deleteChatById(params);
export const getChatsByUserId = (params: Parameters<DatabaseQueries['getChatsByUserId']>[0]) => db.getChatsByUserId(params);
export const getChatById = (params: Parameters<DatabaseQueries['getChatById']>[0]) => db.getChatById(params);
export const saveMessages = (params: Parameters<DatabaseQueries['saveMessages']>[0]) => db.saveMessages(params);
export const getMessagesByChatId = (params: Parameters<DatabaseQueries['getMessagesByChatId']>[0]) => db.getMessagesByChatId(params);
export const voteMessage = (params: Parameters<DatabaseQueries['voteMessage']>[0]) => db.voteMessage(params);
export const getVotesByChatId = (params: Parameters<DatabaseQueries['getVotesByChatId']>[0]) => db.getVotesByChatId(params);
export const saveDocument = (params: Parameters<DatabaseQueries['saveDocument']>[0]) => db.saveDocument(params);
export const getDocumentsById = (params: Parameters<DatabaseQueries['getDocumentsById']>[0]) => db.getDocumentsById(params);
export const getDocumentById = (params: Parameters<DatabaseQueries['getDocumentById']>[0]) => db.getDocumentById(params);
export const deleteDocumentsByIdAfterTimestamp = (params: Parameters<DatabaseQueries['deleteDocumentsByIdAfterTimestamp']>[0]) => db.deleteDocumentsByIdAfterTimestamp(params);
export const saveSuggestions = (params: Parameters<DatabaseQueries['saveSuggestions']>[0]) => db.saveSuggestions(params);
export const getSuggestionsByDocumentId = (params: Parameters<DatabaseQueries['getSuggestionsByDocumentId']>[0]) => db.getSuggestionsByDocumentId(params);
export const getMessageById = (params: Parameters<DatabaseQueries['getMessageById']>[0]) => db.getMessageById(params);
export const deleteMessagesByChatIdAfterTimestamp = (params: Parameters<DatabaseQueries['deleteMessagesByChatIdAfterTimestamp']>[0]) => db.deleteMessagesByChatIdAfterTimestamp(params);
export const updateChatVisiblityById = (params: Parameters<DatabaseQueries['updateChatVisiblityById']>[0]) => db.updateChatVisiblityById(params);
export const createChatWithTemplates = (params: Parameters<DatabaseQueries['createChatWithTemplates']>[0]) => db.createChatWithTemplates(params);
export const updateChatTemplates = (params: Parameters<DatabaseQueries['updateChatTemplates']>[0]) => db.updateChatTemplates(params);
export const getChatTemplates = (params: Parameters<DatabaseQueries['getChatTemplates']>[0]) => db.getChatTemplates(params);
export const getDocumentsByChatId = (params: Parameters<DatabaseQueries['getDocumentsByChatId']>[0]) => db.getDocumentsByChatId(params);

export { releaseConnection } from './index';
