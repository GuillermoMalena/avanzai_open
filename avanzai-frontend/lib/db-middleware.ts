import { releaseConnection } from './db/queries';

/**
 * Wraps an API handler with database connection management
 * @param handler The original API handler function
 * @returns A new handler that properly manages DB connections
 */
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