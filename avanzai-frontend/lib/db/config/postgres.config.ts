import { PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

export const createPostgresConnection = (): PostgresJsDatabase => {
  const connectionString = process.env.POSTGRES_URL!;
  
  const postgresClient = postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: {
      rejectUnauthorized: false
    },
  });

  return drizzle(postgresClient);
};

export const closePostgresConnection = async (client: postgres.Sql) => {
  try {
    await client.end({ timeout: 5 });
    console.log('PostgreSQL connection closed successfully');
  } catch (error) {
    console.error('Error closing PostgreSQL connection:', error);
  }
}; 