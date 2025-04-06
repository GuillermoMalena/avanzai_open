// Connection pool test script
// Run with: node scripts/test-connection-pool.js

require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');

async function testConnectionPool() {
  console.log('Testing PostgreSQL connection pool...');
  
  // Create a connection pool similar to our application
  const sql = postgres(process.env.POSTGRES_URL, {
    max: 5,  // Maximum pool size
    idle_timeout: 20,  // 20 second idle timeout
    connect_timeout: 10,  // 10 second connect timeout
    debug: true  // Show more debugging info
  });
  
  try {
    // Run 10 parallel queries to test pooling
    console.log('Running 10 parallel queries...');
    const promises = Array(10).fill().map((_, i) => 
      sql`SELECT pg_sleep(${i % 3 + 1}), ${i} as query_num`.then(
        result => console.log(`Query ${i} completed:`, result[0].query_num)
      )
    );
    
    // Wait for all queries to complete
    await Promise.all(promises);
    console.log('All queries completed successfully!');
    
    // Test proper release back to pool
    console.log('Testing connection release...');
    const result = await sql`SELECT NOW()`;
    console.log('Pool query after release worked:', result[0].now);
    
    // Properly end all connections
    console.log('Ending connection pool...');
    await sql.end({ timeout: 5 });
    console.log('Connection pool closed successfully');
  } catch (error) {
    console.error('Error testing connection pool:', error);
  }
}

// Run the test
testConnectionPool().catch(console.error); 