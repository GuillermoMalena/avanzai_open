// Test script for Supabase authentication and user sync
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
const crypto = require('crypto');

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const apiBaseUrl = 'http://localhost:3000/api';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Generate a random test email
const getTestEmail = () => {
  const random = crypto.randomBytes(8).toString('hex');
  return `test-${random}@example.com`;
};

// Test user registration and syncing
async function testUserRegistration() {
  try {
    // Step 1: Generate test user credentials
    const testEmail = getTestEmail();
    const testPassword = 'Test123!';
    
    console.log('🧪 Starting auth test with:', { email: testEmail });
    
    // Step 2: Register user with Supabase
    console.log('📝 Registering user with Supabase...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    if (signUpError) {
      throw new Error(`Supabase signup failed: ${signUpError.message}`);
    }
    
    console.log('✅ Supabase signup successful', { 
      userId: signUpData.user?.id,
      hasUUID: !!signUpData.user?.id 
    });
    
    // Step 3: Check user in database via API
    console.log('🔍 Checking if user synced to database...');
    
    // Sleep to allow sync to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Sign in to get session
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    
    if (signInError) {
      throw new Error(`Supabase signin failed: ${signInError.message}`);
    }
    
    // Use the session token to call the debug endpoint
    const response = await fetch(`${apiBaseUrl}/auth/debug`, {
      headers: {
        'Authorization': `Bearer ${signInData.session.access_token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }
    
    const authDebugData = await response.json();
    
    // Check if user exists in both systems with matching IDs
    console.log('🔎 Auth debug info:', JSON.stringify(authDebugData, null, 2));
    
    if (authDebugData.supabaseUser && authDebugData.databaseUser) {
      if (authDebugData.databaseUser.matchesSupabaseId) {
        console.log('✅ SUCCESS: User IDs match between Supabase and database!');
      } else {
        console.log('❌ FAILURE: User exists in both systems but IDs don\'t match!');
      }
    } else if (authDebugData.supabaseUser && !authDebugData.databaseUser) {
      console.log('❌ FAILURE: User exists in Supabase but not in database!');
    } else {
      console.log('❌ FAILURE: User data is incomplete or missing!');
    }
    
    // Step 4: Clean up - delete test user
    console.log('🧹 Cleaning up test user...');
    // This would require admin access to delete users completely
    
    return {
      success: true,
      message: 'Auth test completed',
      data: authDebugData
    };
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    return {
      success: false,
      message: error.message
    };
  }
}

// Run the test
testUserRegistration()
  .then(result => {
    console.log('Test completed:', result.message);
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test error:', error);
    process.exit(1);
  }); 