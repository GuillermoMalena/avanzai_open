import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

config({
  path: '.env.local',
});

const runMigrate = async () => {
  if (!process.env.POSTGRES_URL_NON_POOLING) {
    throw new Error('POSTGRES_URL_NON_POOLING is not defined');
  }

  // Create a dedicated connection for migration, not using the connection pool
  const connection = postgres(process.env.POSTGRES_URL_NON_POOLING, { 
    max: 1, // Only need one connection for migration
    idle_timeout: 0, // No idle timeout during migration
    connect_timeout: 30, // Longer connect timeout for migrations
    ssl: {
      rejectUnauthorized: false // More permissive SSL for development
    }
  });
  const db = drizzle(connection);

  console.log('⏳ Running migrations...');

  const start = Date.now();
  
  try {
    await migrate(db, { migrationsFolder: './lib/db/migrations' });
    const end = Date.now();
    console.log('✅ Migrations completed in', end - start, 'ms');
  } catch (error) {
    console.error('❌ Migration failed', error);
    throw error;
  } finally {
    // Always close this specific connection
    await connection.end({ timeout: 10 });
    console.log('Migration database connection closed');
  }
};

runMigrate().catch((err) => {
  console.error('❌ Migration failed');
  console.error(err);
  process.exit(1);
});
