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