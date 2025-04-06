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