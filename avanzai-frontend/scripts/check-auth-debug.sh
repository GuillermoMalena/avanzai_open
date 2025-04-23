#!/bin/bash

# Check auth debug endpoint
echo "Checking authentication debug endpoint..."
curl -s http://localhost:3000/api/auth/debug | jq

echo ""
echo "Note: If you're not logged in, you'll see 'authenticated: false'"
echo "If you are logged in, you should see your Supabase user and database user details"
echo "To check UUID syncing, verify that:"
echo "1. supabaseUser.id exists and is not null"
echo "2. databaseUser exists and is not null"
echo "3. databaseUser.matchesSupabaseId is true" 