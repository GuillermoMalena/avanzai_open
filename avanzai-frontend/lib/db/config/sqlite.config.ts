import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import path from 'path';
import fs from 'fs';

export const createSqliteConnection = (): BetterSQLite3Database => {
  // Log current directory context
  console.log('Current working directory:', process.cwd());
  console.log('__dirname:', __dirname);
  
  // Use DATABASE_URL from environment or construct absolute path to allie.db in project root
  const dbPath = process.env.DATABASE_URL?.replace('file:', '') || path.join(process.cwd(), 'allie.db');
  console.log('Initializing SQLite connection with path:', dbPath);
  
  // Check if directory exists
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    console.log('Creating database directory:', dbDir);
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  // Check if we can access the file
  try {
    fs.accessSync(dbPath, fs.constants.R_OK | fs.constants.W_OK);
    console.log('Database file is accessible');
  } catch (e) {
    console.log('Database file is not accessible, will try to create it');
  }

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