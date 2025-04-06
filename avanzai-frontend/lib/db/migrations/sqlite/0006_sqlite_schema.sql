-- Drop existing tables if they exist
DROP TABLE IF EXISTS "Suggestion";
DROP TABLE IF EXISTS "Document";
DROP TABLE IF EXISTS "Vote";
DROP TABLE IF EXISTS "Message";
DROP TABLE IF EXISTS "Chat";
DROP TABLE IF EXISTS "User";

-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create Chat table
CREATE TABLE IF NOT EXISTS "Chat" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL,
  "visibility" TEXT DEFAULT 'private',
  "templates" JSON,
  FOREIGN KEY ("userId") REFERENCES "User"("id")
);

-- Create Message table
CREATE TABLE IF NOT EXISTS "Message" (
  "id" TEXT PRIMARY KEY,
  "chatId" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL,
  FOREIGN KEY ("chatId") REFERENCES "Chat"("id")
);

-- Create Vote table
CREATE TABLE IF NOT EXISTS "Vote" (
  "id" TEXT PRIMARY KEY,
  "chatId" TEXT NOT NULL,
  "messageId" TEXT NOT NULL,
  "isUpvoted" BOOLEAN NOT NULL,
  FOREIGN KEY ("chatId") REFERENCES "Chat"("id"),
  FOREIGN KEY ("messageId") REFERENCES "Message"("id")
);

-- Create Document table
CREATE TABLE IF NOT EXISTS "Document" (
  "id" TEXT PRIMARY KEY,
  "chatId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "metadata" JSON,
  "createdAt" DATETIME NOT NULL,
  FOREIGN KEY ("chatId") REFERENCES "Chat"("id"),
  FOREIGN KEY ("userId") REFERENCES "User"("id")
);

-- Create Suggestion table
CREATE TABLE IF NOT EXISTS "Suggestion" (
  "id" TEXT PRIMARY KEY,
  "documentId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "originalText" TEXT NOT NULL,
  "suggestedText" TEXT NOT NULL,
  "description" TEXT,
  "isResolved" BOOLEAN DEFAULT FALSE,
  "createdAt" DATETIME NOT NULL,
  "documentCreatedAt" DATETIME NOT NULL,
  FOREIGN KEY ("documentId") REFERENCES "Document"("id"),
  FOREIGN KEY ("userId") REFERENCES "User"("id")
); 