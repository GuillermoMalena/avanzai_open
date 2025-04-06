# Database Connection Management

This document outlines how we manage PostgreSQL database connections in our application to prevent connection leaks.

## Connection Pooling

In `lib/db/queries.ts`, we've configured a PostgreSQL connection pool with appropriate settings:

```typescript
const postgresClient = postgres(process.env.POSTGRES_URL!, {
  max: 10, // Maximum number of connections in the pool
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout of 10 seconds
});
```

Benefits of this pooling approach:
1. Efficiently reuses connections instead of creating new ones for each request
2. Automatically handles connection lifecycle management
3. Prevents "CONNECTION_ENDED" errors by not closing connections prematurely
4. Scales better under concurrent loads

## Connection Management

Instead of explicitly closing connections after each use, we now release them back to the pool:

```typescript
export async function releaseConnection() {
  // This is a no-op in the connection pool model
  // The connection will go back to the pool automatically after the query completes
  console.log('Connection released back to the pool');
}
```

We've maintained backward compatibility with:
```typescript
export const closeDbConnection = releaseConnection;
```

## Application Shutdown

For proper application shutdown, we provide a function to close all connections:

```typescript
export async function closeAllConnections() {
  try {
    await postgresClient.end({ timeout: 5 });
    console.log('All database connections closed successfully');
  } catch (error) {
    console.error('Error closing all database connections:', error);
  }
}
```

## API Route Handling

Our API routes still use the `withDbCleanup` higher-order function, but now it releases connections back to the pool:

```typescript
export function withDbCleanup(handler: Function) {
  return async (...args: any[]) => {
    try {
      // Execute the original handler
      const result = await handler(...args);
      return result;
    } finally {
      // Connection will be released back to the pool automatically
      // We're just logging this for clarity
      releaseConnection().catch(error => {
        console.error('Error releasing connection back to pool:', error);
      });
    }
  };
}
```

## Data Stream Handling

For streaming API responses (like those in chat), we still use a try-finally approach:

```typescript
try {
  // Stream processing logic
} finally {
  // Release connection back to the pool when stream completes
  releaseConnection().catch(err => {
    console.error('Error releasing connection back to pool after stream completion:', err);
  });
}
```

## Migration Scripts

DB migration scripts in `lib/db/migrate.ts` should still use a try-finally pattern, but now they should explicitly close the specific connection used for migration (not the pool):

```typescript
const connection = postgres(process.env.POSTGRES_URL, { max: 1 });

try {
  await migrate(db, { migrationsFolder: './lib/db/migrations' });
  // ...
} finally {
  // Close the specific connection used for migration
  await connection.end();
  console.log('Migration database connection closed');
}
```

## Best Practices

When writing new database operations:

1. Always wrap API handlers with `withDbCleanup`
2. For long-running operations or streams, use try-finally blocks with `releaseConnection`
3. Don't create new database client instances; use the shared pool from `lib/db/queries.ts`
4. Let the pool handle connection lifecycle by default
5. Only use `closeAllConnections` during application shutdown 