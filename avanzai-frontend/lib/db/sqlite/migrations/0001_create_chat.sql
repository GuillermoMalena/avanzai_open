CREATE TABLE IF NOT EXISTS "Chat" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL,
  "visibility" TEXT DEFAULT 'private',
  "templates" JSON,
  FOREIGN KEY ("userId") REFERENCES "User"("id")
); 