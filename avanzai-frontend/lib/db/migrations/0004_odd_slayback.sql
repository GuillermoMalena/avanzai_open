DO $$ BEGIN
    ALTER TABLE "Document" ADD COLUMN "text" varchar DEFAULT 'text' NOT NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;