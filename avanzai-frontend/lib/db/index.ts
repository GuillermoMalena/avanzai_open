import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { createPostgresConnection } from './config/postgres.config';
import { createSqliteConnection } from './config/sqlite.config';
import { PostgresQueries } from './queries.postgres';
import { SQLiteQueries } from './queries.sqlite';
import type { DatabaseQueries } from './queries.interface';

let dbQueries: DatabaseQueries;
let postgresDb: PostgresJsDatabase | null = null;

export const initializeDatabase = (): DatabaseQueries => {
  if (dbQueries) {
    return dbQueries;
  }

  const dbType = process.env.DATABASE_TYPE?.toLowerCase() || 'postgres';

  if (dbType === 'sqlite') {
    const db = createSqliteConnection();
    dbQueries = new SQLiteQueries(db);
  } else {
    postgresDb = createPostgresConnection();
    dbQueries = new PostgresQueries(postgresDb);
  }

  return dbQueries;
};

export const getDatabase = (): DatabaseQueries => {
  if (!dbQueries) {
    dbQueries = initializeDatabase();
  }
  return dbQueries;
};

export const releaseConnection = async () => {
  if (postgresDb) {
    try {
      // For PostgreSQL, we need to end the connection
      await (postgresDb as any)?.end?.();
      postgresDb = null;
    } catch (error) {
      console.error('Error releasing PostgreSQL connection:', error);
    }
  }
  // SQLite connections don't need to be released as they're managed automatically
};

// Re-export the interface for type checking
export type { DatabaseQueries } from './queries.interface'; 