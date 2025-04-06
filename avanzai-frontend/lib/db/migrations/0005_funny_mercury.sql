DO $$ BEGIN
    ALTER TABLE "Chat" ADD COLUMN "templates" json DEFAULT '{}'::json NOT NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;