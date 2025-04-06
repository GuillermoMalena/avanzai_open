CREATE TABLE IF NOT EXISTS "Vote" (
  "id" TEXT PRIMARY KEY,
  "chatId" TEXT NOT NULL,
  "messageId" TEXT NOT NULL,
  "isUpvoted" BOOLEAN NOT NULL,
  FOREIGN KEY ("chatId") REFERENCES "Chat"("id"),
  FOREIGN KEY ("messageId") REFERENCES "Message"("id")
); 