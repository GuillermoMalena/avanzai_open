DO $$ BEGIN
    ALTER TABLE "Chat" ADD COLUMN "visibility" varchar DEFAULT 'private' NOT NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;