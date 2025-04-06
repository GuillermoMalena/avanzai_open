import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';

export const createSqliteConnection = (): BetterSQLite3Database => {
  // Use DATABASE_URL from environment or fall back to allie.db
  const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './allie.db';
  console.log('Initializing SQLite connection with path:', dbPath);
  const sqlite = new Database(dbPath);
  
  return drizzle(sqlite);
};

export const closeSqliteConnection = async (db: Database.Database) => {
  try {
    db.close();
    console.log('SQLite connection closed successfully');
  } catch (error) {
    console.error('Error closing SQLite connection:', error);
  }
}; 